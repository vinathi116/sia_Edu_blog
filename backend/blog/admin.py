from django.contrib import admin

from .models import Blog, BlogImage, Tag


class BlogImageInline(admin.TabularInline):
    model = BlogImage
    extra = 0


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "status", "series_name", "series_order", "is_featured", "publish_date", "views", "updated_at")
    list_filter = ("status", "series_name", "is_featured", "course__category", "course")
    search_fields = ("title", "subtitle", "content", "course__title", "series_name", "tags__name")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tags",)
    inlines = [BlogImageInline]


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(BlogImage)
class BlogImageAdmin(admin.ModelAdmin):
    list_display = ("alt_text", "blog", "created_at")
    search_fields = ("alt_text", "blog__title")
