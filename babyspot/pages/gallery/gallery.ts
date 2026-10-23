// 图库页：某分类下的图片网格，点击卡片播放对应语音（先念词 + 认知短句）
import { categories, items } from '../../utils/defaultData'
import { speak, preheat } from '../../utils/tts'

interface GalleryItem {
  id: string
  label: string
  say: string
  sfx: string
  /** 预生成朗读音频（代码包内路径）；为空则用插件在线合成 */
  audio: string
  src: string
  emoji?: string
  /** 是否为该行第 3 个（末位），用于去除右边距 */
  rowEnd: boolean
}

Page({
  data: {
    items: [] as GalleryItem[],
    tint: '#FFF1E0',
    playingId: '',
    showCredit: false
  },

  onLoad(options: Record<string, string | undefined>) {
    const catId = options.catId || 'animal'
    const cat = categories.find(c => c.id === catId)
    if (cat) {
      wx.setNavigationBarTitle({ title: cat.name })
      this.setData({ tint: cat.light || '#FFF1E0' })
    }
    // 动物页含 CC BY-SA 音效，底部标注素材来源
    this.setData({ showCredit: catId === 'animal' })
    const list: GalleryItem[] = (items[catId] || []).map((it, idx) => ({
      id: it.id,
      label: it.label,
      say: it.say || it.label,
      sfx: it.sfx || '',
      audio: it.audio || '',
      emoji: it.emoji,
      src: it.img || '',
      rowEnd: idx % 3 === 2
    }))
    this.setData({ items: list })
    // 预热：仅对「无预生成音频」的词条后台合成，消除首次点击的合成延迟
    preheat(list.map(it => ({ say: it.say, audio: it.audio })))
  },

  tapCard(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    const say = e.currentTarget.dataset.say as string
    const sfx = e.currentTarget.dataset.sfx as string
    const audio = e.currentTarget.dataset.audio as string
    // 轻微动画反馈 + 语音播放；支持重复点击同一张
    this.setData({ playingId: id })
    setTimeout(() => {
      if (this.data.playingId === id) this.setData({ playingId: '' })
    }, 500)
    speak(say, sfx || undefined, audio || undefined)
  }
})
