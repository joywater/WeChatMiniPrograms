# 项目约定（宝宝认一认 / WeChatMiniPrograms）

- **开发语言：TypeScript 单源**（仓库只有 .ts，无 .js 副本）。用户明确选择单源方案：project.config.json 配 useCompilerPlugins:["typescript"]，发布走开发者工具编译管线（wechatide upload 或手动上传），**WorkBuddy 卡片发布不可用**（其打包只认 .js）。涉及语言/框架变更必须先给评估、等用户确认再动手。
- 工程目录：E:/MyGitHub/WeChatMiniPrograms/babyspot；AppID wxbce259ccde236dd3（个人主体，名称「宝宝认一认」）；设计稿在 ../design-assets（不进包）。
- 微信开发者工具安装于 D:/Tencent/微信web开发者工具；wechatide CLI 授权客户端名 WorkBuddy；同声传译插件经微信服务市场授权（wx069ba97219f66d99）。
- 发布链路：改 .ts → 开发者工具重新编译/上传新版本号 → 后台「版本管理」选为体验版 → 添加体验成员。
- **包结构（v1.1.9 起）**：主包 + 单内容分包 `pkgContent`（app.json `subPackages` root=pkgContent / name=content，首页配 `preloadRule` 预下载）。主包只放 `app.*`、`pages/index`、`utils/`、`assets/images/cats/`、`share.jpg`（约 0.23MB）；词条图 / voice / sfx / 图库页 / 预览页都在分包（约 1.70MB）。运行时路径一律带 `/pkgContent` 前缀（navigateTo、分享 path、img/audio/sfx），cats 封面与 share.jpg 仍用 `/assets/images/...`；分包页面 import 公共代码用 `../../../utils/`。不设 `independent`（globalData.usageSeconds 依赖主包 app.ts）。改素材后必须同步 `utils/defaultData.ts` 与 `scripts/gen_voice.py` 等脚本的产出目录。
- 踩坑记录：①80082 插件 permission deny → 服务市场添加；②80051 包体超 2MB → 设计图放 ../design-assets；③WorkBuddy 打包不执行 TS 编译；④改过 app.json / 分包目录后须关闭项目重开再编译，工具会缓存旧页面注册；⑤分包可单向引用主包资源，主包不可引用分包。
