from __future__ import annotations

import yaml


def parse_article(filepath: str) -> tuple[dict, str]:
    """
    Parses a Markdown file with YAML frontmatter.
    Returns:
        (metadata_dict, body_text)
    """
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if not content.startswith("---"):
        return {}, content

    # Split by the first two '---' separators
    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}, content

    frontmatter_text = parts[1]
    body_text = parts[2].strip()

    try:
        metadata = yaml.safe_load(frontmatter_text) or {}
    except Exception as e:
        raise ValueError(f"YAML syntax error: {e}")

    return metadata, body_text
