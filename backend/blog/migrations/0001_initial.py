from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("courses", "0013_make_lesson_video_optional"),
    ]

    operations = [
        migrations.CreateModel(
            name="Tag",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=60, unique=True)),
                ("slug", models.SlugField(blank=True, max_length=80, unique=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="Blog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("slug", models.SlugField(blank=True, max_length=280, unique=True)),
                ("subtitle", models.CharField(blank=True, max_length=320)),
                ("content", models.TextField()),
                ("thumbnail", models.ImageField(blank=True, null=True, upload_to="blogs/thumbnails/")),
                ("banner_image", models.ImageField(blank=True, null=True, upload_to="blogs/banners/")),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("draft", "Draft"),
                            ("published", "Published"),
                            ("scheduled", "Scheduled"),
                            ("archived", "Archived"),
                        ],
                        db_index=True,
                        default="draft",
                        max_length=20,
                    ),
                ),
                ("publish_date", models.DateTimeField(blank=True, db_index=True, null=True)),
                ("read_time", models.PositiveSmallIntegerField(default=1)),
                ("views", models.PositiveIntegerField(db_index=True, default=0)),
                ("is_featured", models.BooleanField(db_index=True, default=False)),
                ("seo_meta", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "author",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="blog_posts",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "course",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="blogs",
                        to="courses.course",
                    ),
                ),
                (
                    "lesson",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="blogs",
                        to="courses.courselesson",
                    ),
                ),
                ("tags", models.ManyToManyField(blank=True, related_name="blogs", to="blog.tag")),
            ],
            options={
                "ordering": ["-publish_date", "-created_at"],
                "indexes": [
                    models.Index(fields=["slug"], name="blog_blog_slug_09b499_idx"),
                    models.Index(fields=["status", "publish_date"], name="blog_blog_status_434082_idx"),
                    models.Index(fields=["course", "status"], name="blog_blog_course__443c8f_idx"),
                    models.Index(fields=["is_featured", "status"], name="blog_blog_is_feat_9026c3_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="BlogImage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("image_url", models.ImageField(upload_to="blogs/inline/")),
                ("alt_text", models.CharField(max_length=255)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "blog",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="images", to="blog.blog"),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
