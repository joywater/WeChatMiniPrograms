#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 utils/defaultData.ts 生成试听页 design-assets/voice-demo/index.html 的音频清单。

保证试听页的文件名与产品词条命名完全一致（<分类>_<名称>.mp3）。
改完词条或重生成音频后跑一次：
  python scripts/build_demo_page.py
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_TS = ROOT / "utils" / "defaultData.ts"
VOICE_DIR = ROOT / "assets" / "voice"
DEMO = ROOT.parent / "design-assets" / "voice-demo" / "index.html"

CAT_CN = {"family": "人物", "animal": "动物", "color": "颜色", "shape": "形状",
          "language": "语言"}

RE_CAT = re.compile(r"^\s{2}(\w+):\s*\[")
RE_ID = re.compile(r"id:\s*'([^']+)'")
RE_LABEL = re.compile(r"label:\s*'([^']*)'")
RE_SAY = re.compile(r"say:\s*'([^']*)'")


def collect():
    rows, cat = [], ""
    for line in DATA_TS.read_text(encoding="utf-8").splitlines():
        m = RE_CAT.match(line)
        if m:
            cat = m.group(1)
            continue
        if not RE_ID.search(line):
            continue
        ml = RE_LABEL.search(line)
        if not ml:
            continue
        label = ml.group(1)
        ms = RE_SAY.search(line)
        say = ms.group(1) if ms else label
        fname = f"{cat}_{label}.mp3"
        rows.append({
            "file": fname,
            "label": label,
            "say": say,
            "cat": CAT_CN.get(cat, cat),
            "exists": (VOICE_DIR / fname).exists(),
        })
    return rows


def main():
    rows = collect()
    if not rows:
        sys.exit("未解析到任何词条，检查 defaultData.ts 格式")

    missing = [r["file"] for r in rows if not r["exists"]]
    data = [[r["file"], r["label"], r["say"], r["cat"]] for r in rows]
    js = "const items = [\n" + ",\n".join(
        "  " + json.dumps(d, ensure_ascii=False).replace('"', "'") for d in data
    ) + "\n];"

    html = DEMO.read_text(encoding="utf-8")
    html = re.sub(r"const items = \[[\s\S]*?\n\];", js, html)
    DEMO.write_text(html, encoding="utf-8")

    print(f"写入 {len(rows)} 条 -> {DEMO}")
    if missing:
        print(f"缺音频 {len(missing)} 条: {', '.join(missing[:5])}"
              + (" ..." if len(missing) > 5 else ""))


if __name__ == "__main__":
    main()
