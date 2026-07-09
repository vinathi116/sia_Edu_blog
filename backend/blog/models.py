from __future__ import annotations

import re

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from courses.models import Course, CourseLesson


class Tag(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(max_length=80, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:80]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Blog(models.Model):
    STATUS_DRAFT = "draft"
    STATUS_PUBLISHED = "published"
    STATUS_SCHEDULED = "scheduled"
    STATUS_ARCHIVED = "archived"
    STATUS_CHOICES = (
        (STATUS_DRAFT, "Draft"),
        (STATUS_PUBLISHED, "Published"),
        (STATUS_SCHEDULED, "Scheduled"),
        (STATUS_ARCHIVED, "Archived"),
    )

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    subtitle = models.CharField(max_length=320, blank=True)
    content = models.TextField()
    hero_image = models.ImageField(upload_to="blogs/heroes/", blank=True, null=True)
    thumbnail = models.ImageField(upload_to="blogs/thumbnails/", blank=True, null=True)
    banner_image = models.ImageField(upload_to="blogs/banners/", blank=True, null=True)
    tags = models.ManyToManyField(Tag, blank=True, related_name="blogs")
    section_images = models.ManyToManyField("BlogImage", blank=True, related_name="section_blogs")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="blog_posts")
    course = models.ForeignKey(Course, on_delete=models.PROTECT, related_name="blogs")
    lesson = models.ForeignKey(CourseLesson, on_delete=models.SET_NULL, related_name="blogs", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT, db_index=True)
    publish_date = models.DateTimeField(blank=True, null=True, db_index=True)
    read_time = models.PositiveSmallIntegerField(default=1)
    views = models.PositiveIntegerField(default=0, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    series_name = models.CharField(max_length=255, blank=True, db_index=True)
    series_order = models.PositiveSmallIntegerField(default=0)
    seo_meta = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-publish_date", "-created_at"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["status", "publish_date"]),
            models.Index(fields=["course", "status"]),
            models.Index(fields=["is_featured", "status"]),
            models.Index(fields=["series_name", "series_order"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._build_unique_slug()
        if self.status == self.STATUS_PUBLISHED and not self.publish_date:
            self.publish_date = timezone.now()
        self.content = self._sanitize_content(self.content)
        self.read_time = self.calculate_read_time()
        self.generate_seo_metadata()
        super().save(*args, **kwargs)

    def generate_seo_metadata(self):
        # Auto generate SEO fields in seo_meta JSON
        if not isinstance(self.seo_meta, dict):
            self.seo_meta = {}

        # 1. Title / Meta Title
        if not self.seo_meta.get("title") and not self.seo_meta.get("seo_title"):
            self.seo_meta["title"] = self.title

        # 2. Meta Description (subtitle or clean summary of first 155 chars)
        if not self.seo_meta.get("description") and not self.seo_meta.get("meta_description"):
            if self.subtitle:
                desc = self.subtitle
            else:
                # Strip simple html/markdown-like characters for description
                clean_text = re.sub(r'<[^>]*>', '', self.content or '')
                clean_text = re.sub(r'#+\s+|[*_\-`|]+', '', clean_text)
                desc = " ".join(clean_text.split())[:155]
                if len(clean_text) > 155:
                    desc += "..."
            self.seo_meta["description"] = desc

        # 3. Reading Time Label
        self.seo_meta["reading_time_label"] = f"{self.read_time} min read"

        # 4. Article Category (from Course category)
        if self.course_id and self.course.category_id:
            self.seo_meta["article_category"] = self.course.category.name

        # 6. Canonical URL
        self.seo_meta["canonical_url"] = f"/blog/{self.slug}"

        # 7. Open Graph Image
        if self.hero_image:
            self.seo_meta["og_image"] = self.hero_image.name
        elif self.banner_image:
            self.seo_meta["og_image"] = self.banner_image.name
        elif self.thumbnail:
            self.seo_meta["og_image"] = self.thumbnail.name

        # 8. Series Info if present
        if self.series_name:
            self.seo_meta["series_name"] = self.series_name
            self.seo_meta["series_order"] = self.series_order

    def _sanitize_content(self, content):
        if not content:
            return content

        course_slug = None
        course = getattr(self, "course", None)
        if course is not None:
            course_slug = getattr(course, "slug", None)
        elif getattr(self, "course_id", None):
            from courses.models import Course

            try:
                course_slug = Course.objects.filter(pk=self.course_id).values_list("slug", flat=True).get()
            except Course.DoesNotExist:
                course_slug = None

        if course_slug != "advanced-quantum-computing-using-hdqs":
            return content

        cleaned_lines = []
        for line in content.splitlines():
            stripped = line.strip()
            if re.fullmatch(r"[-*_]{3,}", stripped):
                continue
            cleaned_lines.append(line)

        return "\n".join(cleaned_lines).strip()

    def calculate_read_time(self):
        words = len((self.content or "").split())
        return max(1, round(words / 220))

    def _build_unique_slug(self):
        base = slugify(self.title)[:240] or "sia-article"
        slug = base
        counter = 2
        while Blog.objects.filter(slug=slug).exists():
            suffix = f"-{counter}"
            slug = f"{base[: 280 - len(suffix)]}{suffix}"
            counter += 1
        return slug

    @property
    def category_name(self):
        return self.course.category.name if self.course_id and self.course.category_id else ""

    def __str__(self):
        return self.title


class BlogImage(models.Model):
    PLACEMENT_INTRODUCTION = "introduction"
    PLACEMENT_MODULES = "modules"
    PLACEMENT_RELATED = "related"
    PLACEMENT_CHOICES = (
        (PLACEMENT_INTRODUCTION, "Introduction"),
        (PLACEMENT_MODULES, "Modules"),
        (PLACEMENT_RELATED, "Related Articles"),
    )

    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name="images")
    image_url = models.ImageField(upload_to="blogs/inline/")
    alt_text = models.CharField(max_length=255)
    caption = models.CharField(max_length=255, blank=True)
    placement = models.CharField(max_length=32, choices=PLACEMENT_CHOICES, default=PLACEMENT_INTRODUCTION)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.alt_text or f"Blog image {self.pk}"
