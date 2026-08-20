"""Compress build screenshots in assets/builds/ to web-appropriate sizes.

Screenshots are UI captures, so PNG is kept for text sharpness; photographic
captures (.jpg/.jpeg) are re-encoded as progressive JPEG like the headshot.
Run after dropping new captures in; it is safe to re-run (idempotent once a
file is already at or below MAX_W).
"""
import os
from PIL import Image

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILDS = os.path.join(BASE, "assets", "builds")

# Cards render ~600px wide; 2x for retina.
MAX_W = 1200

if not os.path.isdir(BUILDS):
    raise SystemExit(f"missing directory: {BUILDS}")

images = sorted(
    f for f in os.listdir(BUILDS)
    if f.lower().endswith((".png", ".jpg", ".jpeg"))
)

if not images:
    print("assets/builds/ has no screenshots yet - nothing to do.")
    raise SystemExit(0)

for name in images:
    path = os.path.join(BUILDS, name)
    img = Image.open(path)
    original_w = img.width

    if img.width > MAX_W:
        ratio = MAX_W / img.width
        img = img.resize((MAX_W, int(img.height * ratio)), Image.LANCZOS)

    if name.lower().endswith(".png"):
        img.save(path, "PNG", optimize=True)
    else:
        img.convert("RGB").save(path, "JPEG", quality=82, optimize=True, progressive=True)

    size_kb = os.path.getsize(path) // 1024
    note = "" if original_w == img.width else f"  (was {original_w}px wide)"
    print(f"{name}: {img.width}x{img.height}  {size_kb} KB{note}")
