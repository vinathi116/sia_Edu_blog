from __future__ import annotations

import os

from django.utils.text import slugify
from rest_framework import serializers

from courses.models import Course, CourseLesson
from .models import Blog, BlogImage, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name", "slug")


class BlogCourseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    image = serializers.SerializerMethodField()
    featured_image = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            "id",
            "title",
            "short_description",
            "image",
            "featured_image",
            "images",
            "category_name",
            "duration_days",
            "price",
            "final_price",
        )

    def get_image(self, obj):
        return absolute_file_url(self.context, obj.image)

    def get_featured_image(self, obj):
        return absolute_file_url(self.context, obj.featured_image)


class BlogLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseLesson
        fields = ("id", "module_number", "lesson_number", "title")


class BlogImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = BlogImage
        fields = ("id", "image_url", "url", "alt_text", "caption", "placement", "blog", "created_at")
        read_only_fields = ("id", "url", "blog", "created_at")

    def validate_image_url(self, value):
        return validate_blog_image(value)

    def get_url(self, obj):
        return absolute_file_url(self.context, obj.image_url)


class BlogListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.name", read_only=True)
    author_email = serializers.EmailField(source="author.email", read_only=True)
    course = BlogCourseSerializer(read_only=True)
    lesson = BlogLessonSerializer(read_only=True)
    category = serializers.CharField(source="category_name", read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    imageUrl = serializers.SerializerMethodField()
    hero_image = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    banner_image = serializers.SerializerMethodField()
    section_images = serializers.SerializerMethodField()

    excerpt = serializers.SerializerMethodField()

    class Meta:
        model = Blog
        fields = (
            "id",
            "title",
            "slug",
            "subtitle",
            "excerpt",
            "hero_image",
            "thumbnail",
            "banner_image",
            "imageUrl",
            "section_images",
            "tags",
            "author_name",
            "author_email",
            "course",
            "lesson",
            "category",
            "status",
            "publish_date",
            "read_time",
            "views",
            "is_featured",
            "series_name",
            "series_order",
            "seo_meta",
            "created_at",
            "updated_at",
        )

    def get_excerpt(self, obj):
        from django.utils.html import strip_tags

        if not obj.content:
            return ""
        plain = strip_tags(obj.content)
        return plain[:150] + ("..." if len(plain) > 150 else "")

    def get_imageUrl(self, obj):
        image = obj.hero_image or obj.banner_image or obj.thumbnail
        return absolute_file_url(self.context, image)

    def get_hero_image(self, obj):
        return absolute_file_url(self.context, obj.hero_image)

    def get_thumbnail(self, obj):
        return absolute_file_url(self.context, obj.thumbnail)

    def get_banner_image(self, obj):
        return absolute_file_url(self.context, obj.banner_image)

    def get_section_images(self, obj):
        return [
            {
                "id": image.id,
                "url": absolute_file_url(self.context, image.image_url),
                "alt_text": image.alt_text,
                "caption": image.caption,
                "placement": image.placement,
            }
            for image in obj.section_images.all()[:12]
        ]


class BlogDetailSerializer(BlogListSerializer):
    images = BlogImageSerializer(many=True, read_only=True)
    previous = serializers.SerializerMethodField()
    next = serializers.SerializerMethodField()
    recommended = serializers.SerializerMethodField()
    series_navigation = serializers.SerializerMethodField()

    class Meta(BlogListSerializer.Meta):
        fields = BlogListSerializer.Meta.fields + ("content", "images", "previous", "next", "recommended", "series_navigation")

    def get_previous(self, obj):
        item = self.context.get("previous_blog")
        return BlogListSerializer(item, context=self.context).data if item else None

    def get_next(self, obj):
        item = self.context.get("next_blog")
        return BlogListSerializer(item, context=self.context).data if item else None

    def get_recommended(self, obj):
        items = self.context.get("recommended_blogs", [])
        return BlogListSerializer(items, many=True, context=self.context).data

    def get_series_navigation(self, obj):
        series_name = obj.series_name
        if not series_name and obj.course:
            series_name = obj.course.title

        if not series_name:
            return None

        if obj.series_name:
            series_qs = Blog.objects.filter(
                series_name=obj.series_name,
                status=Blog.STATUS_PUBLISHED
            )
        else:
            series_qs = Blog.objects.filter(
                course=obj.course,
                status=Blog.STATUS_PUBLISHED
            )

        series_qs = series_qs.order_by('series_order', 'publish_date', 'created_at')

        if not obj.series_name and series_qs.count() <= 1:
            return None

        articles_data = []
        try:
            id_list = list(series_qs.values_list('id', flat=True))
            current_idx = id_list.index(obj.id)
        except ValueError:
            current_idx = -1

        for index, item in enumerate(series_qs):
            completed = index < current_idx if current_idx != -1 else False

            articles_data.append({
                "title": item.title,
                "slug": item.slug,
                "series_order": item.series_order,
                "is_current": item.id == obj.id,
                "completed": completed
            })

        return {
            "series_name": series_name,
            "articles": articles_data
        }


class BlogWriteSerializer(serializers.ModelSerializer):
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=60),
        write_only=True,
        required=False,
    )
    section_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
    )
    section_image_placements = serializers.ListField(
        child=serializers.CharField(max_length=32),
        write_only=True,
        required=False,
    )
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.filter(is_active=True, is_deleted=False),
        source="course",
        write_only=True,
    )
    lesson_id = serializers.PrimaryKeyRelatedField(
        queryset=CourseLesson.objects.filter(is_active=True),
        source="lesson",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Blog
        fields = (
            "id",
            "title",
            "slug",
            "subtitle",
            "content",
            "hero_image",
            "thumbnail",
            "banner_image",
            "section_images",
            "section_image_placements",
            "tag_names",
            "course_id",
            "lesson_id",
            "status",
            "publish_date",
            "is_featured",
            "series_name",
            "series_order",
            "seo_meta",
        )
        read_only_fields = ("id", "slug")

    def validate_thumbnail(self, value):
        return validate_blog_image(value)

    def validate_hero_image(self, value):
        return validate_blog_image(value)

    def validate_banner_image(self, value):
        return validate_blog_image(value)

    def _build_unique_slug(self, title, instance=None):
        base = slugify(title)[:240] or "sia-article"
        slug = base
        counter = 2
        queryset = Blog.objects.all()
        if instance and instance.pk:
            queryset = queryset.exclude(pk=instance.pk)
        while queryset.filter(slug=slug).exists():
            suffix = f"-{counter}"
            slug = f"{base[: 280 - len(suffix)]}{suffix}"
            counter += 1
        return slug

    def validate(self, attrs):
        course = attrs.get("course", getattr(self.instance, "course", None))
        lesson = attrs.get("lesson", getattr(self.instance, "lesson", None))
        if lesson and course and lesson.course_id != course.id:
            raise serializers.ValidationError({"lesson_id": "Select a lesson that belongs to the selected course."})
        if attrs.get("status") == Blog.STATUS_PUBLISHED and not attrs.get("publish_date") and not getattr(self.instance, "publish_date", None):
            attrs["publish_date"] = None
        return attrs

    def create(self, validated_data):
        tags = validated_data.pop("tag_names", [])
        section_images = validated_data.pop("section_images", [])
        section_image_placements = validated_data.pop("section_image_placements", [])
        validated_data["slug"] = self._build_unique_slug(validated_data.get("title", ""), instance=None)
        blog = Blog.objects.create(author=self.context["request"].user, **validated_data)
        self._sync_tags(blog, tags)
        self._sync_section_images(blog, section_images, section_image_placements)
        return blog

    def update(self, instance, validated_data):
        tags = validated_data.pop("tag_names", None)
        section_images = validated_data.pop("section_images", None)
        section_image_placements = validated_data.pop("section_image_placements", None)
        title = validated_data.get("title", instance.title)
        if title != instance.title or not instance.slug:
            validated_data["slug"] = self._build_unique_slug(title, instance=instance)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags is not None:
            self._sync_tags(instance, tags)
        if section_images is not None:
            self._sync_section_images(instance, section_images, section_image_placements or [])
        return instance

    def _sync_tags(self, blog, tag_names):
        clean_names = []
        for tag_name in tag_names:
            clean = " ".join(str(tag_name).strip().split())
            if clean and clean.lower() not in [name.lower() for name in clean_names]:
                clean_names.append(clean)
        tag_objs = [Tag.objects.get_or_create(name=name)[0] for name in clean_names]
        blog.tags.set(tag_objs)

    def _sync_section_images(self, blog, files, placements):
        if not files:
            return
        images = []
        for index, file in enumerate(files[:12]):
            placement = placements[index] if index < len(placements) else BlogImage.PLACEMENT_INTRODUCTION
            if placement not in {choice[0] for choice in BlogImage.PLACEMENT_CHOICES}:
                placement = BlogImage.PLACEMENT_INTRODUCTION
            images.append(
                BlogImage.objects.create(
                    blog=blog,
                    image_url=file,
                    alt_text=f"{blog.title} section image",
                    caption="",
                    placement=placement,
                )
            )
        blog.section_images.set(images)


def validate_blog_image(value):
    if not value:
        return value
    extension = os.path.splitext(value.name)[1].lower()
    if extension not in {".jpg", ".jpeg", ".png", ".webp"}:
        raise serializers.ValidationError("Use JPG, PNG or WEBP images.")
    if value.size > 5 * 1024 * 1024:
        raise serializers.ValidationError("Image must be 5MB or smaller.")
    return value


def absolute_file_url(context, file_field):
    if not file_field or not getattr(file_field, "url", ""):
        return ""
    url = file_field.url
    request = context.get("request") if context else None
    return request.build_absolute_uri(url) if request else url
