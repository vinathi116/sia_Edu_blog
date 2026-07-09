from pathlib import Path
from PIL import Image
import cairosvg

SRC_DIR = Path(__file__).resolve().parents[1] / "public" / "images" / "course1"

SVG_FILES = list(SRC_DIR.glob("*.svg"))

if not SVG_FILES:
    print("No SVG files found in", SRC_DIR)
    raise SystemExit(0)

for svg_path in SVG_FILES:
    base = svg_path.stem
    png_path = svg_path.with_suffix('.png')
    webp_path = svg_path.with_suffix('.webp')

    try:
        # Render SVG to PNG at a large width (2048px) for high-quality raster
        cairosvg.svg2png(url=str(svg_path), write_to=str(png_path), output_width=2048)
        # Open PNG and convert to WEBP with quality
        img = Image.open(png_path).convert('RGBA')
        img.save(webp_path, format='WEBP', quality=90, method=6)
        print(f"Converted {svg_path.name} -> {webp_path.name}")
    except Exception as e:
        print(f"Failed to convert {svg_path.name}: {e}")
    finally:
        # Remove intermediate PNG if it exists
        try:
            if png_path.exists():
                png_path.unlink()
        except Exception:
            pass

print('Done')
