#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成「宝宝认一认」的朗读音频（腾讯云语音合成 TextToVoice）。

为什么预生成：WechatSI 插件音色固定不可调、听感机械；预生成 mp3 打进代码包可
本地零延迟播放，音色可换。

文件命名与产品数据一致：<分类>_<名称>.mp3，例如
  family_爸爸.mp3   animal_小狗.mp3   color_红色.mp3   shape_圆形.mp3
一眼能看出这个音频对应哪个词条，不依赖 a1/f1 这类内部编号。

用法：
  python scripts/gen_voice.py --dry-run          # 只看清单，不联网
  python scripts/gen_voice.py --limit 3          # 只跑前 3 条试听
  python scripts/gen_voice.py --force            # 全量重新生成（覆盖旧文件）
  python scripts/gen_voice.py --sync-only        # 不调 API，只按新规则改名 + 修路径

环境变量（必需）：
  TENCENT_SECRET_ID / TENCENT_SECRET_KEY
  在腾讯云控制台 → 访问管理 → API 密钥管理 获取

音色（--voice，默认 403000）：
  403000  云小朵 · 特色女童声   超自然大模型 2.0，支持 24kHz（当前选用）
  403008  云小洋 · 机灵男童     超自然大模型，备选
  502007  智小虎 · 聊天童声     超自然大模型，备选
  101016  智甜 · 女童声         精品音色（旧版），仅支持 16kHz
  101015  智萌 · 男童声         精品音色，仅支持 16kHz

计费：超自然大模型 2.0 音色 2.5 元/万字符；控制台可领 2 万字符免费包。
  全量 96 条约 800 字符，通常在免费额度内；即使付费也不足 1 元。

产出：
  pkgContent/assets/voice/<分类>_<名称>.mp3 （24kHz 单声道 22kbps，每条约 6~10KB）
  并自动把 audio 字段同步进 utils/defaultData.ts

听感处理（面向 0-3 岁儿向语）：
  · 24kHz 音源：高频上限 12kHz（旧版 16kHz 仅 8kHz，童声清亮泛音被截断）
  · 语速 -0.6：比默认略慢，给宝宝留出加工时间
  · loudnorm I=-19 / LRA=7：响度更柔和、保留语调起伏（旧版 LRA=11 压平了抑扬顿挫）
  · 3kHz 轻微提升 1.5dB：补足齿音与齿擦音清晰度
  · 裁掉 TTS 自带的首尾静音（各留 0.1s）：句间停顿保留，消除起始爆音与冗余体积
  · 22kbps：比旧版 16kbps 高一档，同时靠裁静音把音频总量控制在约 690KB

依赖：ffmpeg；其余仅用 Python 标准库
"""

import argparse
import base64
import hashlib
import hmac
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent          # babyspot/
DATA_TS = ROOT / "utils" / "defaultData.ts"
VOICE_DIR = ROOT / "pkgContent" / "assets" / "voice"

RE_ID = re.compile(r"id:\s*'([^']+)'")
RE_SAY = re.compile(r"say:\s*'([^']*)'")
RE_LABEL = re.compile(r"label:\s*'([^']*)'")
RE_AUDIO_FIELD = re.compile(r"audio:\s*'[^']*'")

DEFAULT_VOICE = "403000"   # 云小朵 · 特色女童声（超自然大模型 2.0，支持 24kHz）
DEFAULT_SPEED = -0.6       # 语速 -2~6，0 为正常，负数放慢；-0.6 约 0.85 倍速
MAX_RETRY = 4              # 网络抖动重试次数


# ---------------------------------------------------------------- 文案解析

def parse_items():
    """从 defaultData.ts 提取词条，返回 [dict(id,label,say,cat)]，保持文件顺序。"""
    out = []
    cat = ""
    for raw in DATA_TS.read_text(encoding="utf-8").splitlines():
        m_cat = re.search(r"^\s{2}(\w+):\s*\[", raw)
        if m_cat:
            cat = m_cat.group(1)
            continue
        m_id = RE_ID.search(raw)
        if not m_id:
            continue
        m_say = RE_SAY.search(raw)
        m_label = RE_LABEL.search(raw)
        label = m_label.group(1).strip() if m_label else ""
        say = m_say.group(1).strip() if m_say else label
        if say:
            out.append({"id": m_id.group(1), "label": label, "say": say, "cat": cat})
    return out


def safe_name(label: str) -> str:
    """去掉文件名非法字符，保留中文。"""
    return re.sub(r'[\\/:*?"<>|\s]', "", label)


def voice_filename(item) -> str:
    """音频文件名：<分类>_<名称>.mp3，如 family_爸爸.mp3"""
    if item["label"]:
        return f"{item['cat']}_{safe_name(item['label'])}.mp3"
    return f"{item['cat']}_{item['id']}.mp3"


def audio_path(item) -> str:
    return f"/pkgContent/assets/voice/{voice_filename(item)}"


# ---------------------------------------------------------------- 腾讯云 TTS

def _hmac(key: bytes, msg: str) -> bytes:
    return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()


def tts_tencent(text, voice, dst, secret_id, secret_key, speed):
    """腾讯云语音合成 TextToVoice（TC3-HMAC-SHA256 签名，纯标准库实现）。"""
    host = "tts.tencentcloudapi.com"
    service = "tts"
    action = "TextToVoice"
    version = "2019-08-23"

    payload = json.dumps({
        "Text": text,
        "SessionId": hashlib.md5(text.encode("utf-8")).hexdigest()[:20],
        "VoiceType": int(voice),
        "Volume": 0,
        "Speed": speed,          # 范围 -2~6，0 为正常
        "SampleRate": 24000,     # 超自然大模型 2.0 支持 8k/16k/24k；24k 高频上限 12kHz
        "Codec": "mp3",
        "ModelType": 1,
        "PrimaryLanguage": 1,
        "ProjectId": 0,
    }, ensure_ascii=False, separators=(",", ":"))

    timestamp = int(time.time())
    date = time.strftime("%Y-%m-%d", time.gmtime(timestamp))
    ct = "application/json; charset=utf-8"
    canonical_headers = f"content-type:{ct}\nhost:{host}\n"
    signed_headers = "content-type;host"
    hashed_payload = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    canonical_request = f"POST\n/\n\n{canonical_headers}\n{signed_headers}\n{hashed_payload}"

    credential_scope = f"{date}/{service}/tc3_request"
    string_to_sign = (f"TC3-HMAC-SHA256\n{timestamp}\n{credential_scope}\n"
                      + hashlib.sha256(canonical_request.encode("utf-8")).hexdigest())
    k_date = _hmac(("TC3" + secret_key).encode("utf-8"), date)
    k_signing = _hmac(_hmac(k_date, service), "tc3_request")
    signature = hmac.new(k_signing, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()

    auth = (f"TC3-HMAC-SHA256 Credential={secret_id}/{credential_scope}, "
            f"SignedHeaders={signed_headers}, Signature={signature}")

    req = urllib.request.Request(
        f"https://{host}",
        data=payload.encode("utf-8"),
        headers={
            "Authorization": auth,
            "Content-Type": ct,
            "Host": host,
            "X-TC-Action": action,
            "X-TC-Version": version,
            "X-TC-Timestamp": str(timestamp),
            "X-TC-Region": "ap-guangzhou",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read().decode("utf-8"))

    resp = data.get("Response", {})
    if "Error" in resp:
        raise RuntimeError(f"{resp['Error'].get('Code')}: {resp['Error'].get('Message')}")
    audio = resp.get("Audio")
    if not audio:
        raise RuntimeError(f"返回中无 Audio 字段: {json.dumps(resp, ensure_ascii=False)[:200]}")
    dst.write_bytes(base64.b64decode(audio))


def tts_with_retry(text, voice, dst, secret_id, secret_key, speed):
    """网络抖动（502/timeout）自动重试；业务错误（参数/额度）直接抛出，不重试。"""
    last = None
    for attempt in range(MAX_RETRY):
        try:
            return tts_tencent(text, voice, dst, secret_id, secret_key, speed)
        except urllib.error.URLError as e:
            last = e
            time.sleep(1.2 * (attempt + 1))
        except RuntimeError as e:
            msg = str(e)
            if any(k in msg for k in ("InvalidParameter", "UnsupportedOperation", "AuthFailure")):
                raise
            last = e
            time.sleep(1.2 * (attempt + 1))
    raise last


# ---------------------------------------------------------------- 音频后处理

def ffmpeg_convert(src, dst, normalize=True):
    """儿向语听感后处理：裁首尾静音 → 淡入 → 高频轻补 → 柔和响度。

    TTS 返回自带约 0.45s 首静音 + 0.2s 尾静音（占单条时长 20%）；裁掉后
    句间标点停顿完整保留，单条可省约 18% 体积，为 24kHz 音源腾出包体空间。
    """
    # 首静音裁到保留 0.10s；再用 areverse 把尾静音裁到保留 0.12s
    trim_start = ("silenceremove=start_periods=1:start_duration=0:"
                  "start_threshold=-45dB:start_silence=0.10")
    trim_end = ("areverse," + trim_start.replace("0.10", "0.12") + ",areverse")
    filters = [trim_start, trim_end, "asetpts=N/SR/TB",
               "afade=t=in:st=0:d=0.05",
               "equalizer=f=3000:t=q:w=1.2:g=1.5"]
    if normalize:
        # LRA=7 保留语调起伏（旧版 11 会把抑扬顿挫压平）；I=-19 比 -16 柔和 3dB
        filters.append("loudnorm=I=-19:TP=-2:LRA=7")
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
           "-ac", "1", "-ar", "24000", "-b:a", "22k",
           "-af", ",".join(filters)]
    cmd.append(str(dst))
    subprocess.run(cmd, check=True)


# ---------------------------------------------------------------- 数据同步

def sync_audio_fields(items):
    """把 audio 字段同步为 <分类>_<名称>.mp3（已有则替换，没有则插入）。"""
    lines = DATA_TS.read_text(encoding="utf-8").splitlines(keepends=True)
    by_id = {it["id"]: it for it in items}
    changed = 0
    for i, raw in enumerate(lines):
        m = RE_ID.search(raw)
        if not m or m.group(1) not in by_id:
            continue
        want = f"audio: '{audio_path(by_id[m.group(1)])}'"
        if RE_AUDIO_FIELD.search(raw):
            new = RE_AUDIO_FIELD.sub(want, raw, count=1)
            if new != raw:
                lines[i] = new
                changed += 1
        else:
            idx = raw.rfind("}")
            if idx < 0:
                continue
            head = raw[:idx].rstrip()
            if not head.endswith(","):
                head += ","
            lines[i] = f"{head} {want} " + raw[idx:]
            changed += 1
    if changed:
        DATA_TS.write_text("".join(lines), encoding="utf-8")
    return changed


def rename_legacy(ids):
    """把旧的 <id>.mp3 重命名为 <分类>_<名称>.mp3（内容不变，不调 API）。"""
    renamed = 0
    for it in parse_items():
        old = VOICE_DIR / f"{it['id']}.mp3"
        new = VOICE_DIR / voice_filename(it)
        if old.exists() and not new.exists():
            old.rename(new)
            renamed += 1
    return renamed


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default=DEFAULT_VOICE, help=f"音色 ID，默认 {DEFAULT_VOICE}")
    ap.add_argument("--speed", type=float, default=DEFAULT_SPEED, help="语速 -2~6，默认 -0.4")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--force", action="store_true", help="已存在的音频也重新生成")
    ap.add_argument("--limit", type=int, default=0, help="只生成前 N 条（试听用）")
    ap.add_argument("--sync-only", action="store_true", help="只按新命名规则改名 + 修路径，不调 API")
    ap.add_argument("--no-normalize", action="store_true")
    args = ap.parse_args()

    items = parse_items()
    if args.limit:
        items = items[:args.limit]

    if args.sync_only:
        n = rename_legacy(set())
        c = sync_audio_fields(items)
        print(f"重命名 {n} 个文件，同步 audio 字段 {c} 处")
        return

    print(f"词条 {len(items)} 条 | 音色={args.voice} | 语速={args.speed:+.1f}")

    if args.dry_run:
        for i, it in enumerate(items, 1):
            print(f"{i:2d}. {voice_filename(it):24s} {it['say']}")
        return

    secret_id = os.environ.get("TENCENT_SECRET_ID", "")
    secret_key = os.environ.get("TENCENT_SECRET_KEY", "")
    if not secret_id or not secret_key:
        sys.exit("缺少腾讯云密钥：设置 TENCENT_SECRET_ID 与 TENCENT_SECRET_KEY")

    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    tmp = VOICE_DIR / "_tmp.raw.mp3"
    done, failed = [], []
    for i, it in enumerate(items, 1):
        out = VOICE_DIR / voice_filename(it)
        if out.exists() and not args.force:
            done.append(it["id"])
            print(f"{i:2d}/{len(items)} {voice_filename(it)} 跳过（已存在）")
            continue
        try:
            tts_with_retry(it["say"], args.voice, tmp, secret_id, secret_key, args.speed)
            ffmpeg_convert(tmp, out, normalize=not args.no_normalize)
            done.append(it["id"])
            print(f"{i:2d}/{len(items)} {voice_filename(it)}\t{out.stat().st_size // 1024}KB  {it['say']}")
            time.sleep(0.4)  # 轻微限速，避免触发并发限制
        except Exception as e:
            failed.append((it["id"], str(e)))
            print(f"{i:2d}/{len(items)} {voice_filename(it)} 失败: {e}")

    if tmp.exists():
        tmp.unlink()

    changed = sync_audio_fields(items)
    total_kb = sum(p.stat().st_size for p in VOICE_DIR.glob("*.mp3")) // 1024
    print(f"\n完成 {len(done)} 条，失败 {len(failed)} 条，同步 audio 字段 {changed} 处")
    print(f"pkgContent/assets/voice 总体积 {total_kb}KB")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
