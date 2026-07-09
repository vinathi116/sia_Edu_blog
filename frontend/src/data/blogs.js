import { PREMIUM_BLOGS } from "./premiumBlogs";

export const BLOG_CATEGORIES = [
  "Artificial Intelligence",
  "Machine Learning",
  "Deep Learning",
  "Quantum Computing",
  "Data Science",
  "Cyber Security",
  "Cloud Computing",
  "Programming",
  "Career Guidance",
  "Interview Preparation",
];

const AUTHORS = {
  ananya: {
    name: "Ananya Rao",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    role: "AI Curriculum Lead",
  },
  marcus: {
    name: "Marcus Vance",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    role: "Principal AI Architect",
  },
  sara: {
    name: "Sara Menon",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    role: "Lead Data Engineer",
  },
  kabir: {
    name: "Kabir Shah",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    role: "Cloud Security Mentor",
  },
};

const LEGACY_BLOGS = [
  {
    id: 1,
    title: "Demystifying Quantum Computing: A Beginner's Guide",
    category: "Quantum Computing",
    coverImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
    author: AUTHORS.ananya,
    publishedDate: "June 28, 2026",
    readingTime: "7 min read",
    shortDescription: "Learn qubits, superposition, entanglement, and the practical reasons developers should understand quantum workflows.",
    featured: true,
    trending: true,
    views: 18420,
    status: "published",
    bodyText: `# Demystifying Quantum Computing

Quantum computing is no longer a laboratory-only idea. Hardware is still early, but the software model is mature enough for students and engineers to begin learning the core mental model.

## What is a qubit?

A classical bit is either 0 or 1. A quantum bit can be represented as a weighted combination of both states until it is measured.

> Quantum programming starts to feel less mysterious when you treat it as probability engineering with strict physical rules.

![Quantum circuit board](https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1100&q=80)

## Concepts to learn first

- Superposition lets a qubit carry a combination of states.
- Entanglement links qubits so the system must be interpreted together.
- Measurement converts the quantum state into classical information.

## A tiny Bell state in Qiskit

\`\`\`python
from qiskit import QuantumCircuit

circuit = QuantumCircuit(2, 2)
circuit.h(0)
circuit.cx(0, 1)
circuit.measure([0, 1], [0, 1])

print(circuit)
\`\`\`

| Concept | Developer intuition |
| --- | --- |
| Hadamard gate | Creates superposition |
| CNOT gate | Creates dependency between qubits |
| Measurement | Produces classical output |

For a friendly next step, explore the [IBM Quantum Learning](https://learning.quantum.ibm.com/) path and practice drawing circuits before writing larger programs.`,
  },
  {
    id: 2,
    title: "Building Responsible AI Features for Real Products",
    category: "Artificial Intelligence",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
    author: AUTHORS.marcus,
    publishedDate: "June 26, 2026",
    readingTime: "6 min read",
    shortDescription: "A practical checklist for designing AI features that are useful, explainable, monitored, and safe for learners.",
    featured: true,
    trending: true,
    views: 16980,
    status: "published",
    bodyText: `# Building Responsible AI Features

Responsible AI is not a policy document you attach at the end. It is a product habit that shapes data collection, model choice, user experience, and monitoring.

## Product questions before model questions

- What user decision will this feature support?
- What happens when the answer is wrong?
- Can the user inspect or override the result?
- Which data should never be sent to the model?

> Good AI interfaces give users leverage without hiding uncertainty.

## A lightweight review table

| Risk area | Mitigation |
| --- | --- |
| Hallucination | Cite source material and show confidence boundaries |
| Privacy | Redact personally identifiable information before inference |
| Bias | Test prompts and examples across learner backgrounds |
| Drift | Log outcomes and schedule periodic evaluation |

## Example guardrail wrapper

\`\`\`javascript
export function buildTutorPrompt(question, lessonContext) {
  return {
    role: "user",
    content: \`Answer only from this lesson context: \${lessonContext}\nQuestion: \${question}\`,
  };
}
\`\`\`

Teams that ship AI well treat evaluation as part of the feature, not as a one-time experiment.`,
  },
  {
    id: 3,
    title: "Deep Dive into Transformers: The Architecture Behind Modern LLMs",
    category: "Deep Learning",
    coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
    author: AUTHORS.ananya,
    publishedDate: "June 25, 2026",
    readingTime: "8 min read",
    shortDescription: "Understand tokens, attention, feed-forward layers, and why transformer models scale so effectively.",
    featured: false,
    trending: true,
    views: 14230,
    status: "published",
    bodyText: `# Deep Dive into Transformers

The transformer architecture changed deep learning because it made sequence modeling parallel, scalable, and context-aware.

## The attention idea

Attention lets each token decide which other tokens matter for the current prediction.

\`\`\`
Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V
\`\`\`

## Transformer block ingredients

- Multi-head self-attention
- Layer normalization
- Feed-forward networks
- Residual connections

## Minimal PyTorch sketch

\`\`\`python
import torch
import torch.nn.functional as F

scores = queries @ keys.transpose(-2, -1)
weights = F.softmax(scores / keys.shape[-1] ** 0.5, dim=-1)
context = weights @ values
\`\`\`

> The model is not memorizing sentences in a simple table. It is learning reusable patterns of context.

Students should pair architecture study with small experiments: train a toy character model, inspect attention maps, and compare outputs after changing context length.`,
  },
  {
    id: 4,
    title: "Machine Learning Model Evaluation Beyond Accuracy",
    category: "Machine Learning",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    author: AUTHORS.sara,
    publishedDate: "June 22, 2026",
    readingTime: "5 min read",
    shortDescription: "Accuracy is only the beginning. Learn precision, recall, F1, ROC-AUC, and business-aware evaluation.",
    featured: false,
    trending: false,
    views: 8960,
    status: "published",
    bodyText: `# Model Evaluation Beyond Accuracy

Accuracy can be misleading when classes are imbalanced or when mistakes have different costs.

## Choose metrics by consequence

| Use case | Metric to inspect |
| --- | --- |
| Fraud detection | Recall and false positives |
| Medical screening | Sensitivity and specificity |
| Recommendation ranking | Precision at k |
| Churn prediction | Lift and calibration |

## Confusion matrix language

- True positive: model says yes and reality is yes.
- False positive: model says yes but reality is no.
- False negative: model says no but reality is yes.

\`\`\`python
from sklearn.metrics import classification_report

print(classification_report(y_true, y_pred))
\`\`\`

> A metric is useful only when it reflects the decision the product will make.

Always inspect slices of performance across user groups, data sources, and time periods.`,
  },
  {
    id: 5,
    title: "Data Science Pipelines That Survive Production",
    category: "Data Science",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    author: AUTHORS.sara,
    publishedDate: "June 18, 2026",
    readingTime: "7 min read",
    shortDescription: "Design reproducible data pipelines with validation, orchestration, monitoring, and clear ownership.",
    featured: false,
    trending: true,
    views: 12110,
    status: "published",
    bodyText: `# Data Science Pipelines That Survive Production

Production data science depends on repeatable workflows. A notebook is a good laboratory, but production needs contracts.

## Pipeline stages

1. Extract source data.
2. Validate schema and freshness.
3. Transform features.
4. Train or score models.
5. Monitor drift and failures.

\`\`\`python
from prefect import flow, task

@task(retries=3)
def validate(frame):
    required = {"student_id", "lesson_id", "score"}
    missing = required - set(frame.columns)
    if missing:
        raise ValueError(f"Missing columns: {missing}")
    return frame

@flow
def learning_analytics_pipeline(frame):
    clean = validate(frame)
    return clean.groupby("lesson_id")["score"].mean()
\`\`\`

![Analytics dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1100&q=80)

> The best pipeline is boring to operate because it fails loudly and predictably.`,
  },
  {
    id: 6,
    title: "Cyber Security Basics Every Developer Should Practice",
    category: "Cyber Security",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    author: AUTHORS.kabir,
    publishedDate: "June 14, 2026",
    readingTime: "6 min read",
    shortDescription: "A developer-friendly guide to authentication, input validation, dependency hygiene, and secure defaults.",
    featured: false,
    trending: false,
    views: 7820,
    status: "published",
    bodyText: `# Cyber Security Basics Every Developer Should Practice

Security is easier when it is part of the default workflow. You do not need to be a specialist to avoid common mistakes.

## Daily habits

- Validate input on the server.
- Store secrets outside source control.
- Keep dependencies updated.
- Use least-privilege access for services.
- Log security-relevant events without exposing sensitive values.

\`\`\`javascript
const allowedRoles = new Set(["student", "instructor", "admin"]);

export function normalizeRole(role) {
  if (!allowedRoles.has(role)) {
    return "student";
  }
  return role;
}
\`\`\`

| Mistake | Safer habit |
| --- | --- |
| Hard-coded API keys | Environment variables |
| Raw SQL strings | Parameterized queries |
| Broad admin tokens | Scoped service accounts |

> Security work compounds. Small defaults prevent large incidents.`,
  },
  {
    id: 7,
    title: "Cloud Computing Roadmap for Full Stack Students",
    category: "Cloud Computing",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    author: AUTHORS.kabir,
    publishedDate: "June 10, 2026",
    readingTime: "5 min read",
    shortDescription: "Learn the cloud concepts that matter first: compute, storage, networking, identity, observability, and cost.",
    featured: false,
    trending: false,
    views: 6940,
    status: "published",
    bodyText: `# Cloud Computing Roadmap

Cloud platforms look huge because they contain many specialized services. Start with the primitives and the rest becomes easier.

## Learn in this order

1. Linux and networking basics
2. Compute: virtual machines, containers, serverless
3. Storage: object, block, relational, document
4. Identity and access management
5. Observability and cost control

## Deployment checklist

- Health checks are configured.
- Logs include request identifiers.
- Secrets are managed by the platform.
- Backups are tested.
- Alerts route to the right owner.

> The cloud is not just someone else's computer. It is an operating model for reliable software.

Students should deploy small projects repeatedly. Repetition builds cloud fluency faster than memorizing service names.`,
  },
  {
    id: 8,
    title: "Programming Clean React Components for LMS Dashboards",
    category: "Programming",
    coverImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
    author: AUTHORS.marcus,
    publishedDate: "June 6, 2026",
    readingTime: "6 min read",
    shortDescription: "Practical React component patterns for readable dashboards, predictable state, and reusable UI behavior.",
    featured: false,
    trending: false,
    views: 8420,
    status: "published",
    bodyText: `# Clean React Components for LMS Dashboards

Dashboard code becomes hard to maintain when data fetching, filtering, formatting, and markup all live in one oversized component.

## Split by responsibility

- Page components own routing and page-level state.
- Service modules fetch or transform data.
- UI components render predictable props.
- Hooks share reusable behavior.

\`\`\`jsx
function CourseProgressCard({ course, onResume }) {
  return (
    <article className="course-card">
      <h3>{course.title}</h3>
      <progress value={course.progress} max="100" />
      <button type="button" onClick={() => onResume(course.id)}>
        Resume
      </button>
    </article>
  );
}
\`\`\`

## Review checklist

| Question | Good sign |
| --- | --- |
| Can it be tested? | Logic is not trapped in markup |
| Can it be reused? | Props are clear and narrow |
| Can it fail well? | Loading and empty states exist |

Clean components make future features cheaper.`,
  },
  {
    id: 9,
    title: "Career Guidance: Building a Portfolio Recruiters Can Read",
    category: "Career Guidance",
    coverImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
    author: AUTHORS.ananya,
    publishedDate: "June 2, 2026",
    readingTime: "5 min read",
    shortDescription: "Turn coursework into a credible portfolio with case studies, measurable outcomes, and clear project narratives.",
    featured: false,
    trending: true,
    views: 13770,
    status: "published",
    bodyText: `# Building a Portfolio Recruiters Can Read

A strong portfolio is not a gallery of screenshots. It is evidence that you can understand a problem, make tradeoffs, and finish useful software.

## Each project should answer

- What problem did you solve?
- Who was the user?
- What technologies did you choose and why?
- What was difficult?
- What would you improve next?

> Recruiters scan quickly. Make your strongest evidence visible in the first minute.

## Portfolio project table

| Project type | What it demonstrates |
| --- | --- |
| LMS dashboard | Auth, routing, state, charts |
| ML classifier | Data cleaning, metrics, deployment |
| Cloud API | Backend design, observability, security |

Add a short README, a live demo when possible, and two or three screenshots that show real workflows.`,
  },
  {
    id: 10,
    title: "Interview Preparation for Python and JavaScript Developers",
    category: "Interview Preparation",
    coverImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
    author: AUTHORS.marcus,
    publishedDate: "May 29, 2026",
    readingTime: "6 min read",
    shortDescription: "A focused plan for coding rounds, debugging interviews, system design basics, and behavioral storytelling.",
    featured: false,
    trending: false,
    views: 9650,
    status: "published",
    bodyText: `# Interview Preparation for Developers

Interview preparation works best when it is deliberate. Practice a small set of skills deeply instead of collecting endless question lists.

## Weekly plan

1. Solve three data structure problems.
2. Explain one solution out loud.
3. Review one project from your portfolio.
4. Practice one behavioral story using the STAR format.

\`\`\`python
def two_sum(nums, target):
    seen = {}
    for index, value in enumerate(nums):
        need = target - value
        if need in seen:
            return [seen[need], index]
        seen[value] = index
    return []
\`\`\`

## Behavioral story structure

| Step | Purpose |
| --- | --- |
| Situation | Set context quickly |
| Task | Clarify your responsibility |
| Action | Show your decisions |
| Result | Quantify the outcome |

> The best candidates make their thinking easy to follow.`,
  },
  {
    id: 11,
    title: "From Notebook to API: Serving Machine Learning Models",
    category: "Machine Learning",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    author: AUTHORS.sara,
    publishedDate: "May 24, 2026",
    readingTime: "7 min read",
    shortDescription: "Package a trained model behind an API with validation, versioning, monitoring, and simple rollback habits.",
    featured: false,
    trending: false,
    views: 7310,
    status: "published",
    bodyText: `# From Notebook to API

A model becomes useful when another system can call it reliably. Serving is where machine learning meets software engineering.

## Serving checklist

- Freeze preprocessing with the model artifact.
- Validate request payloads.
- Return predictable error messages.
- Log model version and latency.
- Keep a rollback path.

\`\`\`python
from pydantic import BaseModel

class PredictionRequest(BaseModel):
    hours_studied: float
    attendance_rate: float

def predict(payload: PredictionRequest):
    features = [[payload.hours_studied, payload.attendance_rate]]
    return {"score": float(model.predict(features)[0])}
\`\`\`

> A correct model with an unreliable API is still an unreliable product.

Version your models and evaluate them after deployment, not only before launch.`,
  },
  {
    id: 12,
    title: "Deep Learning Computer Vision Projects for Beginners",
    category: "Deep Learning",
    coverImage: "https://images.unsplash.com/photo-1527430253228-e93688616381?auto=format&fit=crop&w=1200&q=80",
    author: AUTHORS.ananya,
    publishedDate: "May 20, 2026",
    readingTime: "5 min read",
    shortDescription: "Start computer vision with image classification, augmentation, transfer learning, and careful error analysis.",
    featured: false,
    trending: false,
    views: 6880,
    status: "published",
    bodyText: `# Computer Vision Projects for Beginners

Computer vision is a rewarding entry point into deep learning because results are visible and easy to inspect.

## Beginner project ladder

- Classify handwritten digits.
- Detect whether a classroom image contains a whiteboard.
- Fine-tune a pretrained model for course certificate recognition.
- Build a small image search tool using embeddings.

![Computer vision workspace](https://images.unsplash.com/photo-1527430253228-e93688616381?auto=format&fit=crop&w=1100&q=80)

\`\`\`python
from torchvision import models

model = models.resnet18(weights="DEFAULT")
model.fc = torch.nn.Linear(model.fc.in_features, 3)
\`\`\`

> The model's mistakes are your curriculum. Inspect them before changing architecture.

Track dataset quality, class balance, and augmentation choices before trying larger models.`,
  },
];

export const INITIAL_BLOGS = [...PREMIUM_BLOGS, ...LEGACY_BLOGS];
