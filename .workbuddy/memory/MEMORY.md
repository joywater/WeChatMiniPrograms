# 项目约定（宝宝认一认 / WeChatMiniPrograms）

- **开发语言：TypeScript 单源**（仓库只有 .ts，无 .js 副本）。用户明确选择单源方案：project.config.json 配 useCompilerPlugins:["typescript"]，发布走开发者工具编译管线（wechatide upload 或手动上传），**WorkBuddy 卡片发布不可用**（其打包只认 .js）。涉及语言/框架变更必须先给评估、等用户确认再动手。
- 工程目录：E:/MyGitHub/WeChatMiniPrograms/babyspot；AppID wxbce259ccde236dd3（个人主体，名称「宝宝认一认」）；设计稿在 ../design-assets（不进包）。
- 微信开发者工具安装于 D:/Tencent/微信web开发者工具；wechatide CLI 授权客户端名 WorkBuddy；同声传译插件经微信服务市场授权（wx069ba97219f66d99）。
- 发布链路：改 .ts → 开发者工具重新编译/上传新版本号 → 后台「版本管理」选为体验版 → 添加体验成员。
- 踩坑记录：①80082 插件 permission deny → 服务市场添加；②80051 包体超 2MB → 设计图放 ../design-assets；③WorkBuddy 打包不执行 TS 编译。
