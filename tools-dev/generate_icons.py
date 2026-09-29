"""Dev only: draws placeholder app icons (pixel cat face) with Pillow."""
from PIL import Image, ImageDraw

BG = (46, 52, 64, 255)
ORANGE = (224, 138, 60, 255)
DARK = (150, 84, 30, 255)
CREAM = (246, 226, 196, 255)
EYE = (40, 30, 24, 255)
PINK = (226, 140, 140, 255)


def cat(size, pad):
    g = 16  # 16x16 pixel grid
    im = Image.new("RGBA", (g, g), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([2, 2, 4, 5], fill=ORANGE)      # left ear
    d.rectangle([11, 2, 13, 5], fill=ORANGE)    # right ear
    d.rectangle([3, 3, 3, 4], fill=PINK)
    d.rectangle([12, 3, 12, 4], fill=PINK)
    d.rectangle([2, 5, 13, 13], fill=ORANGE)    # head
    d.rectangle([2, 5, 13, 5], fill=ORANGE)
    for x in (5, 8, 11):                        # tabby stripes
        d.rectangle([x, 5, x, 6], fill=DARK)
    d.rectangle([5, 8, 6, 9], fill=EYE)
    d.rectangle([9, 8, 10, 9], fill=EYE)
    d.rectangle([5, 8, 5, 8], fill=CREAM)
    d.rectangle([9, 8, 9, 8], fill=CREAM)
    d.rectangle([6, 11, 9, 13], fill=CREAM)     # muzzle
    d.rectangle([7, 11, 8, 11], fill=PINK)
    inner = size - 2 * pad
    im = im.resize((inner, inner), Image.NEAREST)
    out = Image.new("RGBA", (size, size), BG)
    out.paste(im, (pad, pad), im)
    return out


for name, size, pad in [("icon-180.png", 180, 19), ("icon-192.png", 192, 20), ("icon-512.png", 512, 52),
                        ("icon-maskable-512.png", 512, 130)]:
    cat(size, pad).save(f"assets/icons/{name}")
