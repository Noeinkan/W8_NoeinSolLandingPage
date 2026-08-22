"""Compress UI captures in assets/builds/ and assets/capsar/ to web sizes.

Screenshots are UI captures, so PNG is kept for text sharpness; photographic
captures (.jpg/.jpeg) are re-encoded as progressive JPEG like the headshot.
Run after dropping new captures in; it is safe to re-run (idempotent once a
file is already at or below MAX_W).
"""
import os
from PIL import Image

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Both capture sets render into a 16:10 slot at the same size, so they share
# one pass: assets/builds/ feeds the Builds cards, assets/capsar/ the Capsar
# product preview.
DIRS = ["builds", "capsar"]

# Cards render ~600px wide; 2x for retina.
MAX_W = 1200

images = []
for folder in DIRS:
    directory = os.path.join(BASE, "assets", folder)
    if not os.path.isdir(directory):
        raise SystemExit(f"missing directory: {directory}")
    images += [
        (folder, f) for f in sorted(os.listdir(directory))
        if f.lower().endswith((".png", ".jpg", ".jpeg"))
    ]

if not images:
    print("assets/builds/ and assets/capsar/ have no screenshots yet - nothing to do.")
    raise SystemExit(0)

for folder, name in images:
    path = os.path.join(BASE, "assets", folder, name)
    img = Image.open(path)
    original_w = img.width

    if img.width > MAX_W:
        ratio = MAX_W / img.width
        img = img.resize((MAX_W, int(img.height * ratio)), Image.LANCZOS)

    if name.lower().endswith(".png"):
        img.save(path, "PNG", optimize=True)
    elif original_w == img.width and img.info.get("progressive"):
        # Already been through here: PNG re-encodes losslessly but JPEG does
        # not, so a re-run would quietly degrade the file every time.
        print(f"{folder}/{name}: {img.width}x{img.height}  "
              f"{os.path.getsize(path) // 1024} KB  (already optimised)")
        continue
    else:
        img.convert("RGB").save(path, "JPEG", quality=82, optimize=True, progressive=True)

    size_kb = os.path.getsize(path) // 1024
    note = "" if original_w == img.width else f"  (was {original_w}px wide)"
    print(f"{folder}/{name}: {img.width}x{img.height}  {size_kb} KB{note}")
