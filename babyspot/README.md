# 宝宝认一认（BabySpot）

面向 0-3 岁婴幼儿的认知启蒙微信小程序：宝宝点击图片即听到普通话朗读，使用内置默认图库。需求见 `../宝宝认一认-需求文档.md`。

- 开发语言：**TypeScript 单源**（仓库只有 `.ts`，`project.config.json` 配置 `useCompilerPlugins: ["typescript"]`，开发者工具在上传/预览时自动编译）
- AppID：`wxbce259ccde236dd3`（个人主体「宝宝认一认」）
- 语音：**本地预生成 mp3**（`assets/voice/`，腾讯云 TTS 音色 `101016` 智甜·女童声，语速 -0.4），微信同声传译插件 WechatSI（`wx069ba97219f66d99`，v0.3.5）仅作缺失兜底

## 发布方式（重要）

`.ts` 单源下 **WorkBuddy 卡片发布不可用**（其打包不执行 TS 编译，只认 `.js`）。发布走开发者工具编译管线：

- 手动：开发者工具 → 上传（填版本号）→ 后台「版本管理」选为体验版
- 命令行：让 WorkBuddy 执行 `wechatide upload --project ... --upload-version x.y.z`（需工具已打开）

注意：`.ts` 改完必须让开发者工具**重新编译/上传**才生效；本地预览用工具的「编译」按钮即可。

## 目录结构

```
babyspot/
├── app.json                 # 页面注册 + 同声传译插件声明
├── app.ts / app.wxss
├── tsconfig.json            # TS 编译选项（strict；供编辑器与工具编译参考）
├── typings/index.d.ts       # 全局对象最小声明（wx/Page/App 等）
├── pages/
│   ├── index/               # 首页：hero 标语 + 主分类卡片（5 个）
│   └── gallery/             # 图库页：3列大卡片网格，点击播放语音+缩放动画
├── assets/
│   ├── sfx/                 # 动物叫声音效（朗读结束后接播）
│   └── voice/               # 预生成朗读 mp3（30 条，共 396KB，24kHz/32kbps 单声道）
├── scripts/
│   ├── gen_voice.py         # 批量生成朗读音频并同步 audio 字段（不入包）
│   └── build_demo_page.py   # 生成试听页清单（不入包）
└── utils/
    ├── defaultData.ts       # 默认图库（5分类38个词条；language 为占位分类）
    └── tts.ts               # 播放调度：本地 audio 优先 → WechatSI 兜底 → 失败回退
```

## 音色（朗读语音）

同声传译插件只有一种固定音色、不可调，听感偏机械。现改为**预生成音频**：用腾讯云 TTS 批量合成 mp3 打进代码包，本地播放零延迟、音色可换。

```bash
cd babyspot
set TENCENT_SECRET_ID=xxx
set TENCENT_SECRET_KEY=xxx

python scripts/gen_voice.py --dry-run        # 只看文案清单
python scripts/gen_voice.py --limit 3        # 试听 3 条
python scripts/gen_voice.py --force          # 全量重新生成
python scripts/gen_voice.py --voice 101015 --force   # 换音色
```

密钥在腾讯云控制台 → 访问管理 → API 密钥管理获取。免费额度需先在「语音合成 → 资源包管理」领取（精品音色 800 万字符，3 个月有效）。

**文件命名规则**：`<分类>_<名称>.mp3`，与产品词条一一对应，不用 a1/f1 这类内部编号。

```
assets/voice/family_爸爸.mp3
assets/voice/animal_小狗.mp3
assets/voice/color_红色.mp3
assets/voice/shape_圆形.mp3
```

`defaultData.ts` 里对应的字段：`audio: '/assets/voice/family_爸爸.mp3'`。
改名或新增词条后跑 `python scripts/gen_voice.py --sync-only` 即可批量修正文件名与路径（不调 API）。

| 音色 ID | 名称 | 类型 | 说明 |
|---|---|---|---|
| `101016` | 智甜 · 女童声 | 精品 | **当前选用**，含在免费额度内 |
| `101015` | 智萌 · 男童声 | 精品 | 含在免费额度内 |
| `101001` | 智瑜 · 情感女声 | 精品 | 成熟温柔女声 |
| `601015` | 爱小童 · 男童声 | 大模型 | 更自然，免费额度仅 10 万字符 |
| `403000` | 云小朵 · 女童声 | 超自然大模型 | 音质最好，按量 4.8~6 元/万字符 |

- 语速默认 `-0.4`（范围 -2~6），自动响度归一化到 -16 LUFS，与音效音量一致
- 精品音色仅支持 8k/16k 采样，脚本按 16k 请求后统一转 24k/32k 输出
- 新增词条未预生成时，自动回退 WechatSI 在线合成，不会静音
- 接口名是 `TextToVoice`（不是 `TextToSpeech`），签名 TC3-HMAC-SHA256，脚本已用标准库实现，无需装 SDK

## 功能对照（需求 v0.3）

| 需求 | 状态 |
|---|---|
| 默认图库点击发声 | ✅ Emoji 占位素材，采购插画后填 `img` 字段即可替换 |
| 家庭称呼（13 条）/ 认识职业（10 条）/ 认识颜色 / 认识形状 | ✅（家庭称呼原"认识人物"，新增职业分类） |
| 语言启蒙（课程体系） | ⏸ 占位卡片「敬请期待」，二期实现 |
| 家长中心 / 自定义上传 | ❌ 已按需求移除（v1.0.3 起，仅使用内置图库） |
| 大点击区 / 单页少图 / 点击动画 | ✅ |

## 发布相关

- 服务类目：工具 → 效率/信息查询（个人主体不给教育类目）
- 不申请相册/摄像头等隐私权限（无自定义上传）
- 默认图库正式上线前替换为可商用卡通插画素材（设计稿在 `../design-assets/`）
