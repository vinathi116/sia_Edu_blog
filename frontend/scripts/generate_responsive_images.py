from PIL import Image
from pathlib import Path

# widths to generate
WIDTHS = [480, 800, 1200, 2048]

PUBLIC_DIR = Path(__file__).resolve().parents[1] / "public"

# target folders to process
FOLDERS = [PUBLIC_DIR / "images" / "course1", PUBLIC_DIR / "course-thumbnails"]

def generate_variants(path: Path):
    if not path.exists():
        return
    for img in path.glob("*.webp"):
        try:
            im = Image.open(img)
            orig_w, orig_h = im.size
            for w in WIDTHS:
                if w >= orig_w:
                    # avoid upscaling beyond original width; still produce largest if equal
                    if w > orig_w:
                        continue
                ratio = w / orig_w
                h = int(orig_h * ratio)
                out_name = img.with_name(f"{img.stem}-{w}.webp")
                resized = im.resize((w, h), Image.LANCZOS)
                resized.save(out_name, format="WEBP", quality=90, method=6)
                print(f"Saved {out_name}")
            # ensure we also have a 2048 variant if original >=2048
            if orig_w >= 2048:
                out_name = img.with_name(f"{img.stem}-2048.webp")
                im.save(out_name, format="WEBP", quality=90, method=6)
        except Exception as e:
            print(f"Failed {img}: {e}")

if __name__ == '__main__':
    for folder in FOLDERS:
        generate_variants(folder)
    print("Done")
