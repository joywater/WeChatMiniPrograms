// 图库页：某分类下的图片网格，点击卡片播放对应语音（预生成 mp3 + 可选音效）；
// 支持连播模式：整批词条顺序自动播放，点击任意卡片打断；
// 词条按认知难度分「常见 / 进阶」板块；每累计 10 分钟前台使用弹出休息提醒。
import { categories, items } from '../../utils/defaultData'
import { speak, playSequence, stopSequence, SeqItem } from '../../utils/tts'

interface GalleryItem {
  id: string
  label: string
  sfx: string
  /** 预生成朗读音频（代码包内路径） */
  audio: string
  src: string
  emoji?: string
  /** 是否为该行第 3 个（末位），用于去除右边距 */
  rowEnd: boolean
}

/** 板块分组（常见 / 进阶；仅有一个板块时不显示标题） */
interface GalleryGroup {
  title: string
  items: GalleryItem[]
}

/** 单次时长提醒间隔（秒）：每 10 分钟提示一次 */
const REMIND_STEP = 600

Page({
  data: {
    groups: [] as GalleryGroup[],
    multiSection: false,
    tint: '#FFF1E0',
    playingId: '',
    showCredit: false,
    autoPlaying: false,
    silent: false,
    catId: 'animal',
    catName: '认识动物',
    showRest: false,
    restAt: REMIND_STEP
  },

  usageChecker: 0 as ReturnType<typeof setInterval> | 0,

  onLoad(options: Record<string, string | undefined>) {
    const catId = options.catId || 'animal'
    const cat = categories.find(c => c.id === catId)
    if (cat) {
      wx.setNavigationBarTitle({ title: cat.name })
      // 无音频分类（黑白卡）使用纯白底，让方形图案与卡片无缝融合
      this.setData({
        tint: cat.silent ? '#FFFFFF' : (cat.light || '#FFF1E0'),
        catId,
        catName: cat.name,
        silent: !!cat.silent
      })
    } else {
      this.setData({ catId })
    }
    // 动物页含 CC BY-SA 音效，底部标注素材来源
    this.setData({ showCredit: catId === 'animal' })

    const build = (it: typeof items[string][number], idx: number): GalleryItem => ({
      id: it.id,
      label: it.label,
      sfx: it.sfx || '',
      audio: it.audio || '',
      emoji: it.emoji,
      src: it.img || '',
      rowEnd: false
    })

    const all = (items[catId] || []).map(build)
    // 按 advanced 拆分：存在进阶词条时分为「常见 / 进阶」两个板块
    const advancedList = (items[catId] || []).filter(it => it.advanced).map(build)
    let groups: GalleryGroup[]
    if (advancedList.length) {
      const commonList = all.filter(it => !advancedList.some(a => a.id === it.id))
      groups = [
        { title: '常见', items: commonList },
        { title: '进阶', items: advancedList }
      ]
    } else {
      groups = [{ title: '', items: all }]
    }
    // rowEnd 按各板块内部行宽（3 列）重算
    groups.forEach(g => {
      g.items.forEach((it, idx) => { it.rowEnd = idx % 3 === 2 })
    })
    this.setData({ groups, multiSection: groups.length > 1 })

    // 时长检查：每 5 秒核对一次前台累计时长
    this.usageChecker = setInterval(() => this.checkUsage(), 5000) as any
  },

  // 单次时长提醒：达到阈值弹出休息卡片，并打断连播
  checkUsage() {
    if (this.data.showRest) return
    const app = getApp() as { globalData: { usageSeconds: number } }
    const sec = (app.globalData && app.globalData.usageSeconds) || 0
    if (sec >= this.data.restAt) {
      if (this.data.autoPlaying) {
        stopSequence()
        this.setData({ autoPlaying: false, playingId: '' })
      }
      this.setData({ showRest: true, restAt: this.data.restAt + REMIND_STEP })
    }
  },

  dismissRest() {
    this.setData({ showRest: false })
  },

  // 阻止提醒浮层下的页面滚动
  noop() {},

  tapCard(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    const sfx = e.currentTarget.dataset.sfx as string
    const audio = e.currentTarget.dataset.audio as string

    // 无音频分类（黑白卡）：点击进入全屏预览，并带上列表索引以支持滑动切换
    if (this.data.silent) {
      const flat = this.data.groups
        .flatMap((g: GalleryGroup) => g.items)
        .filter((x: GalleryItem) => x.src)
      const it = flat.find((x: GalleryItem) => x.id === id)
      if (it) {
        const idx = flat.findIndex((x: GalleryItem) => x.id === id)
        wx.navigateTo({
          url: '/pages/preview/preview?cat=' + this.data.catId + '&idx=' + idx
        })
      }
      return
    }

    // 点击卡片打断连播
    if (this.data.autoPlaying) {
      stopSequence()
      this.setData({ autoPlaying: false })
    }
    // 播放反馈：高亮持续到该条（含音效）真正播完；支持重复点击同一张
    const ok = speak(audio || '', sfx || undefined, () => {
      if (this.data.playingId === id) this.setData({ playingId: '' })
    })
    if (ok) {
      this.setData({ playingId: id })
    } else {
      // 无音频时退化为短暂弹跳反馈
      this.setData({ playingId: id })
      setTimeout(() => {
        if (this.data.playingId === id) this.setData({ playingId: '' })
      }, 600)
    }
  },

  // 连播开关：按「常见 → 进阶」顺序播到最后
  toggleAuto() {
    if (this.data.autoPlaying) {
      stopSequence()
      this.setData({ autoPlaying: false, playingId: '' })
      return
    }
    const flat: GalleryItem[] = []
    this.data.groups.forEach((g: GalleryGroup) => flat.push(...g.items))
    const list: SeqItem[] = flat
      .filter((it: GalleryItem) => it.audio)
      .map((it: GalleryItem) => ({ audio: it.audio, sfx: it.sfx || undefined }))
    if (!list.length) {
      wx.showToast({ title: '这个分类还没有音频', icon: 'none' })
      return
    }
    this.setData({ autoPlaying: true })
    playSequence(
      list,
      (i) => {
        const cur = list[i]
        const it = flat.find((x: GalleryItem) => x.audio === cur.audio && (x.sfx || '') === (cur.sfx || ''))
        this.setData({ playingId: it ? it.id : '' })
      },
      () => this.setData({ autoPlaying: false, playingId: '' })
    )
  },

  onUnload() {
    if (this.usageChecker) clearInterval(this.usageChecker)
    if (this.data.autoPlaying) stopSequence()
  },

  // 好友分享：直达当前分类
  onShareAppMessage() {
    return {
      title: this.data.catName + '：点一点，宝宝跟着念',
      path: '/pages/gallery/gallery?catId=' + this.data.catId,
      imageUrl: '/assets/images/share.jpg'
    }
  }
})
