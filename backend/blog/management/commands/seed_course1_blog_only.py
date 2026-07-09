from __future__ import annotations

from decimal import Decimal
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from blog.image_assets import get_course1_image_definitions
from blog.models import Blog, Tag
from courses.models import Category, Course


TITLE = "Advanced Quantum Computing using Hyper Dimensional Quantum System (HDQS)"
SLUG = "advanced-quantum-computing-using-hdqs"
SUBTITLE = (
    "A complete HDQS learning guide covering quantum computing foundations, circuits, "
    "algorithms, hybrid systems, applications, careers, and future trends."
)
TAGS = [
    "Advanced Quantum Computing",
    "HDQS",
    "Quantum Computing",
    "Quantum Circuits",
    "Hybrid Quantum Computing",
]

COURSE_ONE_IMAGES = get_course1_image_definitions()

MODULE_ARTICLES = [
    (
        "module-01-mathematical-foundations.md",
        "advanced-quantum-computing-module-01-mathematical-foundations",
        "Advanced Quantum Computing Module 1: Mathematical Foundations",
        "Build the mathematical foundation for advanced quantum computing with qubits, state normalization, matrices, Hilbert space, measurement, and HDQS workflows.",
        ["Quantum Computing", "Mathematical Foundations", "Qubits", "HDQS"],
    ),
    (
        "module-02-quantum-gates.md",
        "advanced-quantum-computing-module-02-quantum-gates",
        "Advanced Quantum Computing Module 2: Quantum Gates",
        "Learn single-qubit gates, multi-qubit gates, circuit construction, measurement, state evolution, and circuit optimization using HDQS examples.",
        ["Quantum Gates", "Quantum Circuits", "HDQS", "Circuit Optimization"],
    ),
    (
        "module-03-entanglement.md",
        "advanced-quantum-computing-module-03-entanglement",
        "Advanced Quantum Computing Module 3: Entanglement",
        "Study Bell states, quantum entanglement, density matrices, mixed states, Bloch sphere analysis, and practical entanglement metrics.",
        ["Entanglement", "Bell States", "Density Matrices", "Bloch Sphere"],
    ),
    (
        "module-04-algorithms.md",
        "advanced-quantum-computing-module-04-algorithms",
        "Advanced Quantum Computing Module 4: Quantum Algorithms",
        "Explore Deutsch, Deutsch-Jozsa, Bernstein-Vazirani, Simon, Grover, QFT, phase estimation, amplitude amplification, and Shor algorithms.",
        ["Quantum Algorithms", "Deutsch-Jozsa", "Grover Search", "QFT", "Shor Algorithm"],
    ),
    (
        "module-05-search.md",
        "advanced-quantum-computing-module-05-search",
        "Advanced Quantum Computing Module 5: Quantum Search",
        "Understand Quantum Fourier Transform, phase estimation, Grover search, amplitude amplification, quantum counting, and search workflow design.",
        ["Quantum Search", "Grover Algorithm", "Phase Estimation", "Amplitude Amplification"],
    ),
    (
        "module-06-cryptography.md",
        "advanced-quantum-computing-module-06-cryptography",
        "Advanced Quantum Computing Module 6: Quantum Cryptography",
        "Learn quantum key distribution, BB84, E91, teleportation, quantum communication, security analysis, and HDQS cryptography simulations.",
        ["Quantum Cryptography", "BB84", "E91", "QKD", "Quantum Teleportation"],
    ),
    (
        "module-07-variational.md",
        "advanced-quantum-computing-module-07-variational",
        "Advanced Quantum Computing Module 7: Variational Quantum Computing",
        "Master parameterized quantum circuits, VQE, QAOA, gradient optimization, barren plateaus, and hardware-efficient ansatze.",
        ["VQE", "QAOA", "Variational Algorithms", "Hybrid Quantum Computing"],
    ),
    (
        "module-08-qml.md",
        "advanced-quantum-computing-module-08-qml",
        "Advanced Quantum Computing Module 8: Quantum Machine Learning",
        "Build quantum machine learning foundations with data encoding, feature maps, quantum kernels, variational classifiers, QNNs, and hybrid pipelines.",
        ["Quantum Machine Learning", "Feature Maps", "Quantum Kernels", "VQC", "QNN"],
    ),
    (
        "projects.md",
        "advanced-quantum-computing-projects",
        "Advanced Quantum Computing Projects and Capstone Labs",
        "Complete HDQS project articles covering quantum randomness, entanglement, Deutsch-Jozsa, Grover, BB84, VQE, QAOA, and QML capstones.",
        ["Quantum Projects", "HDQS Labs", "Capstone", "VQE", "QAOA"],
    ),
]


class Command(BaseCommand):
    help = "Delete existing blog articles and seed only Course 1 from course1.txt."

    def handle(self, *args, **options):
        course_file = Path(__file__).resolve().parents[4] / "course1.txt"
        module_dir = Path(__file__).resolve().parents[4] / "backend" / "content" / "courses" / SLUG
        if not course_file.exists():
            raise SystemExit(f"Course source file not found: {course_file}")
        if not module_dir.exists():
            raise SystemExit(f"Separated module content directory not found: {module_dir}")

        # Source of truth: read and store the markdown exactly as-is.
        markdown_content = course_file.read_text(encoding="utf-8")

        User = get_user_model()

        with transaction.atomic():
            author, _ = User.objects.update_or_create(
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
            if not author.has_usable_password():
                author.set_password("AdminPass123!")
                author.save(update_fields=["password"])

            category, _ = Category.objects.update_or_create(
                name="Quantum Computing",
                defaults={
                    "description": "Quantum information, circuits, algorithms, and HDQS learning workflows.",
                    "is_deleted": False,
                },
            )

            course, _ = Course.objects.update_or_create(
                slug=SLUG,
                defaults={
                    "category": category,
                    "title": "Advanced Quantum Computing using HDQS",
                    "short_description": SUBTITLE[:255],
                    "description": SUBTITLE,
                    "order": 1,
                    "level": "Advanced",
                    "language": "English",
                    "prerequisites": "Basic Python\nIntroductory linear algebra\nInterest in quantum computing",
                    "learning_outcomes": [
                        "Understand advanced quantum computing foundations.",
                        "Design and analyze quantum circuits.",
                        "Explore HDQS-based hybrid quantum workflows.",
                    ],
                    "career_opportunities": [
                        "Quantum software learner",
                        "Research assistant",
                        "Simulation engineer",
                    ],
                    "seo_title": f"{TITLE} | SIA EDU",
                    "meta_description": SUBTITLE,
                    "focus_keyword": "Advanced Quantum Computing using HDQS",
                    "tags": TAGS,
                    "featured_image": "/course-thumbnails/advanced-quantum-computing-using-hdqs.webp",
                    "images": [],
                    "duration_days": 56,
                    "price": Decimal("1999.00"),
                    "final_price": Decimal("1299.00"),
                    "discount_percent": Decimal("35.00"),
                    "is_active": True,
                    "is_deleted": False,
                },
            )

            deleted_blogs, _ = Blog.objects.all().delete()
            Tag.objects.all().delete()

            tag_objects = [Tag.objects.create(name=name) for name in TAGS]
            blog = Blog.objects.create(
                title=TITLE,
                slug=SLUG,
                subtitle=SUBTITLE,
                content=markdown_content,
                thumbnail="/images/course1/hero-quantum-lab.webp",
                banner_image="/images/course1/hero-quantum-lab.webp",
                author=author,
                course=course,
                status=Blog.STATUS_PUBLISHED,
                publish_date=timezone.now(),
                is_featured=True,
                seo_meta={
                    "seo_title": f"{TITLE} | SIA EDU",
                    "meta_description": SUBTITLE,
                    "focus_keyword": "Advanced Quantum Computing using HDQS",
                    "related_keywords": TAGS,
                    "open_graph_title": TITLE,
                    "open_graph_description": SUBTITLE,
                    "twitter_card": "summary_large_image",
                    "schema_type": "Article",
                    "canonical": f"/blog/{SLUG}",
                    "source_file": str(course_file),
                    "markdown_preserved_exactly": True,
                },
            )
            blog.tags.set(tag_objects)

            module_blogs = []
            for filename, slug, title, subtitle, tags in MODULE_ARTICLES:
                source_path = module_dir / filename
                if not source_path.exists():
                    raise SystemExit(f"Separated module source file not found: {source_path}")

                module_tag_objects = [Tag.objects.get_or_create(name=tag_name)[0] for tag_name in tags]
                module_blog = Blog.objects.create(
                    title=title,
                    slug=slug,
                    subtitle=subtitle,
                    content=source_path.read_text(encoding="utf-8"),
                    thumbnail="/images/course1/hero-quantum-lab.webp",
                    banner_image="/images/course1/hero-quantum-lab.webp",
                    author=author,
                    course=course,
                    status=Blog.STATUS_PUBLISHED,
                    publish_date=timezone.now(),
                    is_featured=False,
                    seo_meta={
                        "seo_title": f"{title} | SIA EDU",
                        "meta_description": subtitle,
                        "focus_keyword": title,
                        "related_keywords": tags,
                        "open_graph_title": title,
                        "open_graph_description": subtitle,
                        "twitter_card": "summary_large_image",
                        "schema_type": "Article",
                        "canonical": f"/blog/{slug}",
                        "source_file": str(source_path),
                    },
                )
                module_blog.tags.set(module_tag_objects)
                module_blogs.append(module_blog)

        self.stdout.write(self.style.SUCCESS("Deleted existing blog articles/tags."))
        self.stdout.write(self.style.SUCCESS(f"Inserted only Course 1 blog: {blog.title}"))
        self.stdout.write(self.style.SUCCESS(f"Inserted separated module/project articles: {len(module_blogs)}"))
        self.stdout.write(f"slug: {blog.slug}")
        self.stdout.write(f"read_time: {blog.read_time} min")
        self.stdout.write(f"deleted_blog_rows_and_related: {deleted_blogs}")
