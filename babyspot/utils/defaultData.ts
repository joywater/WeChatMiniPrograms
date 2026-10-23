// 默认图库数据（内置内容，公共素材）
// 素材：人物/动物/颜色/形状分类使用扁平卡通插画（assets/images/）；
//       尚无插画的词条回退大号 Emoji。
// 语音：全部为预生成 mp3（scripts/gen_voice.py 生成），audio 字段自动同步；
//       say 字段仅作为音频生成源，运行时不读取。

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
  /** 卡片图标尺寸覆盖（rpx），默认 140；用于字形偏小/组合图标微调 */
  iconRpx?: number
  /** 首页分类卡插画（无则回退 emoji） */
  cover?: string
  /** 无音频分类：点击词条进入全屏预览页（如黑白卡） */
  silent?: boolean
}

export interface DefaultItem {
  id: string
  /** 卡片上显示的文字 */
  label: string
  emoji: string
  /** 朗读文案（仅作为 scripts/gen_voice.py 的音频生成源，运行时不再读取） */
  say?: string
  /** 采购插画后的图片路径，如 'assets/images/animal/cat.png' */
  img?: string
  /** 预生成朗读音频路径（scripts/gen_voice.py 生成），播放时唯一音源 */
  audio?: string
  /** 真实动物叫声等音效路径（代码包内路径），在朗读结束后播放 */
  sfx?: string
  /** 进阶词条：认知难度较高，图库中归入「进阶」板块（缺省为「常见」） */
  advanced?: boolean
}

export const categories: Category[] = [
  // ---- 首页主卡片（顺序即展示顺序，按宝宝月龄的认知发展先后排列） ----
  // 0-6 月：黑白卡（高对比视觉激发）→ 4 月+：颜色 → 12 月+：形状 → 动物
  // → 18 月+：家庭称呼 → 24 月+：职业
  // 注意：family 用两个独立单人脸 emoji 并排——家庭类组合/单码点 emoji（👪、👨‍👩‍👧）
  // 在部分安卓机型上会渲染成黑色剪影，独立单人脸则必定彩色。
  { id: 'bw', name: '黑白卡', emoji: '⬛', color: '#4A4A4A', light: '#EAEAEA', main: true, silent: true, cover: '/assets/images/cats/bw.png' },
  { id: 'color', name: '认识颜色', emoji: '🎨', color: '#5BA8E5', light: '#E3F1FD', main: true, cover: '/assets/images/cats/color.png' },
  { id: 'shape', name: '认识形状', emoji: '🔺', color: '#4DBBA4', light: '#E0F5EF', main: true, iconRpx: 190, cover: '/assets/images/cats/shape.png' },
  { id: 'animal', name: '认识动物', emoji: '🐱', color: '#F5A25D', light: '#FDF0DC', main: true, cover: '/assets/images/cats/animal.png' },
  { id: 'fruitveg', name: '果蔬', emoji: '🍎', color: '#7CB342', light: '#F1F8E9', main: true, cover: '/assets/images/cats/fruitveg.png' },
  { id: 'family', name: '家庭称呼', emoji: '👩👨', color: '#F2708A', light: '#FFE9E7', main: true, cover: '/assets/images/cats/family.png' },
  { id: 'job', name: '认识职业', emoji: '👮', color: '#9B7EDE', light: '#F0E9FB', main: true, cover: '/assets/images/cats/job.png' }
]

export const items: Record<string, DefaultItem[]> = {
  // 内容参照实体挂图《认识人物》规整：家人 15 称呼
  family: [
    { id: 'f1', label: '爸爸', emoji: '👨', say: '爸爸，爸爸是男生', img: '/assets/images/family/family_爸爸.jpg', audio: '/assets/voice/family_爸爸.mp3' },
    { id: 'f2', label: '妈妈', emoji: '👩', say: '妈妈，妈妈是女生', img: '/assets/images/family/family_妈妈.jpg', audio: '/assets/voice/family_妈妈.mp3' },
    { id: 'f3', label: '爷爷', emoji: '👴', say: '爷爷，爸爸的爸爸叫爷爷', img: '/assets/images/family/family_爷爷.jpg', audio: '/assets/voice/family_爷爷.mp3' },
    { id: 'f4', label: '奶奶', emoji: '👵', say: '奶奶，爸爸的妈妈叫奶奶', img: '/assets/images/family/family_奶奶.jpg', audio: '/assets/voice/family_奶奶.mp3' },
    { id: 'f5', label: '外公', emoji: '🧓', say: '外公，妈妈的爸爸叫外公', img: '/assets/images/family/family_外公.jpg', audio: '/assets/voice/family_外公.mp3' },
    { id: 'f6', label: '外婆', emoji: '👵', say: '外婆，妈妈的妈妈叫外婆', img: '/assets/images/family/family_外婆.jpg', audio: '/assets/voice/family_外婆.mp3' },
    { id: 'f7', label: '伯伯', emoji: '👨', say: '伯伯，爸爸的哥哥叫伯伯', img: '/assets/images/family/family_伯伯.jpg', audio: '/assets/voice/family_伯伯.mp3' },
    { id: 'f8', label: '叔叔', emoji: '👨', say: '叔叔，爸爸的弟弟叫叔叔', img: '/assets/images/family/family_叔叔.jpg', audio: '/assets/voice/family_叔叔.mp3' },
    { id: 'f9', label: '姑姑', emoji: '👩', say: '姑姑，爸爸的姐姐叫姑姑', img: '/assets/images/family/family_姑姑.jpg', audio: '/assets/voice/family_姑姑.mp3' },
    { id: 'f10', label: '舅舅', emoji: '👨', say: '舅舅，妈妈的哥哥叫舅舅', img: '/assets/images/family/family_舅舅.jpg', audio: '/assets/voice/family_舅舅.mp3' },
    { id: 'f11', label: '阿姨', emoji: '👩', say: '阿姨，妈妈的妹妹叫阿姨', img: '/assets/images/family/family_阿姨.jpg', audio: '/assets/voice/family_阿姨.mp3' },
    { id: 'f12', label: '哥哥', emoji: '👦', say: '哥哥，比宝宝大的男生', img: '/assets/images/family/family_哥哥.jpg', audio: '/assets/voice/family_哥哥.mp3' },
    { id: 'f13', label: '姐姐', emoji: '👧', say: '姐姐，比宝宝大的女生', img: '/assets/images/family/family_姐姐.jpg', audio: '/assets/voice/family_姐姐.mp3' },
    { id: 'f14', label: '弟弟', emoji: '🧒', say: '弟弟，比宝宝小的男生', img: '/assets/images/family/family_弟弟.jpg', audio: '/assets/voice/family_弟弟.mp3' },
    { id: 'f15', label: '妹妹', emoji: '👶', say: '妹妹，比宝宝小的女生', img: '/assets/images/family/family_妹妹.jpg', audio: '/assets/voice/family_妹妹.mp3' }
  ],
  // 职业按挂图规整为 19 种
  job: [
    { id: 'j1', label: '医生', emoji: '👨‍⚕️', say: '医生，生病了找医生', img: '/assets/images/job/job_医生.jpg', audio: '/assets/voice/job_医生.mp3' },
    { id: 'j2', label: '护士', emoji: '👩‍⚕️', say: '护士，护士帮忙打针', img: '/assets/images/job/job_护士.jpg', audio: '/assets/voice/job_护士.mp3' },
    { id: 'j3', label: '警察', emoji: '👮', say: '警察，警察保护大家', img: '/assets/images/job/job_警察.jpg', audio: '/assets/voice/job_警察.mp3' },
    { id: 'j4', label: '消防员', emoji: '👨‍🚒', say: '消防员，着火了找消防员', img: '/assets/images/job/job_消防员.jpg', audio: '/assets/voice/job_消防员.mp3' },
    { id: 'j5', label: '老师', emoji: '👩‍🏫', say: '老师，老师教宝宝本领', img: '/assets/images/job/job_老师.jpg', audio: '/assets/voice/job_老师.mp3' },
    { id: 'j6', label: '司机', emoji: '🚕', say: '司机，司机开车嘀嘀嘀', img: '/assets/images/job/job_司机.jpg', audio: '/assets/voice/job_司机.mp3' },
    { id: 'j7', label: '农民', emoji: '👨‍🌾', say: '农民，农民种出粮食', img: '/assets/images/job/job_农民.jpg', audio: '/assets/voice/job_农民.mp3' },
    { id: 'j8', label: '快递员', emoji: '📦', say: '快递员，快递员送来包裹', img: '/assets/images/job/job_快递员.jpg', audio: '/assets/voice/job_快递员.mp3' },
    { id: 'j9', label: '军人', emoji: '🪖', say: '军人，军人保卫祖国', img: '/assets/images/job/job_军人.jpg', audio: '/assets/voice/job_军人.mp3', advanced: true },
    { id: 'j10', label: '运动员', emoji: '⚽', say: '运动员，运动员身体棒', img: '/assets/images/job/job_运动员.jpg', audio: '/assets/voice/job_运动员.mp3', advanced: true },
    { id: 'j11', label: '摄影师', emoji: '📷', say: '摄影师，咔嚓咔嚓拍照', img: '/assets/images/job/job_摄影师.jpg', audio: '/assets/voice/job_摄影师.mp3', advanced: true },
    { id: 'j12', label: '工程师', emoji: '👷', say: '工程师，工程师盖高楼', img: '/assets/images/job/job_工程师.jpg', audio: '/assets/voice/job_工程师.mp3', advanced: true },
    { id: 'j13', label: '飞行员', emoji: '✈️', say: '飞行员，开飞机上天喽', img: '/assets/images/job/job_飞行员.jpg', audio: '/assets/voice/job_飞行员.mp3', advanced: true },
    { id: 'j14', label: '法官', emoji: '⚖️', say: '法官，法官公平又公正', img: '/assets/images/job/job_法官.jpg', audio: '/assets/voice/job_法官.mp3', advanced: true },
    { id: 'j15', label: '记者', emoji: '🎤', say: '记者，记者采访问问题', img: '/assets/images/job/job_记者.jpg', audio: '/assets/voice/job_记者.mp3', advanced: true },
    { id: 'j16', label: '科学家', emoji: '🔬', say: '科学家，科学家做实验', img: '/assets/images/job/job_科学家.jpg', audio: '/assets/voice/job_科学家.mp3', advanced: true },
    { id: 'j17', label: '学生', emoji: '🎒', say: '学生，学生上学学本领', img: '/assets/images/job/job_学生.jpg', audio: '/assets/voice/job_学生.mp3' },
    { id: 'j18', label: '服务员', emoji: '🍽️', say: '服务员，服务员端菜忙', img: '/assets/images/job/job_服务员.jpg', audio: '/assets/voice/job_服务员.mp3' },
    { id: 'j19', label: '画家', emoji: '🎨', say: '画家，画家画出美丽画', img: '/assets/images/job/job_画家.jpg', audio: '/assets/voice/job_画家.mp3', advanced: true }
  ],
  animal: [
    { id: 'a1', label: '小狗', emoji: '🐶', say: '小狗，小狗汪汪叫', sfx: '/assets/sfx/dog.mp3', img: '/assets/images/animal/animal_小狗.png', audio: '/assets/voice/animal_小狗.mp3' },
    { id: 'a2', label: '小猫', emoji: '🐱', say: '小猫，小猫喵喵叫', sfx: '/assets/sfx/cat.mp3', img: '/assets/images/animal/animal_小猫.png', audio: '/assets/voice/animal_小猫.mp3' },
    { id: 'a3', label: '鸭子', emoji: '🦆', say: '鸭子，鸭子嘎嘎叫', sfx: '/assets/sfx/duck.mp3', img: '/assets/images/animal/animal_鸭子.png', audio: '/assets/voice/animal_鸭子.mp3' },
    { id: 'a4', label: '大象', emoji: '🐘', say: '大象，大象鼻子长', sfx: '/assets/sfx/elephant.mp3', img: '/assets/images/animal/animal_大象.png', audio: '/assets/voice/animal_大象.mp3' },
    { id: 'a5', label: '老虎', emoji: '🐯', say: '老虎，老虎是森林之王', sfx: '/assets/sfx/tiger.mp3', img: '/assets/images/animal/animal_老虎.png', audio: '/assets/voice/animal_老虎.mp3' },
    { id: 'a6', label: '小兔', emoji: '🐰', say: '小兔，小兔爱吃萝卜，蹦蹦跳跳', img: '/assets/images/animal/animal_小兔.png', audio: '/assets/voice/animal_小兔.mp3' },
    { id: 'a7', label: '熊猫', emoji: '🐼', say: '熊猫，熊猫爱吃竹子', sfx: '/assets/sfx/panda.mp3', img: '/assets/images/animal/animal_熊猫.png', audio: '/assets/voice/animal_熊猫.mp3' },
    { id: 'a8', label: '狮子', emoji: '🦁', say: '狮子，狮子有大鬃毛，嗷呜', img: '/assets/images/animal/animal_狮子.png', audio: '/assets/voice/animal_狮子.mp3' },
    { id: 'a9', label: '小猪', emoji: '🐷', say: '小猪，小猪圆滚滚', img: '/assets/images/animal/animal_小猪.png', audio: '/assets/voice/animal_小猪.mp3' },
    { id: 'a10', label: '猴子', emoji: '🐵', say: '猴子，猴子爱爬树', img: '/assets/images/animal/animal_猴子.png', audio: '/assets/voice/animal_猴子.mp3' },
    { id: 'a11', label: '奶牛', emoji: '🐄', say: '奶牛，奶牛产出牛奶', img: '/assets/images/animal/animal_奶牛.png', audio: '/assets/voice/animal_奶牛.mp3' },
    { id: 'a12', label: '青蛙', emoji: '🐸', say: '青蛙，青蛙呱呱叫', img: '/assets/images/animal/animal_青蛙.png', audio: '/assets/voice/animal_青蛙.mp3' },
    { id: 'a13', label: '企鹅', emoji: '🐧', say: '企鹅，企鹅摇摇摆摆走', img: '/assets/images/animal/animal_企鹅.png', audio: '/assets/voice/animal_企鹅.mp3' },
    { id: 'a14', label: '小鸡', emoji: '🐤', say: '小鸡，小鸡叽叽叽', img: '/assets/images/animal/animal_小鸡.png', audio: '/assets/voice/animal_小鸡.mp3' },
    { id: 'a15', label: '长颈鹿', emoji: '🦒', say: '长颈鹿，长颈鹿脖子长', img: '/assets/images/animal/animal_长颈鹿.png', audio: '/assets/voice/animal_长颈鹿.mp3' },
    { id: 'a16', label: '乌龟', emoji: '🐢', say: '乌龟，乌龟慢慢爬', img: '/assets/images/animal/animal_乌龟.png', audio: '/assets/voice/animal_乌龟.mp3' },
    // 第二批：参照动物挂图补充
    { id: 'a17', label: '牛', emoji: '🐄', say: '牛，牛哞哞叫', img: '/assets/images/animal/animal_牛.png', audio: '/assets/voice/animal_牛.mp3' },
    { id: 'a18', label: '马', emoji: '🐴', say: '马，马儿跑得快', img: '/assets/images/animal/animal_马.png', audio: '/assets/voice/animal_马.mp3' },
    { id: 'a19', label: '绵羊', emoji: '🐑', say: '绵羊，绵羊毛软软的', img: '/assets/images/animal/animal_绵羊.png', audio: '/assets/voice/animal_绵羊.mp3' },
    { id: 'a20', label: '公鸡', emoji: '🐓', say: '公鸡，公鸡喔喔叫', img: '/assets/images/animal/animal_公鸡.png', audio: '/assets/voice/animal_公鸡.mp3' },
    { id: 'a21', label: '鹅', emoji: '🦢', say: '鹅，鹅嘎嘎叫', img: '/assets/images/animal/animal_鹅.png', audio: '/assets/voice/animal_鹅.mp3' },
    { id: 'a22', label: '孔雀', emoji: '🦚', say: '孔雀，孔雀开屏真漂亮', img: '/assets/images/animal/animal_孔雀.png', audio: '/assets/voice/animal_孔雀.mp3' },
    { id: 'a23', label: '猫头鹰', emoji: '🦉', say: '猫头鹰，猫头鹰晚上出来', img: '/assets/images/animal/animal_猫头鹰.png', audio: '/assets/voice/animal_猫头鹰.mp3' },
    { id: 'a24', label: '蜜蜂', emoji: '🐝', say: '蜜蜂，蜜蜂嗡嗡采花蜜', img: '/assets/images/animal/animal_蜜蜂.png', audio: '/assets/voice/animal_蜜蜂.mp3' }
  ],
  // 果蔬：水果 + 蔬菜合并分类，参照挂图选取宝宝友好、辨识度高的项；emoji 兜底
  fruitveg: [
    { id: 'fv1', label: '苹果', emoji: '🍎', say: '苹果，苹果红红的甜甜的', audio: '/assets/voice/fruitveg_苹果.mp3' },
    { id: 'fv2', label: '香蕉', emoji: '🍌', say: '香蕉，香蕉弯弯像小船', audio: '/assets/voice/fruitveg_香蕉.mp3' },
    { id: 'fv3', label: '西瓜', emoji: '🍉', say: '西瓜，西瓜夏天解渴', audio: '/assets/voice/fruitveg_西瓜.mp3' },
    { id: 'fv4', label: '葡萄', emoji: '🍇', say: '葡萄，葡萄一串一串的', audio: '/assets/voice/fruitveg_葡萄.mp3' },
    { id: 'fv5', label: '草莓', emoji: '🍓', say: '草莓，草莓小小的好吃', audio: '/assets/voice/fruitveg_草莓.mp3' },
    { id: 'fv6', label: '橘子', emoji: '🍊', say: '橘子，橘子酸酸甜甜', audio: '/assets/voice/fruitveg_橘子.mp3' },
    { id: 'fv7', label: '梨', emoji: '🍐', say: '梨，梨水分多', audio: '/assets/voice/fruitveg_梨.mp3' },
    { id: 'fv8', label: '桃子', emoji: '🍑', say: '桃子，桃子粉粉的', audio: '/assets/voice/fruitveg_桃子.mp3' },
    { id: 'fv9', label: '番茄', emoji: '🍅', say: '番茄，番茄红红的做菜吃', audio: '/assets/voice/fruitveg_番茄.mp3' },
    { id: 'fv10', label: '黄瓜', emoji: '🥒', say: '黄瓜，黄瓜绿绿的长长的', audio: '/assets/voice/fruitveg_黄瓜.mp3' },
    { id: 'fv11', label: '玉米', emoji: '🌽', say: '玉米，玉米甜甜的', audio: '/assets/voice/fruitveg_玉米.mp3' },
    { id: 'fv12', label: '茄子', emoji: '🍆', say: '茄子，茄子紫紫的', audio: '/assets/voice/fruitveg_茄子.mp3' },
    { id: 'fv13', label: '南瓜', emoji: '🎃', say: '南瓜，南瓜橙橙的', audio: '/assets/voice/fruitveg_南瓜.mp3' },
    { id: 'fv14', label: '蘑菇', emoji: '🍄', say: '蘑菇，蘑菇像小伞', audio: '/assets/voice/fruitveg_蘑菇.mp3' }
  ],
  color: [
    { id: 'c1', label: '红色', emoji: '🔴', say: '红色，苹果是红色的', audio: '/assets/voice/color_红色.mp3' },
    { id: 'c2', label: '黄色', emoji: '🟡', say: '黄色，香蕉是黄色的', audio: '/assets/voice/color_黄色.mp3' },
    { id: 'c3', label: '蓝色', emoji: '🔵', say: '蓝色，天空是蓝色的', audio: '/assets/voice/color_蓝色.mp3' },
    { id: 'c4', label: '绿色', emoji: '🟢', say: '绿色，小草是绿色的', audio: '/assets/voice/color_绿色.mp3' },
    { id: 'c5', label: '橙色', emoji: '🟠', say: '橙色，橘子是橙色的', audio: '/assets/voice/color_橙色.mp3' },
    { id: 'c6', label: '紫色', emoji: '🟣', say: '紫色，葡萄是紫色的', audio: '/assets/voice/color_紫色.mp3' },
    { id: 'c7', label: '黑色', emoji: '⚫', say: '黑色，夜晚是黑色的', audio: '/assets/voice/color_黑色.mp3' },
    { id: 'c8', label: '白色', emoji: '⚪', say: '白色，雪花是白色的', audio: '/assets/voice/color_白色.mp3' },
    { id: 'c9', label: '棕色', emoji: '🟤', say: '棕色，巧克力是棕色的', img: '/assets/images/color/color_棕色.png', audio: '/assets/voice/color_棕色.mp3' },
    { id: 'c10', label: '粉色', emoji: '🌸', say: '粉色，桃花是粉色的', img: '/assets/images/color/color_粉色.png', audio: '/assets/voice/color_粉色.mp3' },
    { id: 'c11', label: '灰色', emoji: '🐭', say: '灰色，小老鼠是灰色的', img: '/assets/images/color/color_灰色.png', audio: '/assets/voice/color_灰色.mp3' },
    { id: 'c12', label: '金色', emoji: '🌾', say: '金色，麦田是金色的', img: '/assets/images/color/color_金色.png', audio: '/assets/voice/color_金色.mp3' }
  ],
  shape: [
    { id: 's1', label: '圆形', emoji: '⭕', say: '圆形，皮球是圆形的', audio: '/assets/voice/shape_圆形.mp3' },
    { id: 's2', label: '三角形', emoji: '🔺', say: '三角形，三明治是三角形的', audio: '/assets/voice/shape_三角形.mp3' },
    { id: 's3', label: '正方形', emoji: '⬜', say: '正方形，饼干是正方形的', audio: '/assets/voice/shape_正方形.mp3' },
    { id: 's4', label: '菱形', emoji: '🔶', say: '菱形，风筝是菱形的', audio: '/assets/voice/shape_菱形.mp3' },
    { id: 's5', label: '星形', emoji: '⭐', say: '星形，星星是星形的', audio: '/assets/voice/shape_星形.mp3' },
    { id: 's6', label: '心形', emoji: '💗', say: '心形，爱心是心形的', audio: '/assets/voice/shape_心形.mp3' },
    { id: 's7', label: '月牙', emoji: '🌙', say: '月牙，月亮弯弯像月牙', audio: '/assets/voice/shape_月牙.mp3' },
    { id: 's8', label: '十字', emoji: '➕', say: '十字，医院挂着十字', audio: '/assets/voice/shape_十字.mp3' },
    { id: 's9', label: '椭圆形', emoji: '🥚', say: '椭圆形，鸡蛋是椭圆形的', img: '/assets/images/shape/shape_椭圆形.png', audio: '/assets/voice/shape_椭圆形.mp3' },
    { id: 's10', label: '长方形', emoji: '🚪', say: '长方形，门是长方形的', img: '/assets/images/shape/shape_长方形.png', audio: '/assets/voice/shape_长方形.mp3' },
    { id: 's11', label: '半圆形', emoji: '🌈', say: '半圆形，彩虹是半圆形的', img: '/assets/images/shape/shape_半圆形.png', audio: '/assets/voice/shape_半圆形.mp3' },
    { id: 's12', label: '梯形', emoji: '🛝', say: '梯形，滑梯是梯形的', img: '/assets/images/shape/shape_梯形.png', audio: '/assets/voice/shape_梯形.mp3' }
  ],

  // 黑白卡：0-6 个月新生儿视觉激发，高对比度无声音，点击进入全屏预览
  // say 置空使 gen_voice.py 跳过本分类（不生成、不引用任何音频）
  bw: [
    { id: 'b1', label: '靶心', emoji: '🎯', img: '/assets/images/bw/bw_靶心.png', say: '' },
    { id: 'b2', label: '棋盘', emoji: '🔲', img: '/assets/images/bw/bw_棋盘.png', say: '' },
    { id: 'b3', label: '条纹', emoji: '🦓', img: '/assets/images/bw/bw_条纹.png', say: '' },
    { id: 'b4', label: '斜纹', emoji: '➰', img: '/assets/images/bw/bw_斜纹.png', say: '' },
    { id: 'b5', label: '波点', emoji: '⚪', img: '/assets/images/bw/bw_波点.png', say: '' },
    { id: 'b6', label: '波浪', emoji: '🌊', img: '/assets/images/bw/bw_波浪.png', say: '' },
    { id: 'b7', label: '笑脸', emoji: '😊', img: '/assets/images/bw/bw_笑脸.png', say: '' },
    { id: 'b8', label: '三角', emoji: '🔺', img: '/assets/images/bw/bw_三角.png', say: '' },
    { id: 'b9', label: '方格', emoji: '🔟', img: '/assets/images/bw/bw_方格.png', say: '' },
    { id: 'b10', label: '放射', emoji: '☀️', img: '/assets/images/bw/bw_放射.png', say: '' },
    { id: 'b11', label: '星星', emoji: '⭐', img: '/assets/images/bw/bw_星星.png', say: '' },
    { id: 'b12', label: '回形', emoji: '🔲', img: '/assets/images/bw/bw_回形.png', say: '' },
    // 第二批：参照黑白挂图补充的具象图形（仅收录轮廓清晰、宝宝友好的；
    // 松鼠/河马/旋转木马等绘制效果差或不友好的未收录）
    { id: 'b13', label: '闪电', emoji: '⚡', img: '/assets/images/bw/bw_闪电.png', say: '' },
    { id: 'b14', label: '大树', emoji: '🌳', img: '/assets/images/bw/bw_大树.png', say: '' },
    { id: 'b15', label: '蝴蝶', emoji: '🦋', img: '/assets/images/bw/bw_蝴蝶.png', say: '' },
    { id: 'b16', label: '小鱼', emoji: '🐟', img: '/assets/images/bw/bw_小鱼.png', say: '' },
    { id: 'b17', label: '兔子', emoji: '🐰', img: '/assets/images/bw/bw_兔子.png', say: '' },
    { id: 'b18', label: '螃蟹', emoji: '🦀', img: '/assets/images/bw/bw_螃蟹.png', say: '' },
    { id: 'b19', label: '鲸鱼', emoji: '🐳', img: '/assets/images/bw/bw_鲸鱼.png', say: '' },
    { id: 'b20', label: '樱桃', emoji: '🍒', img: '/assets/images/bw/bw_樱桃.png', say: '' },
    { id: 'b21', label: '草莓', emoji: '🍓', img: '/assets/images/bw/bw_草莓.png', say: '' },
    { id: 'b22', label: '冰淇淋', emoji: '🍦', img: '/assets/images/bw/bw_冰淇淋.png', say: '' },
    { id: 'b23', label: '奶瓶', emoji: '🍼', img: '/assets/images/bw/bw_奶瓶.png', say: '' },
    { id: 'b24', label: '帽子', emoji: '🧢', img: '/assets/images/bw/bw_帽子.png', say: '' }
  ]
}
