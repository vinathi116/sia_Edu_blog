from __future__ import annotations

import json
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from psycopg import connect


BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent
COURSE_PATH = BASE_DIR / "course1.txt"
SCHEMA_PATH = BACKEND_DIR / "course_platform_schema.sql"
SLUG = "advanced-quantum-computing-using-hdqs"
TITLE = "Advanced Quantum Computing using Hyper Dimensional Quantum System (HDQS)"


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "section"


def build_table_of_contents(markdown: str) -> list[dict[str, object]]:
    counts: dict[str, int] = {}
    items: list[dict[str, object]] = []
    in_code = False

    for line in markdown.splitlines():
        stripped = line.strip()
        if stripped.startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue

        match = re.match(r"^(#{1,3})\s+(.+?)\s*$", line)
        if not match:
            continue

        level = len(match.group(1))
        text = match.group(2).strip()
        base_id = slugify(text)
        counts[base_id] = counts.get(base_id, 0) + 1
        anchor = base_id if counts[base_id] == 1 else f"{base_id}-{counts[base_id]}"
        items.append({"level": level, "title": text, "anchor": anchor})

    return items


def estimate_reading_time(markdown: str) -> int:
    words = re.findall(r"\S+", markdown)
    return max(1, round(len(words) / 220))


def main() -> None:
    load_dotenv(BACKEND_DIR / ".env")
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        raise SystemExit("DATABASE_URL is not set in backend/.env")

    markdown = COURSE_PATH.read_text(encoding="utf-8")
    toc = build_table_of_contents(markdown)
    description = (
        "A production-ready advanced quantum computing course covering HDQS, qubits, circuits, "
        "algorithms, hybrid workflows, applications, careers, and the future of quantum systems."
    )

    with connect(database_url, connect_timeout=20) as conn:
        with conn.cursor() as cur:
            cur.execute(SCHEMA_PATH.read_text(encoding="utf-8"))

            cur.execute(
                """
                DELETE FROM public.course_platform_audit_log
                WHERE course_id IN (SELECT id FROM public.course_platform_courses);
                DELETE FROM public.course_platform_course_assets
                WHERE course_id IN (SELECT id FROM public.course_platform_courses);
                DELETE FROM public.course_platform_courses;
                """
            )

            cur.execute(
                """
                INSERT INTO public.course_platform_courses (
                    title,
                    slug,
                    description,
                    markdown_content,
                    course_image,
                    table_of_contents,
                    publish_date,
                    author,
                    category,
                    tags,
                    reading_time,
                    seo_title,
                    seo_description,
                    seo_keywords,
                    canonical_url,
                    status
                )
                VALUES (
                    %(title)s,
                    %(slug)s,
                    %(description)s,
                    %(markdown_content)s,
                    %(course_image)s,
                    %(table_of_contents)s::jsonb,
                    NOW(),
                    %(author)s,
                    %(category)s,
                    %(tags)s,
                    %(reading_time)s,
                    %(seo_title)s,
                    %(seo_description)s,
                    %(seo_keywords)s,
                    %(canonical_url)s,
                    'published'
                )
                RETURNING id;
                """,
                {
                    "title": TITLE,
                    "slug": SLUG,
                    "description": description,
                    "markdown_content": markdown,
                    "course_image": "/course-thumbnails/advanced-quantum-computing-using-hdqs.webp",
                    "table_of_contents": json.dumps(toc),
                    "author": "SIA Software Innovations",
                    "category": "Quantum Computing",
                    "tags": [
                        "Quantum Computing",
                        "HDQS",
                        "Qubits",
                        "Quantum Algorithms",
                        "Hybrid Computing",
                    ],
                    "reading_time": estimate_reading_time(markdown),
                    "seo_title": f"{TITLE} | SIA EDU",
                    "seo_description": description,
                    "seo_keywords": [
                        "advanced quantum computing",
                        "HDQS",
                        "quantum course",
                        "quantum circuits",
                        "hybrid quantum classical computing",
                    ],
                    "canonical_url": f"/courses/{SLUG}",
                },
            )
            course_id = cur.fetchone()[0]
            cur.execute(
                """
                INSERT INTO public.course_platform_audit_log (course_id, action, metadata)
                VALUES (%s, 'seed_course1', %s::jsonb);
                """,
                (course_id, json.dumps({"source_file": str(COURSE_PATH), "markdown_preserved": True})),
            )
        conn.commit()

    print(f"Seeded Course 1 into Supabase course_platform_courses: {SLUG}")


if __name__ == "__main__":
    main()
