"""Compress headshot.jpg to a web-appropriate size."""
import os
from PIL import Image

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(BASE, "assets", "headshot.jpg")
out = os.path.join(BASE, "assets", "headshot.jpg")

img = Image.open(src)

# Target: 680px wide (2× display width of 340px for retina), keep aspect ratio
MAX_W = 680
if img.width > MAX_W:
    ratio = MAX_W / img.width
    img = img.resize((MAX_W, int(img.height * ratio)), Image.LANCZOS)

img.save(out, "JPEG", quality=82, optimize=True, progressive=True)
size_kb = os.path.getsize(out) // 1024
print(f"headshot.jpg saved: {img.width}x{img.height}  {size_kb} KB")
