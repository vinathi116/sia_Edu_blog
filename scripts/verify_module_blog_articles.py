import os
import sys

sys.path.insert(0, os.path.join("sia_edu", "backend"))

from blog.parser import parse_article
from blog.validator import lint_content, validate_metadata


BASE = os.path.join("sia_edu", "backend", "content", "blogs")
SLUG_PREFIX = "advanced-quantum-computing-module-"
PROJECT_SLUG = "advanced-quantum-computing-projects"


def main():
    slugs = sorted(
        name
        for name in os.listdir(BASE)
        if name.startswith(SLUG_PREFIX) or name == PROJECT_SLUG
    )
    failed = False

    for slug in slugs:
        article_path = os.path.join(BASE, slug, "index.md")
        metadata, body = parse_article(article_path)
        errors = validate_metadata(metadata)
        warnings = lint_content(body)
        related_courses = metadata.get("relatedCourses")
        words = len(body.split())

        if errors or not related_courses or words == 0:
            failed = True

        print(
            f"{slug} | words={words} | meta_errors={len(errors)} "
            f"| lint_warnings={len(warnings)} | relatedCourses={related_courses}"
        )
        for error in errors:
            print(f"  ERROR {error}")

    expected = 9
    if len(slugs) != expected:
        failed = True
        print(f"ERROR expected {expected} separated articles, found {len(slugs)}")

    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()
