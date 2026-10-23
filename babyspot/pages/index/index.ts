// 首页：主分类卡片（标题左上 + 插画右下），底部 banner 广告（流量主开通后启用）
import { categories, Category } from '../../utils/defaultData'
import { AD_UNITS, hasAd } from '../../utils/ad'

interface CardVM {
  id: string
  name: string
  emoji: string
  emojiSize: number
  cover: string
  light: string
}

Page({
  data: {
    mainCards: [] as CardVM[],
    bannerUnitId: '',
    showBanner: false
  },

  onLoad() {
    this.refresh()
    // 广告位未配置（流量主未开通）时不渲染组件，页面表现与之前一致
    const unit = AD_UNITS.homeBanner
    this.setData({ bannerUnitId: unit, showBanner: hasAd(unit) })
  },

  // 广告拉取失败（无填充 / 网络异常 / 审核期禁用）静默隐藏，不影响页面
  onAdError(e: { detail?: unknown }) {
    // eslint-disable-next-line no-console
    console.warn('[ad] banner load failed', e && e.detail)
    this.setData({ showBanner: false })
  },

  refresh() {
    // 顺序：按 categories 定义顺序展示
    this.setData({
      mainCards: categories.filter(c => c.main).map((cat: Category): CardVM => ({
        id: cat.id,
        name: cat.name,
        emoji: cat.emoji,
        emojiSize: cat.iconRpx || 140,
        cover: cat.cover || '',
        light: cat.light
      }))
    })
  },

  openCategory(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    const name = e.currentTarget.dataset.name as string
    wx.navigateTo({
      url: '/pages/gallery/gallery?catId=' + id + '&catName=' + name
    })
  },

  // 好友分享
  onShareAppMessage() {
    return {
      title: '点一点就会念，宝宝的第一套认知卡',
      path: '/pages/index/index',
      imageUrl: '/assets/images/share.jpg'
    }
  },

  // 朋友圈分享
  onShareTimeline() {
    return {
      title: '点一点就会念，宝宝的第一套认知卡',
      imageUrl: '/assets/images/share.jpg'
    }
  },

  // 点击备案号跳转工信部查询
  openICP() {
    wx.setClipboardData({
      data: '京ICP备2026075613号-1X',
      success: () => {
        wx.showToast({ title: '备案号已复制', icon: 'success' })
      }
    })
  }
})
