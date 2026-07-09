import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Course, Category
from django.utils.text import slugify

# Create categories
cat, _ = Category.objects.get_or_create(name="Artificial Intelligence")
cat2, _ = Category.objects.get_or_create(name="Quantum Computing")
cat3, _ = Category.objects.get_or_create(name="Machine Learning")
cat4, _ = Category.objects.get_or_create(name="Data Science")
cat5, _ = Category.objects.get_or_create(name="Cyber Security")

# Create real courses (fields match the actual Course model)
courses_data = [
    {
        "title": "Artificial Intelligence Mastery",
        "category": cat,
        "short_description": "A comprehensive guide to modern Artificial Intelligence and its real-world applications.",
        "description": "This course covers neural networks, NLP, computer vision, and responsible AI practices used in industry today.",
        "price": 199.99,
        "duration_days": 90,
    },
    {
        "title": "Quantum Computing Fundamentals",
        "category": cat2,
        "short_description": "Learn qubits, superposition, entanglement, and quantum circuits from scratch.",
        "description": "Hands-on introduction to quantum computing using Qiskit. Build and simulate quantum circuits, understand quantum gates, and explore real quantum hardware.",
        "price": 149.99,
        "duration_days": 60,
    },
    {
        "title": "Machine Learning with Python",
        "category": cat3,
        "short_description": "Master scikit-learn, pandas, and predictive modeling techniques.",
        "description": "End-to-end machine learning pipeline: data cleaning, feature engineering, model selection, evaluation metrics, and deployment.",
        "price": 129.99,
        "duration_days": 45,
    },
    {
        "title": "Data Science for Business Analytics",
        "category": cat4,
        "short_description": "Turn raw data into actionable business insights using Python and SQL.",
        "description": "Learn exploratory data analysis, statistical testing, dashboard creation, and storytelling with data for real business decisions.",
        "price": 119.99,
        "duration_days": 40,
    },
    {
        "title": "Cyber Security Essentials",
        "category": cat5,
        "short_description": "Build a strong foundation in network security, ethical hacking, and secure coding.",
        "description": "Covers OWASP Top 10, penetration testing basics, cryptography, authentication systems, and incident response workflows.",
        "price": 159.99,
        "duration_days": 75,
    },
]

created_count = 0
for data in courses_data:
    _, created = Course.objects.get_or_create(
        title=data["title"],
        defaults=data,
    )
    if created:
        created_count += 1

print(f"Courses seeded: {created_count} created, {len(courses_data) - created_count} already existed.")
