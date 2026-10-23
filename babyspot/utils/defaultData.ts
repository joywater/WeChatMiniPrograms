// 默认图库数据（内置内容，公共素材）
// 说明：首期使用大号 Emoji 作为占位素材，无需图片资源、离线可用；
// 采购可商用卡通插画后，为每个条目补充 img 字段（相对路径）即可替换。
// 语音：每个词条的朗读文案在 say 字段（先念词，再说一句认知短句）；
//       未填 say 时退化为只念 label。

export interface Category {
  id: string
  name: string
  emoji: string
  /** 卡片主色 */
  color: string
  /** 卡片浅底色 */
  light: string
  /** 是否为首页 2x2 主卡片 */
  main?: boolean
  /** 内容未建设的占位卡片（点击提示敬请期待） */
  placeholder?: boolean
  /** 卡片图标尺寸覆盖（rpx），默认 140；用于字形偏小/组合图标微调 */
  iconRpx?: number
}

export interface DefaultItem {
  id: string
  /** 卡片上显示的文字 */
  label: string
  emoji: string
  /** 朗读文案：先念词，再说一句认知短句；不填则只念 label */
  say?: string
  /** 采购插画后的图片路径，如 'assets/images/animal/cat.png' */
  img?: string
  /** 预生成朗读音频路径（scripts/gen_voice.py 生成），优先于在线合成播放 */
  audio?: string
  /** 真实动物叫声等音效路径（代码包内路径），在朗读结束后播放 */
  sfx?: string
}

export const categories: Category[] = [
  // ---- 首页主卡片（顺序即展示顺序，占位分类排最后） ----
  // 注意：family 用两个独立单人脸 emoji 并排——家庭类组合/单码点 emoji（👪、👨‍👩‍👧）
  // 在部分安卓机型上会渲染成黑色剪影，独立单人脸则必定彩色。
  { id: 'family', name: '家庭称呼', emoji: '👩👨', color: '#F2708A', light: '#FFE9E7', main: true, iconRpx: 110 },
  // 注意：职业类组合 emoji（👨‍⚕️ 等）在部分低端安卓机可能拆开渲染，正式上线换插画素材后规避
  { id: 'job', name: '认识职业', emoji: '👮', color: '#9B7EDE', light: '#F0E9FB', main: true },
  { id: 'animal', name: '认识动物', emoji: '🐱', color: '#F5A25D', light: '#FDF0DC', main: true },
  { id: 'color', name: '认识颜色', emoji: '🎨', color: '#5BA8E5', light: '#E3F1FD', main: true },
  { id: 'shape', name: '认识形状', emoji: '🔺', color: '#4DBBA4', light: '#E0F5EF', main: true, iconRpx: 190 },
  { id: 'language', name: '语言启蒙', emoji: '💬', color: '#7BC47F', light: '#E9F5E6', main: true, placeholder: true }
]

export const items: Record<string, DefaultItem[]> = {
  family: [
    { id: 'f1', label: '爸爸', emoji: '👨', say: '爸爸，爸爸是男生', audio: '/assets/voice/family_爸爸.mp3' },
    { id: 'f2', label: '妈妈', emoji: '👩', say: '妈妈，妈妈是女生', audio: '/assets/voice/family_妈妈.mp3' },
    { id: 'f3', label: '爷爷', emoji: '👴', say: '爷爷，爸爸的爸爸叫爷爷', audio: '/assets/voice/family_爷爷.mp3' },
    { id: 'f4', label: '奶奶', emoji: '👵', say: '奶奶，爸爸的妈妈叫奶奶', audio: '/assets/voice/family_奶奶.mp3' },
    { id: 'f5', label: '外公', emoji: '🧓', say: '外公，妈妈的爸爸叫外公', audio: '/assets/voice/family_外公.mp3' },
    { id: 'f6', label: '外婆', emoji: '👵', say: '外婆，妈妈的妈妈叫外婆', audio: '/assets/voice/family_外婆.mp3' },
    { id: 'f7', label: '哥哥', emoji: '👦', say: '哥哥，比宝宝大的男生', audio: '/assets/voice/family_哥哥.mp3' },
    { id: 'f8', label: '姐姐', emoji: '👧', say: '姐姐，比宝宝大的女生', audio: '/assets/voice/family_姐姐.mp3' },
    { id: 'f9', label: '弟弟', emoji: '🧒', say: '弟弟，比宝宝小的男生', audio: '/assets/voice/family_弟弟.mp3' },
    { id: 'f10', label: '妹妹', emoji: '👶', say: '妹妹，比宝宝小的女生', audio: '/assets/voice/family_妹妹.mp3' },
    { id: 'f11', label: '叔叔', emoji: '👨', say: '叔叔，爸爸的弟弟叫叔叔', audio: '/assets/voice/family_叔叔.mp3' },
    { id: 'f12', label: '阿姨', emoji: '👩', say: '阿姨，妈妈的妹妹叫阿姨', audio: '/assets/voice/family_阿姨.mp3' },
    { id: 'f13', label: '宝宝', emoji: '👶', say: '宝宝，就是你自己呀', audio: '/assets/voice/family_宝宝.mp3' }
  ],
  job: [
    { id: 'j1', label: '医生', emoji: '👨‍⚕️', say: '医生，生病了找医生', audio: '/assets/voice/job_医生.mp3' },
    { id: 'j2', label: '护士', emoji: '👩‍⚕️', say: '护士，护士帮忙打针', audio: '/assets/voice/job_护士.mp3' },
    { id: 'j3', label: '警察', emoji: '👮', say: '警察，警察保护大家', audio: '/assets/voice/job_警察.mp3' },
    { id: 'j4', label: '消防员', emoji: '👨‍🚒', say: '消防员，着火了找消防员', audio: '/assets/voice/job_消防员.mp3' },
    { id: 'j5', label: '老师', emoji: '👩‍🏫', say: '老师，老师教宝宝本领', audio: '/assets/voice/job_老师.mp3' },
    { id: 'j6', label: '厨师', emoji: '👨‍🍳', say: '厨师，厨师做出香喷喷的饭', audio: '/assets/voice/job_厨师.mp3' },
    { id: 'j7', label: '司机', emoji: '🚕', say: '司机，司机开车嘀嘀嘀', audio: '/assets/voice/job_司机.mp3' },
    { id: 'j8', label: '农民', emoji: '👨‍🌾', say: '农民，农民种出粮食', audio: '/assets/voice/job_农民.mp3' },
    { id: 'j9', label: '宇航员', emoji: '👨‍🚀', say: '宇航员，宇航员飞上太空', audio: '/assets/voice/job_宇航员.mp3' },
    { id: 'j10', label: '快递员', emoji: '📦', say: '快递员，快递员送来包裹', audio: '/assets/voice/job_快递员.mp3' }
  ],
  animal: [
    { id: 'a1', label: '小狗', emoji: '🐶', say: '小狗，小狗汪汪叫', sfx: '/assets/sfx/dog.mp3', audio: '/assets/voice/animal_小狗.mp3' },
    { id: 'a2', label: '小猫', emoji: '🐱', say: '小猫，小猫喵喵叫', sfx: '/assets/sfx/cat.mp3', audio: '/assets/voice/animal_小猫.mp3' },
    { id: 'a3', label: '鸭子', emoji: '🦆', say: '鸭子，鸭子嘎嘎叫', sfx: '/assets/sfx/duck.mp3', audio: '/assets/voice/animal_鸭子.mp3' },
    { id: 'a4', label: '大象', emoji: '🐘', say: '大象，大象鼻子长', sfx: '/assets/sfx/elephant.mp3', audio: '/assets/voice/animal_大象.mp3' },
    { id: 'a5', label: '老虎', emoji: '🐯', say: '老虎，老虎是森林之王', sfx: '/assets/sfx/tiger.mp3', audio: '/assets/voice/animal_老虎.mp3' },
    { id: 'a6', label: '小兔', emoji: '🐰', say: '小兔，小兔爱吃萝卜，蹦蹦跳跳', audio: '/assets/voice/animal_小兔.mp3' },
    { id: 'a7', label: '熊猫', emoji: '🐼', say: '熊猫，熊猫爱吃竹子', sfx: '/assets/sfx/panda.mp3', audio: '/assets/voice/animal_熊猫.mp3' },
    { id: 'a8', label: '狮子', emoji: '🦁', say: '狮子，狮子有大鬃毛，嗷呜', audio: '/assets/voice/animal_狮子.mp3' }
  ],
  color: [
    { id: 'c1', label: '红色', emoji: '🔴', say: '红色，苹果是红色的', audio: '/assets/voice/color_红色.mp3' },
    { id: 'c2', label: '黄色', emoji: '🟡', say: '黄色，香蕉是黄色的', audio: '/assets/voice/color_黄色.mp3' },
    { id: 'c3', label: '蓝色', emoji: '🔵', say: '蓝色，天空是蓝色的', audio: '/assets/voice/color_蓝色.mp3' },
    { id: 'c4', label: '绿色', emoji: '🟢', say: '绿色，小草是绿色的', audio: '/assets/voice/color_绿色.mp3' },
    { id: 'c5', label: '橙色', emoji: '🟠', say: '橙色，橘子是橙色的', audio: '/assets/voice/color_橙色.mp3' },
    { id: 'c6', label: '紫色', emoji: '🟣', say: '紫色，葡萄是紫色的', audio: '/assets/voice/color_紫色.mp3' },
    { id: 'c7', label: '黑色', emoji: '⚫', say: '黑色，夜晚是黑色的', audio: '/assets/voice/color_黑色.mp3' },
    { id: 'c8', label: '白色', emoji: '⚪', say: '白色，雪花是白色的', audio: '/assets/voice/color_白色.mp3' }
  ],
  shape: [
    { id: 's1', label: '圆形', emoji: '⭕', say: '圆形，皮球是圆形的', audio: '/assets/voice/shape_圆形.mp3' },
    { id: 's2', label: '三角形', emoji: '🔺', say: '三角形，三明治是三角形的', audio: '/assets/voice/shape_三角形.mp3' },
    { id: 's3', label: '正方形', emoji: '⬜', say: '正方形，饼干是正方形的', audio: '/assets/voice/shape_正方形.mp3' },
    { id: 's4', label: '菱形', emoji: '🔶', say: '菱形，风筝是菱形的', audio: '/assets/voice/shape_菱形.mp3' },
    { id: 's5', label: '星形', emoji: '⭐', say: '星形，星星是星形的', audio: '/assets/voice/shape_星形.mp3' },
    { id: 's6', label: '心形', emoji: '💗', say: '心形，爱心是心形的', audio: '/assets/voice/shape_心形.mp3' },
    { id: 's7', label: '月牙', emoji: '🌙', say: '月牙，月亮弯弯像月牙', audio: '/assets/voice/shape_月牙.mp3' },
    { id: 's8', label: '十字', emoji: '➕', say: '十字，医院挂着十字', audio: '/assets/voice/shape_十字.mp3' }
  ]
}
