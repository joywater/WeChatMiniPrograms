// 「宝宝认一认」入口（TypeScript）
// 数据说明：当前为本地实现——自定义图片与标签仅保存在本机
// （同一微信号换设备不会自动同步）。接入云服务后升级为云端存储。

// 前台使用时长统计（秒）：仅在 App 处于前台时累计，
// 切后台 / 锁屏即暂停，供图库页做「单次时长提醒」。
let usageTimer: ReturnType<typeof setInterval> | null = null

App({
  globalData: {
    /** 本次前台累计使用秒数 */
    usageSeconds: 0
  },

  onLaunch() {
    // 首次打开即完成本地数据初始化（无感知，无需授权弹窗）
  },

  onShow() {
    if (usageTimer !== null) return
    const app = getApp() as { globalData: { usageSeconds: number } }
    usageTimer = setInterval(() => {
      app.globalData.usageSeconds++
    }, 1000)
  },

  onHide() {
    if (usageTimer !== null) {
      clearInterval(usageTimer)
      usageTimer = null
    }
  }
})
