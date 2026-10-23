# -*- coding: utf-8 -*-
"""黑白卡补充批次：参照挂图新增 12 张图形卡（白底黑图，1024x1024）。
仅选轮廓清晰、对新生儿友好、可矢量绘制的图形；
复杂/不友好的（松鼠、河马、旋转木马等）不收录。
2x 超采样绘制后缩到 1024，PNG8 量化控制包体。
"""
import os
from PIL import Image, ImageDraw

SS = 2            # 超采样倍数
OUT = 1024        # 输出尺寸
S = OUT * SS      # 画布尺寸
BLACK = (17, 17, 17)
WHITE = (255, 255, 255)

DEST = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images', 'bw')


def new_canvas():
    img = Image.new('RGB', (S, S), WHITE)
    return img, ImageDraw.Draw(img)


def P(x, y):
    """设计坐标(0-1) -> 画布像素"""
    return (x * S, y * S)


def save(img, name):
    img = img.resize((OUT, OUT), Image.LANCZOS).convert('RGB')
    img = img.quantize(256, method=Image.FASTOCTREE)
    path = os.path.join(DEST, 'bw_%s.png' % name)
    img.save(path, optimize=True)
    print(name, os.path.getsize(path) // 1024, 'KB')


# ---------------- 各图形 ----------------

def dianshan(img, d):
    """闪电"""
    pts = [(0.60, 0.08), (0.28, 0.54), (0.46, 0.54),
           (0.36, 0.92), (0.72, 0.42), (0.53, 0.42)]
    d.polygon([P(*p) for p in pts], fill=BLACK)


def dashu(img, d):
    """大树：云朵状树冠 + 树干"""
    for cx, cy, r in [(0.50, 0.36, 0.26), (0.30, 0.44, 0.17), (0.70, 0.44, 0.17),
                      (0.42, 0.26, 0.16), (0.60, 0.27, 0.16)]:
        d.ellipse([P(cx - r, cy - r), P(cx + r, cy + r)], fill=BLACK)
    # 树干（上窄下宽，底部微外撇）
    trunk = [(0.44, 0.40), (0.56, 0.40), (0.60, 0.94), (0.52, 0.94),
             (0.50, 0.78), (0.48, 0.94), (0.40, 0.94)]
    d.polygon([P(*p) for p in trunk], fill=BLACK)
    # 地面
    d.rounded_rectangle([P(0.26, 0.90), P(0.74, 0.95)], radius=0.02 * S, fill=BLACK)


def hudie(img, d):
    """蝴蝶：对称翅膀 + 身体 + 触角"""
    # 上翅（大椭圆，左右对称，微外倾）
    d.ellipse([P(0.08, 0.22), P(0.50, 0.62)], fill=BLACK)
    d.ellipse([P(0.50, 0.22), P(0.92, 0.62)], fill=BLACK)
    # 下翅（小椭圆）
    d.ellipse([P(0.16, 0.55), P(0.50, 0.86)], fill=BLACK)
    d.ellipse([P(0.50, 0.55), P(0.84, 0.86)], fill=BLACK)
    # 身体
    d.ellipse([P(0.44, 0.28), P(0.56, 0.84)], fill=BLACK)
    # 头
    d.ellipse([P(0.43, 0.20), P(0.57, 0.34)], fill=BLACK)
    # 触角（两根粗线外撇 + 端点圆）
    d.line([P(0.47, 0.24), P(0.38, 0.10)], fill=BLACK, width=9 * SS)
    d.line([P(0.53, 0.24), P(0.62, 0.10)], fill=BLACK, width=9 * SS)
    for cx, cy in ((0.38, 0.10), (0.62, 0.10)):
        d.ellipse([P(cx - 0.025, cy - 0.025), P(cx + 0.025, cy + 0.025)], fill=BLACK)
    # 翅上白点（保持高对比层次）
    for cx, cy, r in [(0.28, 0.38, 0.055), (0.72, 0.38, 0.055),
                      (0.32, 0.70, 0.035), (0.68, 0.70, 0.035)]:
        d.ellipse([P(cx - r, cy - r), P(cx + r, cy + r)], fill=WHITE)


def xiaoyu(img, d):
    """小鱼：身体 + 尾鳍 + 背鳍 + 白眼睛"""
    d.ellipse([P(0.14, 0.34), P(0.74, 0.72)], fill=BLACK)          # 身体
    d.polygon([P(0.70, 0.53), P(0.94, 0.32), P(0.94, 0.74)], fill=BLACK)  # 尾鳍
    d.polygon([P(0.38, 0.36), P(0.50, 0.18), P(0.58, 0.36)], fill=BLACK)  # 背鳍
    d.polygon([P(0.38, 0.70), P(0.50, 0.88), P(0.58, 0.70)], fill=BLACK)  # 腹鳍
    d.ellipse([P(0.26, 0.46), P(0.36, 0.56)], fill=WHITE)          # 眼白
    d.ellipse([P(0.29, 0.49), P(0.35, 0.55)], fill=BLACK)          # 瞳孔
    # 嘴（白弧）
    d.arc([P(0.16, 0.48), P(0.26, 0.62)], start=300, end=90, fill=WHITE, width=6 * SS)


def tuzi(img, d):
    """兔子：圆脸 + 长耳 + 白眼 + 鼻牙"""
    # 耳朵（长椭圆，内耳白）
    d.ellipse([P(0.26, 0.04), P(0.44, 0.52)], fill=BLACK)
    d.ellipse([P(0.56, 0.04), P(0.74, 0.52)], fill=BLACK)
    d.ellipse([P(0.31, 0.12), P(0.39, 0.40)], fill=WHITE)
    d.ellipse([P(0.61, 0.12), P(0.69, 0.40)], fill=WHITE)
    # 脸
    d.ellipse([P(0.16, 0.34), P(0.84, 0.96)], fill=BLACK)
    # 眼睛
    d.ellipse([P(0.32, 0.54), P(0.42, 0.64)], fill=WHITE)
    d.ellipse([P(0.58, 0.54), P(0.68, 0.64)], fill=WHITE)
    # 鼻子（白三角）+ 嘴（白弧）
    d.polygon([P(0.46, 0.72), P(0.54, 0.72), P(0.50, 0.78)], fill=WHITE)
    d.arc([P(0.40, 0.70), P(0.50, 0.84)], start=20, end=160, fill=WHITE, width=6 * SS)
    d.arc([P(0.50, 0.70), P(0.60, 0.84)], start=20, end=160, fill=WHITE, width=6 * SS)


def pangxie(img, d):
    """螃蟹：宽身 + 大螯 + 腿 + 眼睛"""
    # 腿（左右各三根粗线）
    for i, (x1, y1, x2, y2) in enumerate([
            (0.22, 0.52, 0.06, 0.42), (0.20, 0.60, 0.04, 0.62), (0.22, 0.68, 0.07, 0.80),
            (0.78, 0.52, 0.94, 0.42), (0.80, 0.60, 0.96, 0.62), (0.78, 0.68, 0.93, 0.80)]):
        d.line([P(x1, y1), P(x2, y2)], fill=BLACK, width=16 * SS)
    # 大螯（圆 + 白色楔口）
    for cx in (0.14, 0.86):
        d.ellipse([P(cx - 0.11, 0.18), P(cx + 0.11, 0.40)], fill=BLACK)
        d.polygon([P(cx - 0.05, 0.18), P(cx + 0.05, 0.18),
                   P(cx, 0.30)], fill=WHITE)
    # 螯臂
    d.line([P(0.14, 0.36), P(0.32, 0.52)], fill=BLACK, width=18 * SS)
    d.line([P(0.86, 0.36), P(0.68, 0.52)], fill=BLACK, width=18 * SS)
    # 身体（宽椭圆）
    d.ellipse([P(0.20, 0.40), P(0.80, 0.86)], fill=BLACK)
    # 眼睛（立起的白眼 + 黑瞳）
    for cx in (0.40, 0.60):
        d.ellipse([P(cx - 0.07, 0.52), P(cx + 0.07, 0.66)], fill=WHITE)
        d.ellipse([P(cx - 0.03, 0.56), P(cx + 0.03, 0.62)], fill=BLACK)
    # 笑嘴（白弧）
    d.arc([P(0.42, 0.66), P(0.58, 0.78)], start=20, end=160, fill=WHITE, width=6 * SS)


def jingyu(img, d):
    """鲸鱼：纯黑剪影 + V 形尾鳍 + 头顶喷水"""
    # 身体（大椭圆，头朝左）
    d.ellipse([P(0.06, 0.42), P(0.80, 0.86)], fill=BLACK)
    # 尾柄连接部
    d.rectangle([P(0.66, 0.50), P(0.82, 0.70)], fill=BLACK)
    # V 形尾鳍（单一多边形，内凹缺口）
    fluke = [(0.70, 0.55), (0.94, 0.30), (0.99, 0.40), (0.87, 0.58),
             (0.99, 0.74), (0.94, 0.84), (0.70, 0.68)]
    d.polygon([P(*p) for p in fluke], fill=BLACK)
    # 眼睛
    d.ellipse([P(0.20, 0.56), P(0.28, 0.64)], fill=WHITE)
    d.ellipse([P(0.22, 0.58), P(0.26, 0.62)], fill=BLACK)
    # 笑嘴（白弧）
    d.arc([P(0.14, 0.62), P(0.28, 0.74)], start=30, end=140, fill=WHITE, width=6 * SS)
    # 头顶喷水（三道扇形粗线）
    for tx, ty in ((0.11, 0.14), (0.21, 0.09), (0.31, 0.14)):
        d.line([P(0.21, 0.42), P(tx, ty)], fill=BLACK, width=10 * SS)
        d.ellipse([P(tx - 0.03, ty - 0.03), P(tx + 0.03, ty + 0.03)], fill=BLACK)


def yingtao(img, d):
    """樱桃：两颗果 + 弧形双梗 + 叶"""
    # 果梗（带弧度的双线汇于顶点）
    d.line([P(0.36, 0.64), P(0.35, 0.48), P(0.41, 0.32), P(0.50, 0.22)],
           fill=BLACK, width=13 * SS, joint='curve')
    d.line([P(0.64, 0.64), P(0.65, 0.48), P(0.59, 0.32), P(0.50, 0.22)],
           fill=BLACK, width=13 * SS, joint='curve')
    # 叶子（尖头叶形，盖在梗顶）
    d.polygon([P(0.50, 0.24), P(0.60, 0.12), P(0.74, 0.14), P(0.68, 0.26),
               P(0.56, 0.30)], fill=BLACK)
    # 两颗果实
    d.ellipse([P(0.18, 0.58), P(0.54, 0.94)], fill=BLACK)
    d.ellipse([P(0.46, 0.58), P(0.82, 0.94)], fill=BLACK)
    # 高光白点
    d.ellipse([P(0.26, 0.66), P(0.34, 0.74)], fill=WHITE)
    d.ellipse([P(0.54, 0.66), P(0.62, 0.74)], fill=WHITE)


def caomei(img, d):
    """草莓：圆润果身 + 白籽 + 顶蒂叶 + 果梗"""
    # 果身（椭圆 + 底部收尖）
    body = [(0.24, 0.44), (0.76, 0.44), (0.71, 0.66), (0.57, 0.86), (0.50, 0.92),
            (0.43, 0.86), (0.29, 0.66)]
    d.polygon([P(*p) for p in body], fill=BLACK)
    d.ellipse([P(0.24, 0.28), P(0.76, 0.64)], fill=BLACK)
    # 白籽
    seeds = [(0.36, 0.46), (0.50, 0.42), (0.64, 0.46), (0.42, 0.60),
             (0.58, 0.60), (0.50, 0.74)]
    for sx, sy in seeds:
        d.ellipse([P(sx - 0.022, sy - 0.032), P(sx + 0.022, sy + 0.032)], fill=WHITE)
    # 果梗
    d.line([P(0.50, 0.08), P(0.50, 0.26)], fill=BLACK, width=12 * SS)
    # 顶蒂（一小片黑盖住果肩，圆润不突兀）
    d.polygon([P(0.38, 0.24), P(0.62, 0.24), P(0.56, 0.36), P(0.44, 0.36)], fill=BLACK)
    d.ellipse([P(0.44, 0.16), P(0.56, 0.30)], fill=BLACK)


def bingqilin(img, d):
    """冰淇淋：甜筒 + 冰球 + 格纹"""
    # 蛋筒（倒三角）
    d.polygon([P(0.30, 0.50), P(0.70, 0.50), P(0.50, 0.94)], fill=BLACK)
    # 格纹白线
    d.line([P(0.36, 0.62), P(0.56, 0.52)], fill=WHITE, width=6 * SS)
    d.line([P(0.44, 0.74), P(0.63, 0.58)], fill=WHITE, width=6 * SS)
    d.line([P(0.64, 0.62), P(0.44, 0.52)], fill=WHITE, width=6 * SS)
    d.line([P(0.56, 0.74), P(0.37, 0.58)], fill=WHITE, width=6 * SS)
    # 冰球（大圆）+ 滴落
    d.ellipse([P(0.22, 0.12), P(0.78, 0.62)], fill=BLACK)
    d.ellipse([P(0.34, 0.26), P(0.44, 0.36)], fill=WHITE)


def naiping(img, d):
    """奶瓶：奶嘴 + 瓶身 + 刻度"""
    # 奶嘴（半圆）
    d.ellipse([P(0.40, 0.06), P(0.60, 0.26)], fill=BLACK)
    # 瓶环
    d.rounded_rectangle([P(0.36, 0.22), P(0.64, 0.32)], radius=0.03 * S, fill=BLACK)
    # 瓶身（圆角矩形）
    d.rounded_rectangle([P(0.30, 0.30), P(0.70, 0.92)], radius=0.06 * S, fill=BLACK)
    # 刻度（白横线）
    for y in (0.48, 0.58, 0.68, 0.78):
        d.line([P(0.38, y), P(0.52, y)], fill=WHITE, width=7 * SS)


def maozi(img, d):
    """鸭舌帽：半圆帽冠 + 连体帽檐 + 帽扣"""
    # 帽冠（半圆，平底在 y=0.58）
    d.pieslice([P(0.16, 0.28), P(0.72, 0.88)], start=180, end=360, fill=BLACK)
    # 帽檐（与帽冠连体的圆角扁条，向右伸出）
    d.rounded_rectangle([P(0.38, 0.55), P(0.96, 0.67)], radius=0.05 * S, fill=BLACK)
    # 帽檐微微下垂的尖端
    d.polygon([P(0.80, 0.55), P(0.96, 0.55), P(0.96, 0.67), P(0.92, 0.72), P(0.84, 0.64)], fill=BLACK)
    # 帽扣（白点）
    d.ellipse([P(0.41, 0.32), P(0.47, 0.38)], fill=WHITE)


FIGS = {
    '闪电': dianshan, '大树': dashu, '蝴蝶': hudie, '小鱼': xiaoyu,
    '兔子': tuzi, '螃蟹': pangxie, '鲸鱼': jingyu, '樱桃': yingtao,
    '草莓': caomei, '冰淇淋': bingqilin, '奶瓶': naiping, '帽子': maozi,
}


def main():
    if not os.path.isdir(DEST):
        os.makedirs(DEST)
    for name, fn in FIGS.items():
        img, d = new_canvas()
        fn(img, d)
        save(img, name)


if __name__ == '__main__':
    main()
