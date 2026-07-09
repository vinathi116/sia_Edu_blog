from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from blog.image_assets import get_course1_image_definitions
from blog.models import Blog
from blog.views import BlogViewSet
from courses.models import Category, Course


class CourseOneBlogContentTests(TestCase):
    def test_course_one_image_definitions_use_public_course1_paths(self):
        images = get_course1_image_definitions()

        self.assertTrue(images)
        self.assertEqual(images[0]["section"], "Hero")
        self.assertTrue(all(image["url"].startswith("/images/course1/") for image in images))

    def test_course_one_blog_content_removes_markdown_horizontal_rules(self):
        User = get_user_model()
        author = User.objects.create_user(
            username="test-author",
            email="test-author@example.com",
            password="secret123",
        )
        category = Category.objects.create(name="Quantum Computing")
        course = Course.objects.create(
            category=category,
            title="Advanced Quantum Computing using HDQS",
            slug="advanced-quantum-computing-using-hdqs",
            short_description="Course one",
            description="Course one description",
            price=100,
            final_price=100,
        )

        blog = Blog.objects.create(
            title="Course 1 Blog",
            slug="course-1-blog",
            content="# Heading\n\n---\n\nBody content",
            author=author,
            course=course,
            status=Blog.STATUS_PUBLISHED,
        )

        self.assertNotIn("---", blog.content)
        self.assertIn("Body content", blog.content)

    def test_admin_can_update_and_delete_draft_blog_by_slug(self):
        User = get_user_model()
        admin = User.objects.create_user(
            username="admin-user",
            email="admin-user@example.com",
            password="secret123",
            name="Admin User",
            phone="5551000001",
            is_staff=True,
            is_superuser=True,
        )
        category = Category.objects.create(name="Quantum Computing")
        course = Course.objects.create(
            category=category,
            title="Advanced Quantum Computing using HDQS",
            slug="advanced-quantum-computing-using-hdqs",
            short_description="Course one",
            description="Course one description",
            price=100,
            final_price=100,
        )
        blog = Blog.objects.create(
            title="Draft Blog",
            slug="draft-blog",
            content="Initial content",
            author=admin,
            course=course,
            status=Blog.STATUS_DRAFT,
        )

        factory = APIRequestFactory()

        update_request = factory.patch(
            f"/api/blogs/{blog.slug}/",
            {"title": "Updated Draft Blog"},
            format="json",
        )
        force_authenticate(update_request, user=admin)
        update_response = BlogViewSet.as_view({"patch": "partial_update"})(update_request, slug=blog.slug)

        self.assertEqual(update_response.status_code, 200)
        blog.refresh_from_db()
        self.assertEqual(blog.title, "Updated Draft Blog")
        self.assertTrue(blog.slug.startswith("updated-draft-blog"))

        delete_request = factory.delete(f"/api/blogs/{blog.slug}/")
        force_authenticate(delete_request, user=admin)
        delete_response = BlogViewSet.as_view({"delete": "destroy"})(delete_request, slug=blog.slug)

        self.assertEqual(delete_response.status_code, 204)
        self.assertFalse(Blog.objects.filter(pk=blog.pk).exists())
