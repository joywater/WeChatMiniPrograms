// 最小化环境声明：微信小程序运行时全局对象
// 如需完整类型提示，可安装官方类型包：
//   npm i -D miniprogram-api-typings
declare const wx: any
declare const App: (options: any) => void
declare const Page: (options: any) => void
declare const Component: (options: any) => void
declare const getApp: () => any
declare const getCurrentPages: () => any[]
declare const requirePlugin: (name: string) => any

// 常用事件类型的最小声明（完整版见 miniprogram-api-typings）
declare namespace WechatMiniprogram {
  interface TouchEvent {
    currentTarget: { dataset: Record<string, any> }
    target: { dataset: Record<string, any> }
  }
  interface PickerChange {
    detail: { value: string | number | string[] }
  }
  interface Input {
    detail: { value: string }
  }
}
