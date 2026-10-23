// 语音播放：本地预生成音频优先，微信同声传译插件（WechatSI）兜底（TypeScript）
// 播放优先级：
//   1) 词条自带 audio（云 TTS 预生成的 mp3，代码包内路径）→ 直接本地播放，零延迟
//   2) 无 audio 时走 WechatSI 在线合成（缓存复用）
//   3) 本地音频文件缺失/损坏（onError）→ 自动回退在线合成，不会静音
// 预热只针对「无本地音频」的词条，避免浪费插件配额。
// 注意：插件需在「微信服务市场」添加并授权本小程序
//       （插件 AppID: wx069ba97219f66d99，与 app.json plugins 声明一致）。

let WechatSI: any = null
try {
  WechatSI = requirePlugin('WechatSI')
} catch (e) {
  WechatSI = null
}

const audioCache: Record<string, string> = {} // text -> audio url，同一词条只请求一次
const inFlight = new Set<string>() // 已进入/排队合成流程的文本，避免预热与点击重复请求
let inner: any = null
let pendingSfx = '' // 本条语音播完要接着播放的音效（如动物叫声）
// 本地音频播放失败时的回退文案（仅本地播放时设置）
let fallbackText = ''
let fallbackSfx = ''

function getPlayer(): any {
  if (!inner) {
    inner = wx.createInnerAudioContext()
    inner.autoplay = false
    inner.obeyMuteSwitch = false // 宝宝认知场景不受静音键影响
    // 朗读结束后自动接播音效（动物叫声等）
    inner.onEnded(() => {
      if (pendingSfx) {
        const sfx = pendingSfx
        pendingSfx = ''
        inner.src = sfx
        inner.play()
      }
    })
    // 本地音频加载失败（文件缺失/编码异常）时回退在线合成
    inner.onError(() => {
      if (fallbackText) {
        const text = fallbackText
        const sfx = fallbackSfx
        fallbackText = ''
        fallbackSfx = ''
        synthAndPlay(text, sfx)
      }
    })
  }
  return inner
}

function play(url: string, sfx?: string): void {
  const p = getPlayer()
  p.stop()
  pendingSfx = sfx || ''
  p.src = url
  p.play()
}

// 调用插件合成一条语音，resolve 音频地址；失败 resolve(null)
function synthesize(text: string): Promise<string | null> {
  return new Promise(resolve => {
    WechatSI.textToSpeech({
      lang: 'zh_CN',
      tts: true,
      content: text,
      success(res: { retcode: number; filename?: string }) {
        if (res && res.retcode === 0 && res.filename) {
          resolve(res.filename)
        } else {
          resolve(null)
        }
      },
      fail() {
        resolve(null)
      }
    })
  })
}

// 在线合成后播放；合成失败则静默（仅保留点击动画反馈）
function synthAndPlay(text: string, sfx?: string): Promise<boolean> {
  if (!WechatSI || !text) {
    return Promise.resolve(false)
  }
  const cached = audioCache[text]
  if (cached) {
    fallbackText = ''
    play(cached, sfx)
    return Promise.resolve(true)
  }
  return synthesize(text).then(url => {
    if (url) {
      audioCache[text] = url
      play(url, sfx)
      return true
    }
    return false
  })
}

// 朗读一段文字
//   sfx        朗读结束后接着播放的音效（可选）
//   localAudio 预生成音频的代码包内路径（如 '/assets/voice/a1.mp3'，可选，优先播放）
// resolve(true) 表示已成功播放
export function speak(text: string, sfx?: string, localAudio?: string): Promise<boolean> {
  if (localAudio) {
    fallbackText = text
    fallbackSfx = sfx || ''
    play(localAudio, sfx)
    return Promise.resolve(true)
  }
  return synthAndPlay(text, sfx)
}

export interface PreheatItem {
  /** 朗读文案 */
  say: string
  /** 已预生成音频路径，有值时无需在线合成 */
  audio?: string
}

// 预热：批量预合成一批文本（跳过已缓存/已在合成队列/已有本地音频的），串行执行避免插件限流。
// 合成结果只写入缓存，不播放。失败的可下次重试。
export function preheat(list: PreheatItem[]): void {
  if (!WechatSI) return
  const queue = (list || [])
    .filter(it => it && it.say && !it.audio)
    .map(it => it.say)
    .filter(t => !audioCache[t] && !inFlight.has(t))
  if (!queue.length) return
  queue.forEach(t => inFlight.add(t))

  let chain: Promise<void> = Promise.resolve()
  queue.forEach(text => {
    chain = chain
      .then(() => synthesize(text))
      .then(url => {
        if (url) {
          audioCache[text] = url
        } else {
          inFlight.delete(text) // 失败允许下次预热重试
        }
      })
  })
}
