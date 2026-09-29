"""Dev only: procedurally draws Po's placeholder spritesheet with Pillow.

Writes assets/po/po-sheet.png (one row per state, 32x32 frames) and po-sheet.json (frame map).
Replace with hand-drawn art later by keeping the same layout and JSON.
Run from the repo root:  python3 tools-dev/generate_po.py
"""
import json
from PIL import Image, ImageDraw

F = 32
COLS = 6
STATES = [  # name, frames (SPEC §10)
    ("idle-loaf", 4), ("sit", 4), ("breathe-in", 6), ("breathe-out", 6), ("sleep", 4), ("purr", 4),
    ("walk", 6), ("wash", 6), ("watch-bird", 4), ("yawn-settle", 6), ("stretch", 6),
]
OUT = (74, 42, 20, 255)
ORANGE = (224, 138, 60, 255)
STRIPE = (168, 92, 34, 255)
CREAM = (246, 226, 196, 255)
PINK = (226, 140, 140, 255)
EYE = (40, 30, 24, 255)


def tri(n, total):  # 0 -> 1 -> 0 across frames
    x = n / max(total - 1, 1)
    return 1 - abs(2 * x - 1)


def cat(**p):
    bw, bh = p.get("bw", 18), p.get("bh", 11)
    dx, hdy = p.get("dx", 0), p.get("hdy", 0)
    eyes, mouth = p.get("eyes", "open"), p.get("mouth", 0)
    tail, paw, legs = p.get("tail", 0), p.get("paw", 0), p.get("legs", (0, 0))
    im = Image.new("RGBA", (F, F), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx, base = 16 + dx, 29
    top = base - bh
    # tail
    tx = cx + bw // 2
    d.rectangle([tx, top + 2 - tail, tx + 2, base - 1], fill=ORANGE, outline=OUT)
    # body
    d.rectangle([cx - bw // 2, top, cx + bw // 2 - 1, base], fill=ORANGE, outline=OUT)
    d.rectangle([cx - bw // 2 + 1, top + 3, cx + bw // 2 - 2, top + 3], fill=STRIPE)
    # feet
    for i, x in enumerate((cx - 6, cx + 2)):
        d.rectangle([x, base - 1 - legs[i], x + 3, base], fill=CREAM, outline=OUT)
    # head
    hy = top - 8 + hdy
    d.rectangle([cx - 7, hy, cx + 6, hy + 10], fill=ORANGE, outline=OUT)
    for ex in (cx - 7, cx + 4):  # ears
        d.rectangle([ex, hy - 3, ex + 2, hy], fill=ORANGE, outline=OUT)
        d.point((ex + 1, hy - 1), fill=PINK)
    for x in (cx - 3, cx, cx + 3):  # forehead stripes
        d.rectangle([x, hy + 1, x, hy + 2], fill=STRIPE)
    ey = hy + 4
    if eyes == "open":
        for x in (cx - 4, cx + 2):
            d.rectangle([x, ey, x + 1, ey + 1], fill=EYE)
            d.point((x, ey), fill=CREAM)
    elif eyes == "wide":
        for x in (cx - 4, cx + 2):
            d.rectangle([x, ey - 1, x + 1, ey + 2], fill=EYE)
            d.point((x, ey - 1), fill=CREAM)
    elif eyes == "happy":
        for x in (cx - 4, cx + 2):
            d.point((x, ey + 1), fill=EYE); d.point((x + 1, ey), fill=EYE)
    else:  # closed
        for x in (cx - 4, cx + 2):
            d.rectangle([x, ey + 1, x + 1, ey + 1], fill=EYE)
    d.rectangle([cx - 2, hy + 7, cx + 1, hy + 9], fill=CREAM)
    d.point((cx - 1, hy + 7), fill=PINK); d.point((cx, hy + 7), fill=PINK)
    if mouth:
        d.rectangle([cx - 1, hy + 9, cx, hy + 8 + mouth], fill=OUT)
    if paw:  # raised paw beside face
        d.rectangle([cx + 6, hy + 5 - paw, cx + 8, hy + 8 - paw], fill=CREAM, outline=OUT)
    return im


def frame(state, n, total):
    t = tri(n, total)
    if state == "idle-loaf":
        return cat(bh=10, bw=20, hdy=2, eyes="closed" if n == 2 else "open", tail=(n % 2) * 2)
    if state == "sit":
        return cat(bh=13, bw=16, eyes="closed" if n == 3 else "open", tail=(n == 1) * 1)
    if state in ("breathe-in", "breathe-out"):
        k = n / (total - 1)
        k = k if state == "breathe-in" else 1 - k
        return cat(bw=16 + round(6 * k), bh=11 + round(2 * k), hdy=-round(k))
    if state == "sleep":
        return cat(bw=20, bh=10 + (n in (1, 2)), hdy=2, eyes="closed")
    if state == "purr":
        return cat(dx=(-1, 0, 1, 0)[n], eyes="happy", bh=12)
    if state == "walk":
        return cat(dx=0, bh=12 + (n % 2), legs=((n % 3 == 0) * 2, (n % 3 == 1) * 2), tail=n % 3)
    if state == "wash":
        return cat(paw=1 + (n % 2) * 2, hdy=1, eyes="closed" if n % 2 else "open")
    if state == "watch-bird":
        return cat(hdy=-2, eyes="wide", tail=(n % 2) * 3)
    if state == "yawn-settle":
        mouth = (0, 1, 2, 2, 0, 0)[n]
        return cat(mouth=mouth, eyes="closed" if n >= 1 else "open", hdy=(0, -1, -1, -1, 1, 2)[n],
                   bw=18 + (n >= 4) * 2, bh=(11, 12, 12, 12, 10, 10)[n])
    if state == "stretch":
        return cat(bw=18 + round(6 * t), bh=11 - round(3 * t), hdy=round(3 * t), legs=(0, round(2 * t)), eyes="closed" if t > .5 else "open")
    raise ValueError(state)


def main():
    sheet = Image.new("RGBA", (COLS * F, len(STATES) * F), (0, 0, 0, 0))
    fmap = {"frameSize": F, "cols": COLS, "rows": len(STATES), "states": {}}
    for row, (name, total) in enumerate(STATES):
        fmap["states"][name] = {"row": row, "frames": total}
        for n in range(total):
            sheet.paste(frame(name, n, total), (n * F, row * F))
    sheet.save("assets/po/po-sheet.png")
    with open("assets/po/po-sheet.json", "w") as f:
        json.dump(fmap, f, indent=1)


main()
