from __future__ import annotations

import os
from django.conf import settings
from django.core.management.base import BaseCommand
from blog.importer import BlogImporter


class Command(BaseCommand):
    help = "Import blog articles from the content/blogs/ directory using YAML frontmatter."

    def handle(self, *args, **options):
        # The content folder is in the backend/ root directory
        content_dir = os.path.join(settings.BASE_DIR, "content", "blogs")
        self.stdout.write(f"Starting blog content import from: {content_dir}")

        importer = BlogImporter(content_dir)
        logs = importer.import_all()

        success_count = 0
        error_count = 0
        warn_count = 0

        for article, messages in logs.items():
            self.stdout.write(self.style.MIGRATE_HEADING(f"\nArticle: {article}"))
            if not messages:
                self.stdout.write("  No messages logged.")
                continue

            for msg in messages:
                if "[ERROR]" in msg:
                    self.stdout.write(self.style.ERROR(f"  {msg}"))
                    error_count += 1
                elif "[WARN]" in msg:
                    self.stdout.write(self.style.WARNING(f"  {msg}"))
                    warn_count += 1
                elif "[SUCCESS]" in msg:
                    self.stdout.write(self.style.SUCCESS(f"  {msg}"))
                    success_count += 1
                else:
                    self.stdout.write(f"  {msg}")

        self.stdout.write(self.style.MIGRATE_HEADING("\nImport Summary:"))
        self.stdout.write(self.style.SUCCESS(f"  Successfully imported/updated: {success_count}"))
        if warn_count:
            self.stdout.write(self.style.WARNING(f"  Warnings logged: {warn_count}"))
        if error_count:
            self.stdout.write(self.style.ERROR(f"  Errors encountered: {error_count}"))
            self.stdout.write(self.style.ERROR("  Some articles were skipped due to errors."))
        else:
            self.stdout.write(self.style.SUCCESS("  All articles processed successfully without errors."))
