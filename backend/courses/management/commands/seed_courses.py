from __future__ import annotations

import random
from dataclasses import dataclass
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User
from courses.models import Category, Course, Review


@dataclass(frozen=True)
class CourseBlueprint:
    order: int
    title: str
    slug: str
    short_description: str
    category: str
    duration_days: int
    level: str
    price: Decimal
    final_price: Decimal
    discount_percent: Decimal
    image_name: str
    prerequisites: tuple[str, ...]
    outcomes: tuple[str, ...]
    careers: tuple[str, ...]
    tags: tuple[str, ...]
    description: str


CATEGORY_SEEDS: tuple[tuple[str, str], ...] = (
    ("Quantum Computing", "Quantum information, circuits, algorithms, and HDQS implementation workflows."),
    ("Data Science", "Analysis, visualization, statistics, and decision-focused data practice."),
    ("AI & ML", "Applied artificial intelligence and machine learning for real-world products and analytics."),
    ("Agentic AI", "Tool-using AI agents, planning, memory, orchestration, and reliable task execution."),
)


def make_description(title: str, overview: str, modules: tuple[str, ...], outcomes: tuple[str, ...], careers: tuple[str, ...]) -> str:
    return "\n".join(
        [
            title,
            "",
            "Course Overview",
            overview,
            "",
            "Course content / curriculum",
            *[f"- {module}" for module in modules],
            "",
            "Learning outcomes",
            *[f"- {item}" for item in outcomes],
            "",
            "Career opportunities",
            *[f"- {item}" for item in careers],
            "",
            "Capstone project",
            "- Build a portfolio-ready project, document your assumptions, evaluate the result, and present the final work clearly.",
        ]
    ).strip()


COURSE_BLUEPRINTS: tuple[CourseBlueprint, ...] = (
    CourseBlueprint(
        order=1,
        title="Advanced Quantum Computing using HDQS",
        slug="advanced-quantum-computing-using-hdqs",
        short_description="Delivered on the Hyper Dimensional Quantum System with circuits, algorithms, hybrid optimization, and capstone labs.",
        category="Quantum Computing",
        duration_days=56,
        level="Advanced",
        price=Decimal("1999.00"),
        final_price=Decimal("1299.00"),
        discount_percent=Decimal("35.00"),
        image_name="advanced-quantum-computing-using-hdqs.webp",
        prerequisites=("Basic Python", "Introductory linear algebra", "Interest in quantum computation models"),
        outcomes=(
            "Represent qubits, amplitudes, measurement probabilities, and multi-qubit states.",
            "Design circuits for state preparation, entanglement, and measurement.",
            "Use HDQS workflows to model advanced quantum experiments.",
            "Interpret output distributions and explain practical error sources.",
        ),
        careers=("Quantum software learner", "Research assistant", "Simulation engineer", "Scientific software engineer"),
        tags=("HDQS", "quantum circuits", "quantum algorithms", "hybrid optimization"),
        description=make_description(
            "Advanced Quantum Computing using HDQS",
            "A programming-intensive track for learners who want to move beyond introductory quantum concepts into executable experiments on the HDQS platform.",
            (
                "Module 1: Mathematical foundations of quantum computing",
                "Module 2: Quantum gates and circuit design",
                "Module 3: Entanglement, correlation, and state analysis",
                "Module 4: Fundamental quantum algorithms",
                "Module 5: Variational and hybrid quantum algorithms",
                "Module 6: Applied quantum modeling and optimization",
                "Module 7: Hyper Dimensional Quantum System architecture",
            ),
            (
                "Build and analyze quantum circuits with confidence.",
                "Implement canonical quantum algorithms in guided labs.",
                "Connect hybrid optimization methods to real computational problems.",
                "Prepare a technical capstone report using HDQS outputs.",
            ),
            ("Quantum software learner", "Research assistant", "Simulation engineer", "Scientific software engineer"),
        ),
    ),
    CourseBlueprint(
        order=2,
        title="Quantum Algorithms and Complex Computations",
        slug="quantum-algorithms-and-complex-computations",
        short_description="Study core quantum algorithms and solve computation-heavy problems using formal quantum methods.",
        category="Quantum Computing",
        duration_days=35,
        level="Advanced",
        price=Decimal("2000.00"),
        final_price=Decimal("1499.00"),
        discount_percent=Decimal("25.05"),
        image_name="quantum-algorithms-and-complex-computations.webp",
        prerequisites=("Quantum circuit basics", "Python practice", "Comfort with algorithmic thinking"),
        outcomes=(
            "Explain search, oracle, transform, and hidden-structure algorithm families.",
            "Build small circuits that demonstrate algorithmic primitives.",
            "Compare classical and quantum approaches at a high level.",
            "Evaluate algorithm outputs using sampling and probability language.",
        ),
        careers=("Quantum algorithm analyst", "Optimization engineer", "Research engineering intern", "Technical educator"),
        tags=("Grover search", "QFT", "complex computations", "quantum algorithms"),
        description=make_description(
            "Quantum Algorithms and Complex Computations",
            "A rigorous course on algorithmic quantum thinking, oracle-based problem design, amplitude amplification, Fourier methods, and complexity-aware evaluation.",
            (
                "Module 1: Algorithmic foundations and reversible computation",
                "Module 2: Deutsch, Deutsch-Jozsa, and Bernstein-Vazirani",
                "Module 3: Grover search and amplitude amplification",
                "Module 4: Quantum Fourier Transform and phase structure",
                "Module 5: Hybrid algorithm design and benchmarking",
            ),
            (
                "Implement canonical algorithm demonstrations.",
                "Reason about when quantum approaches are relevant.",
                "Document complexity tradeoffs with precision.",
                "Prepare comparison reports for complex computation problems.",
            ),
            ("Quantum algorithm analyst", "Optimization engineer", "Research engineering intern", "Technical educator"),
        ),
    ),
    CourseBlueprint(
        order=3,
        title="Data Science",
        slug="data-science",
        short_description="Work with data end to end using analysis, visualization, statistics, and decision-focused reporting.",
        category="Data Science",
        duration_days=28,
        level="Beginner to Intermediate",
        price=Decimal("2440.00"),
        final_price=Decimal("1999.00"),
        discount_percent=Decimal("18.07"),
        image_name="data-science.webp",
        prerequisites=("Comfort with spreadsheets or basic Python", "Interest in data-backed decisions"),
        outcomes=(
            "Clean and structure datasets for trustworthy analysis.",
            "Run exploratory analysis and communicate patterns clearly.",
            "Apply foundational statistics to support decisions.",
            "Create dashboards and reports that stakeholders can act on.",
        ),
        careers=("Data analyst", "Junior data scientist", "BI developer", "Analytics associate"),
        tags=("Python", "SQL", "EDA", "visualization", "statistics"),
        description=make_description(
            "Data Science",
            "A practical data workflow course covering cleaning, exploration, visualization, statistics, reporting, and portfolio-ready analytical case studies.",
            (
                "Module 1: Data preparation and analytical framing",
                "Module 2: Exploratory data analysis",
                "Module 3: Statistics and interpretation",
                "Module 4: Visualization and reporting",
            ),
            (
                "Clean messy datasets and document assumptions.",
                "Use SQL and Python to explore patterns.",
                "Build clear visual narratives.",
                "Package findings into a decision-ready report.",
            ),
            ("Data analyst", "Junior data scientist", "BI developer", "Analytics associate"),
        ),
    ),
    CourseBlueprint(
        order=4,
        title="AI & ML",
        slug="ai-and-ml",
        short_description="Learn core artificial intelligence and machine learning concepts for applied product, model, and analytics work.",
        category="AI & ML",
        duration_days=42,
        level="Beginner to Intermediate",
        price=Decimal("2548.99"),
        final_price=Decimal("1999.00"),
        discount_percent=Decimal("21.58"),
        image_name="ai-and-ml.webp",
        prerequisites=("Basic Python", "High-school algebra", "Interest in model training and evaluation"),
        outcomes=(
            "Frame business and product problems as ML tasks.",
            "Prepare features and split datasets without leakage.",
            "Train baseline models and evaluate with suitable metrics.",
            "Explain model limits and responsible deployment risks.",
        ),
        careers=("AI developer", "ML associate", "Data scientist", "Applied AI analyst"),
        tags=("machine learning", "AI", "model evaluation", "feature engineering"),
        description=make_description(
            "AI & ML",
            "An applied AI and machine learning course focused on problem framing, feature preparation, model training, evaluation, and production-aware thinking.",
            (
                "Module 1: AI and ML foundations",
                "Module 2: Data preparation and feature engineering",
                "Module 3: Model training and evaluation",
                "Module 4: Deployment thinking and responsible AI",
            ),
            (
                "Build supervised learning workflows.",
                "Evaluate classification and regression models.",
                "Communicate model tradeoffs to technical and non-technical audiences.",
                "Prepare an end-to-end ML case study.",
            ),
            ("AI developer", "ML associate", "Data scientist", "Applied AI analyst"),
        ),
    ),
    CourseBlueprint(
        order=5,
        title="Agentic AI",
        slug="agentic-ai",
        short_description="Design AI agents that reason, plan, use tools, and complete multi-step tasks with reliability and control.",
        category="Agentic AI",
        duration_days=35,
        level="Intermediate",
        price=Decimal("2599.00"),
        final_price=Decimal("1799.00"),
        discount_percent=Decimal("30.78"),
        image_name="agentic-ai.webp",
        prerequisites=("Basic prompt engineering", "API or automation familiarity", "Workflow design curiosity"),
        outcomes=(
            "Distinguish chatbots from agentic execution systems.",
            "Design planner, tool, memory, evaluator, and handoff components.",
            "Trace tool calls and recover from common failure modes.",
            "Define quality checks and guardrails for agent workflows.",
        ),
        careers=("AI automation engineer", "Agent workflow developer", "Prompt engineer", "AI product engineer"),
        tags=("agents", "tool use", "planning", "LLM workflows", "guardrails"),
        description=make_description(
            "Agentic AI",
            "A production-minded course for designing AI agents that plan, call tools, maintain state, validate outputs, and complete multi-step workflows.",
            (
                "Module 1: Agent foundations and execution loops",
                "Module 2: Tool use and workflow integration",
                "Module 3: Memory, reliability, and evaluation",
                "Module 4: Production patterns for agentic systems",
            ),
            (
                "Build tool-using agent workflows.",
                "Use memory and state intentionally.",
                "Add validation, retries, and human review points.",
                "Evaluate task completion and reliability.",
            ),
            ("AI automation engineer", "Agent workflow developer", "Prompt engineer", "AI product engineer"),
        ),
    ),
    CourseBlueprint(
        order=6,
        title="Quantum Gates and Circuit Design",
        slug="quantum-gates-and-circuit-design",
        short_description="Build quantum circuits with core gate sets, entanglement patterns, measurement logic, and simulator workflows.",
        category="Quantum Computing",
        duration_days=28,
        level="Beginner to Intermediate",
        price=Decimal("999.00"),
        final_price=Decimal("499.00"),
        discount_percent=Decimal("50.05"),
        image_name="quantum-gates-and-circuit-design.webp",
        prerequisites=("Basic algebra", "Curiosity about qubits and circuits"),
        outcomes=(
            "Explain common gates and their effect on qubits.",
            "Construct multi-qubit circuits with controls and rotations.",
            "Read circuit diagrams confidently.",
            "Debug measurement outcomes in simulators.",
        ),
        careers=("Quantum circuit designer", "Quantum software learner", "Research assistant", "Technical instructor"),
        tags=("quantum gates", "circuit design", "entanglement", "measurement"),
        description=make_description(
            "Quantum Gates and Circuit Design",
            "A practical entry point into gate-based quantum circuit construction, state preparation, controlled operations, measurement, and debugging.",
            (
                "Module 1: Qubits, states, and circuit notation",
                "Module 2: Single-qubit gate operations",
                "Module 3: Multi-qubit systems and entanglement",
                "Module 4: Circuit execution and optimization basics",
            ),
            (
                "Build circuits for superposition and entanglement.",
                "Interpret measurement results.",
                "Evaluate circuit depth and gate choices.",
                "Document circuit experiments clearly.",
            ),
            ("Quantum circuit designer", "Quantum software learner", "Research assistant", "Technical instructor"),
        ),
    ),
)


REVIEW_TEMPLATES = (
    "Clear explanations and practical exercises made this easy to apply.",
    "The course balances theory and implementation well.",
    "Strong pacing, useful labs, and clear project expectations.",
)


class Command(BaseCommand):
    help = "Replace the catalog with the six screenshot-derived SIA courses."

    def add_arguments(self, parser):
        parser.add_argument("--review-users", type=int, default=12)

    @staticmethod
    def _seed_users(count: int) -> list[User]:
        users: list[User] = []
        for index in range(1, max(6, count) + 1):
            username = f"seed_student_{index:02d}"
            user, _ = User.objects.update_or_create(
                username=username,
                defaults={
                    "email": f"seed.student{index:02d}@siaedu.local",
                    "phone": f"810000{index:04d}",
                    "name": f"Seed Learner {index:02d}",
                    "is_active": True,
                    "is_email_verified": True,
                    "is_deleted": False,
                },
            )
            if not user.has_usable_password():
                user.set_password("SeedPass123!")
                user.save(update_fields=["password"])
            users.append(user)
        return users

    @staticmethod
    def _seo_meta(blueprint: CourseBlueprint) -> dict:
        return {
            "seo_title": f"{blueprint.title} Course | SIA Software Innovations",
            "meta_description": blueprint.short_description[:300],
            "focus_keyword": blueprint.title,
            "tags": list(blueprint.tags),
            "open_graph_title": f"Learn {blueprint.title}",
            "open_graph_description": blueprint.short_description,
            "twitter_card": "summary_large_image",
            "schema_type": "Course",
        }

    @staticmethod
    def _upsert_course(blueprint: CourseBlueprint, category: Category) -> tuple[Course, bool]:
        seo = Command._seo_meta(blueprint)
        image_path = f"courses/images/{blueprint.image_name}"
        defaults = {
            "category": category,
            "slug": blueprint.slug,
            "short_description": blueprint.short_description,
            "description": blueprint.description,
            "order": blueprint.order,
            "level": blueprint.level,
            "language": "English",
            "prerequisites": "\n".join(f"- {item}" for item in blueprint.prerequisites),
            "learning_outcomes": list(blueprint.outcomes),
            "career_opportunities": list(blueprint.careers),
            "seo_title": seo["seo_title"],
            "meta_description": seo["meta_description"],
            "focus_keyword": seo["focus_keyword"],
            "tags": seo["tags"],
            "image": image_path,
            "featured_image": image_path,
            "duration_days": blueprint.duration_days,
            "price": blueprint.price,
            "final_price": blueprint.final_price,
            "discount_percent": blueprint.discount_percent,
            "is_active": True,
            "is_deleted": False,
        }
        course = Course.objects.filter(slug=blueprint.slug).order_by("id").first()
        if not course:
            legacy_titles = {
                "advanced-quantum-computing-using-hdqs": "Certificate Program in Quantum Computing",
            }
            legacy_title = legacy_titles.get(blueprint.slug)
            if legacy_title:
                course = Course.objects.filter(title=legacy_title).order_by("id").first()
        if not course:
            return Course.objects.create(title=blueprint.title, **defaults), True
        course.title = blueprint.title
        for field, value in defaults.items():
            setattr(course, field, value)
        course.save()
        return course, False

    def handle(self, *args, **options):
        stats = {"categories": 0, "courses_created": 0, "courses_updated": 0, "courses_archived": 0, "reviews": 0}
        with transaction.atomic():
            category_by_name = {}
            for name, description in CATEGORY_SEEDS:
                category, _ = Category.objects.update_or_create(
                    name=name,
                    defaults={"description": description, "is_deleted": False},
                )
                category_by_name[name] = category
                stats["categories"] += 1

            active_category_names = [name for name, _ in CATEGORY_SEEDS]
            Category.objects.exclude(name__in=active_category_names).filter(is_deleted=False).update(is_deleted=True)

            seeded_courses = []
            active_slugs = [blueprint.slug for blueprint in COURSE_BLUEPRINTS]
            for blueprint in COURSE_BLUEPRINTS:
                course, created = self._upsert_course(blueprint, category_by_name[blueprint.category])
                seeded_courses.append(course)
                stats["courses_created" if created else "courses_updated"] += 1

            stats["courses_archived"] = Course.objects.exclude(slug__in=active_slugs).filter(is_deleted=False).update(
                is_active=False,
                is_deleted=True,
            )
            Review.objects.filter(course__is_deleted=True, is_deleted=False).update(is_deleted=True)

            users = self._seed_users(int(options["review_users"]))
            for course_index, course in enumerate(seeded_courses):
                rng = random.Random(f"{course.slug}|reviews|v2")
                for offset in range(4):
                    user = users[(course_index * 2 + offset) % len(users)]
                    Review.objects.update_or_create(
                        user=user,
                        course=course,
                        defaults={
                            "rating": rng.choice([4, 5, 5]),
                            "comment": f"{REVIEW_TEMPLATES[offset % len(REVIEW_TEMPLATES)]} ({course.title})",
                            "is_deleted": False,
                        },
                    )
                    stats["reviews"] += 1

        self.stdout.write(self.style.SUCCESS("Screenshot course catalog seed completed."))
        self.stdout.write(f"categories active: {stats['categories']}")
        self.stdout.write(f"courses created/updated: {stats['courses_created']}/{stats['courses_updated']}")
        self.stdout.write(f"courses archived: {stats['courses_archived']}")
        self.stdout.write(f"reviews upserted: {stats['reviews']}")
