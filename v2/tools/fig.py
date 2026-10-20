#!/usr/bin/env python3
"""Textbook figure/table extraction helper for the MECH 325 v2 solver.

Books:  S = Shigley 11e (original_documents/M325S.pdf)
        M = Mott 6e     (original_documents/M325M.pdf)
        F = Fizz bible  (original_documents/Mech_325_Bible_Fizz.pdf)
        D = Mech "Dog"  (original_documents/Mech_325_Bible_Mech.pdf)

Usage (run from repo root):
  python3 v2/tools/fig.py find S "Figure 14-6"            # pages where a caption appears (dash-agnostic)
  python3 v2/tools/fig.py find M "TABLE 9-1" --all       # every page mentioning it
  python3 v2/tools/fig.py preview S 780                   # writes v2/tools/preview/S_780.png with a coordinate grid
  python3 v2/tools/fig.py text S 780                      # dump page text
  python3 v2/tools/fig.py crop S 780 40 80 560 420 v2/figures/shigley/fig14-6.png
        # x0 y0 x1 y1 are PDF points as printed on the preview grid (origin top-left)
  python3 v2/tools/fig.py page S 780 v2/figures/shigley/p780.png   # whole page, no grid

Pages are 1-based PDF page indices (NOT the printed book page number).
"""
import re, sys, os
import pymupdf

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BOOKS = {
    'S': 'original_documents/M325S.pdf',
    'M': 'original_documents/M325M.pdf',
    'F': 'original_documents/Mech_325_Bible_Fizz.pdf',
    'D': 'original_documents/Mech_325_Bible_Mech.pdf',
}
_cache = {}

def book(b):
    b = b.upper()
    if b not in _cache:
        _cache[b] = pymupdf.open(os.path.join(ROOT, BOOKS[b]))
    return _cache[b]

def norm(s):
    return re.sub(r'[–—‐\-­]+', '-', s).lower()

def find(b, needle, all_hits=False):
    d = book(b)
    n = norm(needle)
    # caption lines: the caption text normally starts the line
    hits = []
    for i in range(d.page_count):
        t = norm(d[i].get_text())
        if n in t:
            caption = re.search(r'(?m)^' + re.escape(n) + r'\b[^\n]*', t)
            hits.append((i + 1, 'CAPTION' if caption else 'mention', (caption.group(0)[:90] if caption else '')))
    if not all_hits:
        caps = [h for h in hits if h[1] == 'CAPTION']
        hits = caps if caps else hits[:8]
    for p, kind, cap in hits:
        print(f"page {p:4d}  {kind:8s} {cap}")
    if not hits:
        print('no hits')

def preview(b, page, out=None):
    d = book(b)
    pg = d[page - 1]
    zoom = 1.6
    pix = pg.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom))
    from PIL import Image, ImageDraw
    img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    dr = ImageDraw.Draw(img)
    W, H = pg.rect.width, pg.rect.height
    step = 50
    for x in range(0, int(W) + 1, step):
        X = x * zoom
        dr.line([(X, 0), (X, img.height)], fill=(255, 0, 0) if x % 100 == 0 else (255, 160, 160), width=1)
        if x % 100 == 0:
            dr.text((X + 2, 2), str(x), fill=(200, 0, 0))
            dr.text((X + 2, img.height - 12), str(x), fill=(200, 0, 0))
    for y in range(0, int(H) + 1, step):
        Y = y * zoom
        dr.line([(0, Y), (img.width, Y)], fill=(0, 0, 255) if y % 100 == 0 else (160, 160, 255), width=1)
        if y % 100 == 0:
            dr.text((2, Y + 2), str(y), fill=(0, 0, 200))
            dr.text((img.width - 28, Y + 2), str(y), fill=(0, 0, 200))
    out = out or os.path.join(ROOT, 'v2/tools/preview', f'{b.upper()}_{page}.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img.save(out)
    print(f'wrote {out}  (page size {W:.0f} x {H:.0f} pt; grid every 50 pt, labels every 100)')

def crop(b, page, x0, y0, x1, y1, out, dpi=200):
    d = book(b)
    pg = d[page - 1]
    clip = pymupdf.Rect(x0, y0, x1, y1) & pg.rect
    pix = pg.get_pixmap(matrix=pymupdf.Matrix(dpi / 72, dpi / 72), clip=clip)
    out = out if os.path.isabs(out) else os.path.join(ROOT, out)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    pix.save(out)
    print(f'wrote {out}  {pix.width}x{pix.height}px')

def page(b, page, out, dpi=150):
    pg = book(b)[page - 1]
    pix = pg.get_pixmap(matrix=pymupdf.Matrix(dpi / 72, dpi / 72))
    out = out if os.path.isabs(out) else os.path.join(ROOT, out)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    pix.save(out)
    print(f'wrote {out}  {pix.width}x{pix.height}px')

def text(b, page):
    print(book(b)[page - 1].get_text())

if __name__ == '__main__':
    a = sys.argv[1:]
    if not a:
        print(__doc__); sys.exit(0)
    cmd = a[0]
    if cmd == 'find':
        find(a[1], a[2], '--all' in a)
    elif cmd == 'preview':
        preview(a[1], int(a[2]), a[3] if len(a) > 3 else None)
    elif cmd == 'crop':
        crop(a[1], int(a[2]), *map(float, a[3:7]), a[7])
    elif cmd == 'page':
        page(a[1], int(a[2]), a[3])
    elif cmd == 'text':
        text(a[1], int(a[2]))
    else:
        print(__doc__)
