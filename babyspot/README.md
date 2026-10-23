# 宝宝认一认（BabySpot）

面向 0-3 岁婴幼儿的认知启蒙微信小程序：宝宝点击图片即听到普通话朗读，使用内置默认图库（7 分类 / 120 词条）。需求见 `../宝宝认一认-需求文档.md`。

- 开发语言：**TypeScript 单源**（仓库只有 `.ts`，`project.config.json` 配置 `useCompilerPlugins: ["typescript"]`，开发者工具在上传/预览时自动编译）
- AppID：`wxbce259ccde236dd3`（个人主体「宝宝认一认」）
- 语音：**全部本地预生成 mp3**（内容分包 `pkgContent/assets/voice/`，96 条；腾讯云 TTS 音色 `403000` 云小朵·特色女童声，24kHz / 24kbps，语速 -0.6），**不依赖任何在线合成插件**（WechatSI 已于 v1.0.6 移除）
- 包结构：**主包 + 单个内容分包**（v1.1.9 起）

## 发布方式（重要）

`.ts` 单源下 **WorkBuddy 卡片发布不可用**（其打包不执行 TS 编译，只认 `.js`）。发布走开发者工具编译管线：

- 手动：开发者工具 → 上传（填版本号）→ 后台「版本管理」选为体验版
- 命令行：让 WorkBuddy 执行 `wechatide upload --project ... --upload-version x.y.z`（需工具已打开）

注意：`.ts` 改完必须让开发者工具**重新编译/上传**才生效；**改动 `app.json` 或分包目录后，建议关闭项目重新打开再编译**，避免工具缓存旧的页面注册。

## 目录结构

```
babyspot/
├── app.json                     # 主包：pages 只注册首页；subPackages + preloadRule
├── app.ts / app.wxss            # 主包：全局样式与 usageSeconds 计时
├── sitemap.json / tsconfig.json / typings/
├── pages/
│   └── index/                   # 首页（主包，唯一启动页）
├── assets/images/
│   ├── cats/                    # 7 张分类封面（主包，透明底 PNG）
│   └── share.jpg                # 分享封面（主包，分包页面可引用）
├── utils/                       # 公共代码（主包，分包单向引用）
│   ├── defaultData.ts           # 7 分类 120 词条；资源路径指向分包
│   ├── tts.ts                   # 播放调度：单条 / 连播 / 音效接播
│   └── ad.ts                    # 首页 banner 广告位配置
├── pkgContent/                  # 内容分包 root（subPackages.root）
│   ├── pages/
│   │   ├── gallery/             # 图库页
│   │   └── preview/             # 黑白卡全屏预览页
│   └── assets/
│       ├── images/              # animal / bw / color / family / job / shape
│       ├── voice/               # 96 条朗读 mp3
│       └── sfx/                 # 6 条动物音效
└── scripts/                     # 生成脚本（packOptions.ignore 排除，不入包）
    ├── gen_voice.py             # 生成朗读音频并回写 audio 字段
    ├── gen_bw_extra.py          # 生成黑白卡图案
    └── build_demo_page.py       # 生成试听页清单
```

## 分包结构（v1.1.9）

| | 主包 | 内容分包 `pkgContent` |
|---|---|---|
| 页面 | 首页 | 图库页、全屏预览页 |
| 素材 | 7 张分类封面、分享图 | 6 个分类词条图、96 条语音、6 条音效 |
| 代码 | `app.*`、`utils/`、首页 | 两个内容页 |
| 体积 | 约 0.23MB | 约 1.70MB |

- 硬限制：主包 ≤ 2MB、单个分包 ≤ 2MB、总包 ≤ 30MB
- `app.json` 里 `subPackages[].pages` 写**相对 root** 的路径；`wx.navigateTo`、`<image src>`、`audio`、`onShareAppMessage.path` 一律写**绝对路径** `/pkgContent/...`
- 分包可单向引用主包代码与资源；主包不引用分包资源；分包之间不互相引用
- 不设 `independent: true`：`globalData.usageSeconds` 依赖主包 `app.ts`
- `preloadRule` 在首页预下载 `content`（`network: all`），首次点击分类无需等待
- 生成脚本的产出目录、`tsconfig.json` 的 include 均已同步指向分包

## 音色（朗读语音）

全部使用**预生成音频**：用腾讯云 TTS 批量合成 mp3 打进内容分包，本地播放零延迟、音色可换。曾用同声传译插件做缺失兜底，因个人主体引用「IT科技-软件服务提供商」类目插件触发审核问题，已彻底移除；新增词条必须在生成音频后才会有声音。

```bash
cd babyspot
set TENCENT_SECRET_ID=xxx
set TENCENT_SECRET_KEY=xxx

python scripts/gen_voice.py --dry-run        # 只看文案清单
python scripts/gen_voice.py --limit 3        # 试听 3 条
python scripts/gen_voice.py --force          # 全量重新生成
python scripts/gen_voice.py --sync-only      # 不调 API，只修文件名与路径
python scripts/gen_voice.py --voice 403008 --force   # 换音色
```

密钥在腾讯云控制台 → 访问管理 → API 密钥管理获取，**只作环境变量传入、不落盘**。超自然大模型 2.0 音色 2.5 元/万字符，控制台可领 2 万字符免费包；全量 96 条约 800 字符，通常在免费额度内。

**文件命名规则**：`<分类>_<名称>.mp3`，与产品词条一一对应，不用 a1/f1 这类内部编号。

```
pkgContent/assets/voice/family_爸爸.mp3
pkgContent/assets/voice/animal_小狗.mp3
pkgContent/assets/voice/color_红色.mp3
pkgContent/assets/voice/shape_圆形.mp3
```

`defaultData.ts` 里对应的字段：`audio: '/pkgContent/assets/voice/family_爸爸.mp3'`。

| 音色 ID | 名称 | 类型 | 说明 |
|---|---|---|---|
| `403000` | 云小朵 · 特色女童声 | 超自然大模型 2.0 | **当前选用**，支持 24kHz |
| `403008` | 云小洋 · 机灵男童 | 超自然大模型 | 备选 |
| `502007` | 智小虎 · 聊天童声 | 超自然大模型 | 备选 |
| `101016` | 智甜 · 女童声 | 精品（旧版） | 仅支持 16kHz，v1.1.8 起不再使用 |

- 语速 `-0.6`；音频后处理：裁掉 TTS 自带首尾静音（各留 0.1s）→ 50ms 淡入 → 3kHz +1.5dB → `loudnorm I=-19:TP=-2:LRA=7` → 24kHz / 24kbps
- 新增词条必须跑 `gen_voice.py` 生成音频，否则点击无声；生成后 `audio` 字段自动同步
- 接口名是 `TextToVoice`（不是 `TextToSpeech`），签名 TC3-HMAC-SHA256，脚本已用标准库实现，无需装 SDK

## 功能对照（需求 v1.1.9）

| 需求 | 状态 |
|---|---|
| 默认图库点击发声 | ✅ 7 分类 120 词条，本地音频 96/96（黑白卡按设计无声） |
| 黑白卡 24 张（0-6 个月视觉激发） | ✅ 无声音，全屏预览，左右滑动循环切换 |
| 连播模式 | ✅ 整批顺序播放，每条间隔 250ms，点击打断 |
| 难度分层 | ✅ 职业分「常见 10 / 进阶 9」 |
| 单次时长提醒 | ✅ 前台每累计 10 分钟提醒，切后台不计时 |
| 家长中心 / 自定义上传 | ❌ 已移除，仅使用内置图库 |
| 语言启蒙（课程体系） | ❌ 已裁剪，个人主体类目受限 |

## 发布相关

- 服务类目：工具 → 效率/信息查询（个人主体不给教育类目）
- 不申请相册/摄像头等隐私权限（无自定义上传）
- ICP 备案号「京ICP备2026075613号-1X」展示在首页底部，点击可复制
- 版本描述须写明「本地音频、不联网、不录音、不采集用户信息、无第三方插件」
