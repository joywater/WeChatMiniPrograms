// 广告位配置（微信流量主）
// 使用前提：
//   1. 小程序已发布上线，且累计独立访客 UV ≥ 500（无违规记录），在公众平台「功能 → 流量主」开通；
//   2. 开通后在「流量主 → 广告管理」创建 banner 广告位，把生成的 adunit-xxx 填到下面；
//   3. 未填写时页面不会渲染广告组件（不影响审核与体验）。
// 布局原则：
//   - 只在「首页底部」放置 banner，家长视线区，不进入宝宝点播流程；
//   - 图库页（宝宝主操作面）保持零广告，避免误触跳转伤害体验与分享率。

export interface AdUnits {
  /** 首页底部 banner 广告位 ID，形如 adunit-xxxxxxxxxxxxxxxx */
  homeBanner: string
}

export const AD_UNITS: AdUnits = {
  homeBanner: ''
}

/** 是否已配置有效的广告位（空字符串视为未开通） */
export function hasAd(unitId: string): boolean {
  return /^adunit-[0-9a-zA-Z]+$/.test(unitId)
}
