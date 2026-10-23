// 首页：主分类卡片（标题左上 + 插画右下），占位分类始终排在最后
import { categories, Category } from '../../utils/defaultData'

interface CardVM {
  id: string
  name: string
  emoji: string
  emojiSize: number
  light: string
  placeholder: boolean
}

Page({
  data: {
    mainCards: [] as CardVM[]
  },

  onLoad() {
    this.refresh()
  },

  refresh() {
    // 顺序：按 categories 定义顺序展示非占位分类，占位（建设中）分类始终排最后
    const mains = categories.filter(c => c.main)
    const sorted = [
      ...mains.filter(c => !c.placeholder),
      ...mains.filter(c => c.placeholder)
    ]
    this.setData({
      mainCards: sorted.map((cat: Category): CardVM => ({
        id: cat.id,
        name: cat.name,
        emoji: cat.emoji,
        emojiSize: cat.iconRpx || 140,
        light: cat.light,
        placeholder: !!cat.placeholder
      }))
    })
  },

  openCategory(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    const name = e.currentTarget.dataset.name as string
    const placeholder = e.currentTarget.dataset.placeholder as boolean
    if (placeholder) {
      wx.showToast({ title: name + '内容建设中，敬请期待', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: '/pages/gallery/gallery?catId=' + id + '&catName=' + name
    })
  }
})
