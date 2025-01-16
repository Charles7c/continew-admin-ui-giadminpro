declare namespace App {
  interface AppSettings {
    theme: 'light' | 'dark'
    themeColor: string
    tab: boolean
    tabMode: 'card' | 'card-gutter' | 'rounded'
    animate: boolean
    animateMode: 'zoom-fade' | 'slide-dynamic-origin' | 'fade-slide' | 'fade' | 'fade-bottom' | 'fade-scale'
    menuCollapse: boolean
    menuAccordion: boolean
    menuDark: boolean
    copyrightDisplay: boolean
    layout: 'left' | 'mix'
    isOpenWatermark?: boolean
    watermark?: string
    enableColorWeaknessMode?: boolean
    enableMourningMode?: boolean
  }

  /** 导航页签的样式类型 */
  type TabType = 'card' | 'card-gutter' | 'rounded'
  interface TabItem {
    label: string
    value: TabType
  }
  /** 页面切换动画类型 */
  type AnimateType = 'zoom-fade' | 'slide-dynamic-origin' | 'fade-slide' | 'fade' | 'fade-bottom' | 'fade-scale'
  interface AnimateItem {
    label: string
    value: AnimateType
  }

  /** 字典项 */
  interface DictItem {
    disabled?: boolean
    extra?: string
    label: string
    value: string
  }
}
