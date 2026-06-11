"""
Convert credential PDFs to watermarked JPGs for display on the about page.
Outputs medium-res images to assets/certs/ — originals are never served.
"""
import os
import fitz  # PyMuPDF
from PIL import Image, ImageDraw, ImageFont
import math

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BASE_DIR, "assets", "certs")
os.makedirs(OUT_DIR, exist_ok=True)

WATERMARK_TEXT = "noeinsolutions.com"
WATERMARK_OPACITY = 55   # 0-255
JPEG_QUALITY = 72        # keeps file size reasonable
DPI = 120                # medium-res — readable but not print-quality

PDFS = [
    {
        "file": "RICS BIM - DL-CBIM-2122-G4_certificate.pdf",
        "slug": "rics-bim",
    },
    {
        "file": "40-Under-40-LinkedIn-2023 - ANDREA AITA.pdf",
        "slug": "autodesk-40-under-40",
    },
    {
        "file": "LSS_Certificate_32732GB.pdf",
        "slug": "lean-six-sigma",
    },
    {
        "file": "IBM Data Science Professional Certificate DM5J2FSLA77L.pdf",
        "slug": "ibm-data-science",
    },
]


def add_watermark(img: Image.Image, text: str, opacity: int) -> Image.Image:
    """Tile a diagonal watermark across the image."""
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    try:
        font = ImageFont.truetype("arial.ttf", size=max(18, img.width // 30))
    except OSError:
        font = ImageFont.load_default()

    # Measure text
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

    # Tile diagonally
    step_x = tw + 120
    step_y = th + 80
    angle = -30
    rad = math.radians(angle)

    for y in range(-img.height, img.height * 2, step_y):
        for x in range(-img.width, img.width * 2, step_x):
            tmp = Image.new("RGBA", img.size, (0, 0, 0, 0))
            d = ImageDraw.Draw(tmp)
            d.text((x, y), text, font=font, fill=(180, 150, 90, opacity))
            rotated = tmp.rotate(angle, expand=False)
            overlay = Image.alpha_composite(overlay, rotated)

    base = img.convert("RGBA")
    result = Image.alpha_composite(base, overlay)
    return result.convert("RGB")


for entry in PDFS:
    pdf_path = os.path.join(BASE_DIR, entry["file"])
    if not os.path.exists(pdf_path):
        print(f"  SKIP (not found): {entry['file']}")
        continue

    doc = fitz.open(pdf_path)
    page = doc[0]  # first page only

    mat = fitz.Matrix(DPI / 72, DPI / 72)
    pix = page.get_pixmap(matrix=mat, alpha=False)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

    img_wm = add_watermark(img, WATERMARK_TEXT, WATERMARK_OPACITY)

    out_path = os.path.join(OUT_DIR, f"{entry['slug']}.jpg")
    img_wm.save(out_path, "JPEG", quality=JPEG_QUALITY, optimize=True)
    size_kb = os.path.getsize(out_path) // 1024
    print(f"  OK  {entry['slug']}.jpg  ({size_kb} KB)  [{pix.width}x{pix.height}]")

doc  # keep last doc in scope until done
print("\nDone. Files in assets/certs/")
