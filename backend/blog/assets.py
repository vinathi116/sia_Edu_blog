from __future__ import annotations

import json
import os
import shutil

from django.conf import settings


def validate_and_copy_assets(article_dir: str, slug: str) -> dict:
    """
    Loads manifest.json if exists under article_dir, validates that
    all listed files exist on disk, and copies them to media/blogs/{slug}/.
    Returns a dict mapping asset keys to destination media paths.
    """
    manifest_path = os.path.join(article_dir, "manifest.json")
    if not os.path.exists(manifest_path):
        return {}

    with open(manifest_path, "r", encoding="utf-8") as f:
        try:
            manifest = json.load(f)
        except Exception as e:
            raise ValueError(f"manifest.json syntax error: {e}")

    dest_dir = os.path.join(settings.MEDIA_ROOT, "blogs", slug)
    os.makedirs(dest_dir, exist_ok=True)

    asset_mapping = {}

    # 1. Validate and copy hero banner image
    hero_file = manifest.get("hero")
    if hero_file:
        src_hero = os.path.join(article_dir, hero_file)
        if not os.path.exists(src_hero):
            raise FileNotFoundError(
                f"Hero image '{hero_file}' listed in manifest.json does not exist in {article_dir}"
            )

        dest_filename = f"hero{os.path.splitext(hero_file)[1]}"
        dest_hero = os.path.join(dest_dir, dest_filename)
        shutil.copy2(src_hero, dest_hero)
        # Store relative media path (e.g., 'blogs/ai-and-ml/hero.webp')
        asset_mapping["hero"] = f"blogs/{slug}/{dest_filename}"

    # 2. Validate and copy supporting diagrams/illustration assets
    diagrams = manifest.get("diagrams", [])
    if diagrams:
        asset_mapping["diagrams"] = []
        for diag in diagrams:
            src_diag = os.path.join(article_dir, diag)
            if not os.path.exists(src_diag):
                raise FileNotFoundError(
                    f"Diagram '{diag}' listed in manifest.json does not exist in {article_dir}"
                )

            dest_diag = os.path.join(dest_dir, diag)
            shutil.copy2(src_diag, dest_diag)
            asset_mapping["diagrams"].append(f"blogs/{slug}/{diag}")

    return asset_mapping
