// 语音播放：全部使用本地预生成 mp3（assets/voice/），不依赖任何在线合成插件。
// 两种播放方式：
//   speak()        单条播放：词条 audio → 播完接播 sfx（如动物叫声）→ 触发 onDone
//   playSequence() 连播：按顺序播放整批词条，每条播完（含音效）自动接下一条
// 单条播放会自动打断进行中的连播；stopSequence() 用于显式停止连播。

let inner: any = null
let sfxPending = ''                        // 本条语音播完要接播的音效
let chainNext: (() => void) | null = null  // 语音（及音效）播完后的下一步

function getPlayer(): any {
  if (!inner) {
    inner = wx.createInnerAudioContext()
    inner.autoplay = false
    inner.obeyMuteSwitch = false // 宝宝认知场景不受静音键影响
    inner.onEnded(() => {
      if (sfxPending) {
        const s = sfxPending
        sfxPending = ''
        inner.src = s
        inner.play()
        return
      }
      const next = chainNext
      chainNext = null
      if (next) next()
    })
  }
  return inner
}

function clearChain(): void {
  chainNext = null
  sfxPending = ''
}

// 单条播放；onDone 在该条（含音效）全部播完后触发；返回是否已发起播放
export function speak(localAudio: string, sfx?: string, onDone?: () => void): boolean {
  if (!localAudio) return false
  clearChain()
  const p = getPlayer()
  p.stop()
  sfxPending = sfx || ''
  chainNext = onDone || null
  p.src = localAudio
  p.play()
  return true
}

export interface SeqItem {
  audio: string
  sfx?: string
}

// 连播一批词条：onItem(i) 在第 i 条开始播放时回调，onDone 在全部播完后回调
export function playSequence(list: SeqItem[], onItem: (i: number) => void, onDone: () => void): void {
  const p = getPlayer()
  clearChain()
  let i = 0
  const step = (): void => {
    if (i >= list.length || !list[i].audio) {
      onDone()
      return
    }
    const it = list[i]
    onItem(i)
    chainNext = () => {
      i++
      step()
    }
    p.stop()
    sfxPending = it.sfx || ''
    p.src = it.audio
    p.play()
  }
  step()
}

// 停止连播：清空播放链并停止当前声音
export function stopSequence(): void {
  clearChain()
  getPlayer().stop()
}
