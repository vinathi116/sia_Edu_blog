from __future__ import annotations

import os
from datetime import datetime
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.text import slugify

from blog.models import Blog, Tag
from courses.models import Course
from .assets import validate_and_copy_assets
from .parser import parse_article
from .validator import lint_content, validate_metadata


class BlogImporter:
    def __init__(self, content_dir: str):
        self.content_dir = content_dir
        self.User = get_user_model()

    def get_or_create_admin_user(self):
        """
        Gets or creates the blog editor admin user.
        """
        admin, _ = self.User.objects.update_or_create(
            email="admin@siasoftwareinnovations.com",
            defaults={
                "username": "sia_blog_admin",
                "name": "SIA Technical Editorial Team",
                "phone": "8100099999",
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
                "is_email_verified": True,
                "is_deleted": False,
            },
        )
        if not admin.has_usable_password():
            admin.set_password("AdminPass123!")
            admin.save(update_fields=["password"])
        return admin

    def import_all(self) -> dict[str, list[str]]:
        """
        Imports all articles in the content folder.
        Returns:
            Dictionary of logs (errors and warnings per article)
        """
        logs = {}
        admin_user = self.get_or_create_admin_user()

        if not os.path.exists(self.content_dir):
            logs["system"] = [f"Content directory '{self.content_dir}' not found on disk."]
            return logs

        # Scan for subdirectories containing index.md
        article_folders = []
        for name in os.listdir(self.content_dir):
            path = os.path.join(self.content_dir, name)
            if os.path.isdir(path) and os.path.exists(os.path.join(path, "index.md")):
                article_folders.append((name, path))

        for folder_name, folder_path in article_folders:
            logs[folder_name] = []
            article_file = os.path.join(folder_path, "index.md")

            try:
                # 1. Parse article frontmatter & body
                metadata, body = parse_article(article_file)

                # 2. Validate metadata schema
                meta_errors = validate_metadata(metadata)
                if meta_errors:
                    logs[folder_name].extend([f"[ERROR] {err}" for err in meta_errors])
                    continue

                # 3. Lint markdown body content
                lint_warnings = lint_content(body)
                if lint_warnings:
                    logs[folder_name].extend([f"[WARN] {warn}" for warn in lint_warnings])

                # 4. Resolve slug and validate uniqueness
                slug = metadata.get("slug")
                if not slug:
                    slug = slugify(metadata["title"])
                else:
                    slug = slugify(slug)

                # 5. Resolve associated Course
                related_courses = metadata.get("relatedCourses", [])
                if not related_courses:
                    logs[folder_name].append("[ERROR] 'relatedCourses' list is empty. Blog must connect to a course.")
                    continue

                primary_course_slug = related_courses[0]
                course = Course.objects.filter(slug=primary_course_slug).first()
                if not course:
                    logs[folder_name].append(
                        f"[ERROR] Associated course '{primary_course_slug}' not found in database. Run course seeder first."
                    )
                    continue

                # 6. Validate and copy media assets (via manifest)
                try:
                    asset_mapping = validate_and_copy_assets(folder_path, slug)
                except Exception as asset_err:
                    logs[folder_name].append(f"[ERROR] Asset validation/copy failed: {asset_err}")
                    continue

                hero_image_path = asset_mapping.get("hero")
                if not hero_image_path:
                    # Fallback to course image if not explicitly set
                    hero_image_path = course.image.name if course.image else None

                # 7. Calculate dynamic metrics (word count and reading time)
                word_count = len(body.split())
                reading_time = max(1, round(word_count / 220))

                # 8. Setup tags
                tag_objs = []
                for tname in metadata.get("tags", []):
                    clean_tname = " ".join(str(tname).strip().split())
                    if clean_tname:
                        tslug = slugify(clean_tname)[:80]
                        tag, _ = Tag.objects.update_or_create(
                            slug=tslug,
                            defaults={"name": clean_tname}
                        )
                        tag_objs.append(tag)

                # 9. Format published / updated timestamps
                published_str = str(metadata.get("published"))
                updated_str = str(metadata.get("updated"))
                
                try:
                    published_date = timezone.make_aware(datetime.strptime(published_str, "%Y-%m-%d"))
                except ValueError:
                    published_date = timezone.now()

                # 10. Construct SEO metadata
                seo_meta = {
                    "seo_title": metadata.get("seoTitle", metadata["title"]),
                    "meta_description": metadata.get("metaDescription", metadata["description"]),
                    "focus_keyword": metadata.get("focusKeyword", metadata["title"]),
                    "related_keywords": metadata.get("tags", []),
                    "open_graph_title": metadata.get("seoTitle", metadata["title"]),
                    "open_graph_description": metadata.get("description"),
                    "twitter_card": "summary_large_image",
                    "schema_type": "Article",
                    "canonical": metadata.get("canonical", f"/blog/{slug}"),
                    "faqs": metadata.get("faq", []),
                    "word_count": word_count,
                    "last_updated": updated_str,
                }

                # 11. Save record to Database
                blog, created = Blog.objects.update_or_create(
                    slug=slug,
                    defaults={
                        "title": metadata["title"],
                        "subtitle": metadata["description"],
                        "content": body,
                        "thumbnail": hero_image_path,
                        "banner_image": hero_image_path,
                        "course": course,
                        "author": admin_user,
                        "status": metadata.get("status", "published"),
                        "publish_date": published_date,
                        "is_featured": metadata.get("featured", False),
                        "read_time": reading_time,
                        "seo_meta": seo_meta,
                    }
                )
                blog.tags.set(tag_objs)

                action = "Created" if created else "Updated"
                logs[folder_name].append(
                    f"[SUCCESS] {action} blog '{blog.title}' (slug: {slug}), {word_count} words, {reading_time} min read."
                )

            except Exception as e:
                logs[folder_name].append(f"[ERROR] Unexpected exception during import: {e}")

        return logs
