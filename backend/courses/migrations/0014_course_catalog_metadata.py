from django.db import migrations, models
from django.utils.text import slugify


def populate_course_slugs(apps, schema_editor):
    Course = apps.get_model("courses", "Course")
    used = set()
    for course in Course.objects.order_by("id"):
        base = slugify(course.title)[:240] or f"course-{course.id}"
        slug = base
        counter = 2
        while slug in used or Course.objects.exclude(id=course.id).filter(slug=slug).exists():
            suffix = f"-{counter}"
            slug = f"{base[: 280 - len(suffix)]}{suffix}"
            counter += 1
        course.slug = slug
        course.featured_image = course.image.name if course.image else ""
        course.save(update_fields=["slug", "featured_image"])
        used.add(slug)


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0013_make_lesson_video_optional"),
    ]

    operations = [
        migrations.AddField(
            model_name="course",
            name="career_opportunities",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="course",
            name="featured_image",
            field=models.CharField(blank=True, default="", max_length=500),
        ),
        migrations.AddField(
            model_name="course",
            name="focus_keyword",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
        migrations.AddField(
            model_name="course",
            name="language",
            field=models.CharField(default="English", max_length=80),
        ),
        migrations.AddField(
            model_name="course",
            name="learning_outcomes",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="course",
            name="level",
            field=models.CharField(default="Beginner to Intermediate", max_length=80),
        ),
        migrations.AddField(
            model_name="course",
            name="meta_description",
            field=models.CharField(blank=True, default="", max_length=320),
        ),
        migrations.AddField(
            model_name="course",
            name="order",
            field=models.PositiveSmallIntegerField(db_index=True, default=100),
        ),
        migrations.AddField(
            model_name="course",
            name="prerequisites",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="course",
            name="seo_title",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="course",
            name="slug",
            field=models.SlugField(blank=True, max_length=280, null=True, unique=True),
        ),
        migrations.AddField(
            model_name="course",
            name="tags",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.RunPython(populate_course_slugs, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="course",
            name="slug",
            field=models.SlugField(blank=True, max_length=280, unique=True),
        ),
        migrations.AddIndex(
            model_name="course",
            index=models.Index(fields=["slug"], name="courses_cou_slug_8f042f_idx"),
        ),
        migrations.AddIndex(
            model_name="course",
            index=models.Index(fields=["order", "is_active"], name="courses_cou_order_e650c7_idx"),
        ),
        migrations.AlterModelOptions(
            name="course",
            options={"ordering": ["order", "-created_at"]},
        ),
    ]
