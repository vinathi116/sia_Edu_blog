from __future__ import annotations

import re

REQUIRED_FIELDS = [
    "title",
    "slug",
    "description",
    "heroImage",
    "category",
    "published",
    "updated",
    "tags",
    "author",
    "seoTitle",
    "metaDescription",
    "status",
]

VALID_STATUSES = {"draft", "review", "published", "archived"}


def validate_metadata(metadata: dict) -> list[str]:
    """
    Validates metadata fields, checks presence and validation constraints.
    """
    errors = []

    # 1. Check required fields
    for field in REQUIRED_FIELDS:
        if field not in metadata or not metadata[field]:
            errors.append(f"Missing required metadata field: '{field}'")

    # 2. Check status
    status = metadata.get("status")
    if status and status not in VALID_STATUSES:
        errors.append(
            f"Invalid status '{status}'. Must be one of: {', '.join(VALID_STATUSES)}"
        )

    # 3. Check dates format
    for date_field in ["published", "updated"]:
        val = metadata.get(date_field)
        if val and not re.match(r"^\d{4}-\d{2}-\d{2}$", str(val)):
            errors.append(
                f"Field '{date_field}' must be in YYYY-MM-DD format (got '{val}')"
            )

    # 4. Check tags is list
    tags = metadata.get("tags")
    if tags is not None and not isinstance(tags, list):
        errors.append("Field 'tags' must be a list")


def lint_content(body: str) -> list[str]:
    """
    Runs static content lints on the Markdown body.
    """
    warnings = []

    # 1. Duplicated headings
    headings = re.findall(r"^(#{1,6})\s+(.+)$", body, re.MULTILINE)
    seen_headings = set()
    for level, heading_text in headings:
        clean_text = heading_text.strip().lower()
        if clean_text in seen_headings:
            warnings.append(f"Duplicate heading found: '{heading_text}'")
        seen_headings.add(clean_text)

    # 2. Missing alt text for images
    images = re.findall(r"!\[(.*?)\]\((.*?)\)", body)
    for alt, src in images:
        if not alt.strip():
            warnings.append(f"Image is missing descriptive alt text: '{src}'")

    # 3. Missing code block language
    code_blocks = re.findall(r"^(```+)(.*?)$", body, re.MULTILINE)
    is_open = False
    for fence, lang in code_blocks:
        is_open = not is_open
        if is_open and not lang.strip():
            warnings.append("Code block is missing a syntax language identifier")

    # 4. Detect empty headings (headings immediately followed by another heading or EOF)
    lines = [line.strip() for line in body.split("\n")]
    for idx, line in enumerate(lines):
        if line.startswith("#"):
            # Check next non-empty line
            next_idx = idx + 1
            while next_idx < len(lines) and not lines[next_idx]:
                next_idx += 1
            if next_idx < len(lines) and lines[next_idx].startswith("#"):
                warnings.append(f"Empty section detected under heading: '{line}'")

    return warnings
