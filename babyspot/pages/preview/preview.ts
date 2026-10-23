// 全屏预览页：黑白卡等无音频词条的看图页
// 交互：整页点按返回；左右滑动切换同分类上一张/下一张（首尾循环）
import { categories, items } from '../../utils/defaultData'

interface BwEntry {
  src: string
  label: string
}

Page({
  data: {
    src: '',
    label: '',
    hasList: false,
    index: 0,
    total: 0,
    switching: false
  },

  /** 当前分类的词条列表（仅 silent 分类传入，支持滑动切换） */
  list: [] as BwEntry[],
  index: 0,
  touchStartX: 0,
  touchStartY: 0,
  swiping: false,

  onLoad(options: Record<string, string | undefined>) {
    const catId = options.cat || ''
    const idx = parseInt(options.idx || '0', 10) || 0
    const cat = categories.find(c => c.id === catId)
    if (cat && cat.silent) {
      this.list = (items[catId] || [])
        .filter(it => it.img)
        .map(it => ({ src: it.img as string, label: it.label }))
    }
    if (this.list.length) {
      this.index = Math.min(Math.max(idx, 0), this.list.length - 1)
      this.applyCurrent()
    } else {
      // 兼容旧入口：仅传 src/label 单张查看
      this.setData({
        src: decodeURIComponent(options.src || ''),
        label: decodeURIComponent(options.label || '')
      })
    }
  },

  applyCurrent() {
    const cur = this.list[this.index]
    if (!cur) return
    this.setData({
      src: cur.src,
      label: cur.label,
      hasList: true,
      index: this.index,
      total: this.list.length,
      switching: true
    })
    // 短暂移除动画类，保证下次切换动画可重放
    if (this.animTimer) clearTimeout(this.animTimer)
    this.animTimer = setTimeout(() => this.setData({ switching: false }), 360) as any
  },

  animTimer: 0 as ReturnType<typeof setTimeout> | 0,

  onTouchStart(e: { touches?: Array<{ clientX: number; clientY: number }> }) {
    const t = e.touches && e.touches[0]
    if (!t) return
    this.touchStartX = t.clientX
    this.touchStartY = t.clientY
    this.swiping = false
  },

  onTouchEnd(e: { changedTouches?: Array<{ clientX: number; clientY: number }> }) {
    if (!this.list.length) return
    const t = e.changedTouches && e.changedTouches[0]
    if (!t) return
    const dx = t.clientX - this.touchStartX
    const dy = t.clientY - this.touchStartY
    // 水平位移明显且大于纵向位移才判定为滑动
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      this.swiping = true
      const n = this.list.length
      if (dx < 0) {
        this.index = (this.index + 1) % n // 下一张，末尾循环到开头
      } else {
        this.index = (this.index - 1 + n) % n // 上一张，开头循环到末尾
      }
      this.applyCurrent()
    }
  },

  close() {
    // 滑动结束的当次点击不触发返回，避免误退
    if (this.swiping) {
      this.swiping = false
      return
    }
    wx.navigateBack()
  },

  // 全屏预览不参与分享（保持宝宝视野纯净）
  onShareAppMessage() {
    return {
      title: '点一点就会念，宝宝的第一套认知卡',
      path: '/pages/index/index',
      imageUrl: '/assets/images/share.jpg'
    }
  }
})
