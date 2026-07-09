import advancedQuantumImage from "../assets/blog/advanced-quantum.svg";
import quantumAlgorithmsImage from "../assets/blog/quantum-algorithms.svg";
import dataScienceImage from "../assets/blog/data-science.svg";
import aiMachineLearningImage from "../assets/blog/ai-machine-learning.svg";
import agenticAiImage from "../assets/blog/agentic-ai.svg";
import quantumGatesImage from "../assets/blog/quantum-gates.svg";

export const PREMIUM_BLOG_SLUGS = [
  "advanced-quantum",
  "quantum-algorithms",
  "data-science",
  "ai-machine-learning",
  "agentic-ai",
  "quantum-gates",
];

const author = {
  name: "SIA QuantumVerse Faculty",
  avatar: "/sia-logo.png",
  role: "AI and Quantum Curriculum Team",
};

const coursePrice = {
  price: 24999,
  discounted_price: 14999,
  discount_percent: 40,
  duration_days: 42,
};

const relatedCourseMap = {
  quantum: [
    {
      id: 52,
      title: "Advanced Quantum Computing using HDQS",
      category: { name: "Quantum Computing" },
      short_description: "Delivered on the HDQS platform with circuits, algorithms, hybrid optimization, and capstone labs.",
      ...coursePrice,
    },
    {
      id: 53,
      title: "Quantum Algorithms and Complex Computations",
      category: { name: "Quantum Computing" },
      short_description: "Build intuition for search, simulation, optimization, and hybrid quantum-classical workflows.",
      ...coursePrice,
    },
  ],
  data: [
    {
      id: 54,
      title: "Data Science",
      category: { name: "Data Science" },
      short_description: "Learn analytics, Python, SQL, visualization, ML foundations, and portfolio-ready projects.",
      ...coursePrice,
    },
    {
      id: 55,
      title: "AI & ML",
      category: { name: "AI & ML" },
      short_description: "Train, evaluate, deploy, and monitor practical ML systems with production habits.",
      ...coursePrice,
    },
  ],
  ai: [
    {
      id: 55,
      title: "AI & ML",
      category: { name: "AI & ML" },
      short_description: "Build reliable predictive systems, neural networks, and model deployment pipelines.",
      ...coursePrice,
    },
    {
      id: 58,
      title: "Agentic AI",
      category: { name: "Agentic AI" },
      short_description: "Design autonomous agents with tools, memory, planning, evaluation, and guardrails.",
      ...coursePrice,
    },
  ],
};

function makeSection(id, title, icon, paragraphs, bullets = [], code = null, diagram = null) {
  return { id, title, icon, paragraphs, bullets, code, diagram };
}

function buildSections(topic) {
  const {
    subject,
    platform,
    industry,
    outcomes,
    skills,
    projects,
    stack,
    architecture,
    applications,
    careers,
    salary,
    companies,
    trends,
    code,
    diagram,
  } = topic;

  return [
    makeSection("overview", "Overview", "BookOpen", [
      `${subject} sits at the point where theory becomes a working system. In QuantumVerse, learners do not only read definitions; they move from the mental model to implementation, measurement, and project decisions.`,
      `This guide is written for beginners who want a professional path. It explains the ideas in practical language, shows how the pieces connect, and points toward the course work that turns interest into skill.`,
    ], [
      "Start with vocabulary, then connect it to workflow.",
      "Use diagrams and small code experiments before large projects.",
      "Evaluate every result with a clear metric or measurement plan.",
    ], null, diagram),
    makeSection("why-learn-this", "Why Learn This", "Sparkles", [
      `Learning ${subject} helps you reason about systems that are becoming central to modern engineering teams. The advantage is not memorizing tool names; it is learning how to break a complex problem into data, logic, constraints, and verification.`,
      `${platform} makes the learning path structured: concept lessons, guided labs, review checkpoints, and capstone tasks that can be discussed in interviews or portfolio reviews.`,
    ], [
      "It improves analytical thinking for technical roles.",
      "It builds vocabulary used by AI, data, and quantum teams.",
      "It creates project evidence instead of passive certificate claims.",
    ]),
    makeSection("industry-importance", "Industry Importance", "ChartBar", [
      `${industry} Companies need people who can understand the promise, limits, and operating requirements of advanced systems. That means knowing when a technique is useful, when it is experimental, and how to explain tradeoffs to a team.`,
      "The strongest learners combine theory with implementation discipline: version control, documentation, validation, observability, and responsible delivery.",
    ], [
      "Research teams need reproducible experiments.",
      "Product teams need reliable workflows and realistic expectations.",
      "Business teams need people who can translate technical results into decisions.",
    ]),
    makeSection("learning-outcomes", "Learning Outcomes", "AcademicCap", [
      "By the end of a serious learning path, you should be able to explain core concepts, implement a small project, interpret results, and defend design choices. That combination is what separates surface familiarity from job-ready capability.",
      "QuantumVerse lessons are designed around outcomes that can be demonstrated through notebooks, reports, dashboards, circuits, or deployed prototypes.",
    ], outcomes),
    makeSection("skills", "Skills", "WrenchScrewdriver", [
      "Skills grow fastest when they are practiced in context. A learner should repeatedly move through the loop of reading the requirement, designing a solution, implementing it, testing it, and explaining what changed.",
      "The following skills are the practical base for course projects and interviews.",
    ], skills),
    makeSection("weekly-roadmap", "Weekly Roadmap", "CalendarDays", [
      "A weekly roadmap keeps the subject from becoming overwhelming. Each week should include one concept goal, one implementation goal, and one reflection goal.",
      "Use the roadmap as a pacing guide. Learners with stronger math or programming backgrounds can move faster, but skipping review usually creates fragile understanding.",
    ], [
      "Week 1: Foundations, terminology, and environment setup.",
      "Week 2: Core models, diagrams, and first guided lab.",
      "Week 3: Intermediate implementation and debugging habits.",
      "Week 4: Evaluation, optimization, and result interpretation.",
      "Week 5: Applied mini-project with written explanation.",
      "Week 6: Capstone build, review, and portfolio packaging.",
    ]),
    makeSection("hands-on-projects", "Hands-on Projects", "CpuChip", [
      "Projects are where abstract ideas become durable. Each project should have an input, a method, an output, and a short written result analysis.",
      "A strong portfolio project is not necessarily large. It is clear, reproducible, and honest about limitations.",
    ], projects, code),
    makeSection("technology-stack", "Technology Stack", "CommandLine", [
      "Tools change, but a sensible stack stays organized around experimentation, implementation, evaluation, and presentation. The best learners understand why each tool exists in the workflow.",
      "Start with lightweight tools, then add orchestration or deployment pieces only when the project needs them.",
    ], stack),
    makeSection("architecture", "Architecture", "Squares2X2", [
      `${architecture} Think of the architecture as a set of responsibilities, not a pile of software. Inputs must be prepared, algorithms or models must run, outputs must be evaluated, and the final result must be understandable.`,
      "Clean architecture makes future work easier because every component has a reason to exist and a place to be tested.",
    ], [
      "Input layer: data, parameters, user question, or circuit design.",
      "Core layer: algorithm, model, simulation, or agent planner.",
      "Evaluation layer: metrics, measurement, traces, or validation reports.",
      "Presentation layer: dashboard, notebook, report, or application interface.",
    ]),
    makeSection("applications", "Applications", "RocketLaunch", [
      "Applications are strongest when matched to the right problem. A technique should reduce uncertainty, improve speed, reveal a pattern, or enable a computation that was previously impractical.",
      "The examples below are realistic areas where learners can connect course work to domain projects.",
    ], applications),
    makeSection("career-opportunities", "Career Opportunities", "Briefcase", [
      `Career paths connected to ${subject} reward people who can communicate clearly. Recruiters look for evidence that you can learn quickly, finish projects, explain tradeoffs, and collaborate with engineers or analysts.`,
      "A course project becomes more valuable when it includes a concise README, screenshots, evaluation notes, and next-step improvements.",
    ], careers),
    makeSection("hiring-companies", "Hiring Companies", "BuildingOffice", [
      "Hiring happens across product companies, research labs, consulting teams, analytics groups, startups, cloud providers, finance, healthcare, education technology, and enterprise automation teams.",
      "Instead of chasing brand names only, map your projects to the problems a team actually solves.",
    ], companies),
    makeSection("future-trends", "Future Trends", "ArrowTrendingUp", [
      `${trends} The future belongs to learners who can keep updating their mental model without losing engineering discipline.`,
      "Follow research, but build small systems. Building forces you to discover the practical questions that headlines usually skip.",
    ], [
      "Hybrid workflows that combine specialized models and classical software.",
      "Evaluation-first development with traces, tests, and measurable quality gates.",
      "Domain-specific tooling that makes advanced techniques accessible to smaller teams.",
    ]),
    makeSection("related-courses", "Related Courses", "RectangleStack", [
      "The fastest way to turn this guide into progress is to follow a structured course path with labs, review tasks, and a capstone.",
      "Use the related course cards below to continue from reading into guided practice.",
    ]),
    makeSection("conclusion", "Conclusion", "CheckBadge", [
      `${subject} is worth learning because it changes how you reason about problems. It teaches you to model uncertainty, design workflows, measure outcomes, and communicate technical decisions.`,
      "The next step is practical: choose a course, build the first small project, and document what you learned in a form another engineer can understand.",
    ], [
      "Learn the concept.",
      "Implement a small version.",
      "Measure and explain the result.",
      "Turn the project into portfolio evidence.",
    ]),
    makeSection("enroll-cta", "Enroll CTA", "ShoppingBag", [
      "QuantumVerse courses are built to move you from concept to capability with guided labs, applied projects, and career-oriented outcomes.",
      "Enroll when you are ready to replace scattered learning with a focused path.",
    ]),
  ];
}

const topicData = {
  "advanced-quantum": {
    subject: "Advanced Quantum Computing using HDQS",
    platform: "HDQS",
    industry: "Quantum computing is important because simulation, optimization, chemistry, materials, logistics, and cryptography all contain problems where classical approaches can become expensive.",
    outcomes: [
      "Represent qubits, amplitudes, measurement probabilities, and multi-qubit states.",
      "Use HDQS workflows to simulate hybrid discrete quantum systems.",
      "Design circuits for state preparation, entanglement, and measurement.",
      "Interpret output distributions and explain error sources.",
      "Prepare a capstone report that connects theory, circuit design, and results.",
    ],
    skills: ["Linear algebra intuition", "Circuit construction", "HDQS experimentation", "Measurement analysis", "Python notebooks", "Technical reporting"],
    projects: ["Bell-state analyzer", "HDQS state evolution lab", "Quantum random sampler", "Hybrid optimization prototype"],
    stack: ["Python", "NumPy", "Qiskit-style circuit thinking", "HDQS lab notebooks", "Matplotlib", "GitHub project reports"],
    architecture: "A practical HDQS architecture begins with a problem definition, moves through quantum state modeling, executes controlled circuit or simulation steps, and ends with classical interpretation.",
    applications: ["Materials simulation", "Optimization research", "Quantum education labs", "Cryptography readiness", "Scientific computing"],
    careers: ["Quantum software intern", "Research assistant", "Simulation engineer", "Quantum curriculum developer", "Scientific software engineer"],
    salary: "Quantum roles are specialized, so compensation often rises when quantum knowledge is paired with strong Python, math, and software engineering ability.",
    companies: ["Quantum hardware startups", "Cloud quantum teams", "Research institutes", "Advanced analytics groups", "Scientific computing labs"],
    trends: "Near-term quantum work is moving toward hybrid algorithms, better simulation tooling, error mitigation, and domain-specific learning platforms like HDQS.",
    diagram: "state-flow",
    code: {
      language: "python",
      label: "Bell state experiment",
      content: `from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure([0, 1], [0, 1])\n\nprint(qc.draw())`,
    },
  },
  "quantum-algorithms": {
    subject: "Quantum Algorithms and Complex Computations",
    platform: "QuantumVerse",
    industry: "Quantum algorithms matter because they teach engineers how amplitude, interference, and measurement can be shaped to solve selected classes of hard computational problems.",
    outcomes: ["Explain search, phase estimation, simulation, and optimization families.", "Compare classical and quantum complexity at a high level.", "Build small circuits that demonstrate algorithmic primitives.", "Read algorithm diagrams and translate them into implementation steps.", "Evaluate outputs with probability and sampling language."],
    skills: ["Algorithmic thinking", "Circuit decomposition", "Complexity intuition", "Simulation", "Result validation", "Mathematical communication"],
    projects: ["Grover search toy problem", "Quantum Fourier transform demo", "Variational optimizer notebook", "Complexity comparison report"],
    stack: ["Python", "Qiskit", "NumPy", "Jupyter", "Matplotlib", "Git"],
    architecture: "Algorithm architecture maps a problem into states, applies gates that amplify useful information, samples measurements, and uses classical post-processing to interpret the answer.",
    applications: ["Search spaces", "Optimization", "Chemistry simulation", "Finance modeling", "Security analysis"],
    careers: ["Quantum algorithm analyst", "Research engineering intern", "Optimization engineer", "Technical educator"],
    salary: "Algorithm-focused roles are competitive because they require math clarity plus implementation skill.",
    companies: ["Cloud quantum providers", "Optimization startups", "Financial research teams", "University labs", "Deep tech companies"],
    trends: "The most practical trend is hybrid algorithm design: quantum circuits working together with classical optimizers and careful benchmarking.",
    diagram: "circuit-flow",
    code: {
      language: "python",
      label: "Amplitude amplification sketch",
      content: `def grover_iterations(search_space_size, marked_items=1):\n    from math import sqrt, pi\n    return round((pi / 4) * sqrt(search_space_size / marked_items))\n\nprint(grover_iterations(64))`,
    },
  },
  "data-science": {
    subject: "Data Science",
    platform: "QuantumVerse",
    industry: "Data science is important because organizations need repeatable ways to convert raw information into decisions, forecasts, dashboards, and measurable experiments.",
    outcomes: ["Clean messy datasets and document assumptions.", "Use SQL and Python to explore patterns.", "Build visual dashboards that communicate clearly.", "Train baseline models and evaluate them honestly.", "Package an analysis into a portfolio case study."],
    skills: ["Python", "SQL", "Data cleaning", "Exploratory analysis", "Statistics", "Visualization", "Model evaluation"],
    projects: ["Student performance dashboard", "Churn analysis", "A/B test report", "Forecasting notebook"],
    stack: ["Python", "Pandas", "SQL", "scikit-learn", "Matplotlib", "Power BI or dashboard tools"],
    architecture: "A data science architecture moves from ingestion to validation, transformation, analysis, modeling, reporting, and monitoring.",
    applications: ["Learning analytics", "Sales forecasting", "Risk scoring", "Product metrics", "Operations dashboards"],
    careers: ["Data analyst", "Junior data scientist", "BI developer", "Analytics engineer", "ML associate"],
    salary: "Data roles have broad salary ranges because entry analysts, analytics engineers, and applied scientists solve different levels of problem.",
    companies: ["EdTech platforms", "Banks", "Healthcare analytics teams", "Retail product groups", "SaaS companies"],
    trends: "Modern data science is moving toward trusted pipelines, semantic layers, automated quality checks, and AI-assisted analysis.",
    diagram: "pipeline",
    code: {
      language: "python",
      label: "Reusable validation check",
      content: `required = {"student_id", "lesson_id", "score"}\nmissing = required - set(frame.columns)\nif missing:\n    raise ValueError(f"Missing columns: {missing}")\nsummary = frame.groupby("lesson_id")["score"].mean()`,
    },
  },
  "ai-machine-learning": {
    subject: "AI & Machine Learning",
    platform: "QuantumVerse",
    industry: "AI and machine learning are important because products increasingly need prediction, classification, recommendation, generation, and intelligent automation.",
    outcomes: ["Frame ML problems correctly.", "Prepare features and split datasets without leakage.", "Train baseline and improved models.", "Evaluate with metrics beyond accuracy.", "Explain model limits and deployment risks."],
    skills: ["Feature engineering", "Supervised learning", "Neural networks", "Evaluation", "Experiment tracking", "Deployment basics"],
    projects: ["Course recommender", "Classification API", "Model monitoring dashboard", "Neural network notebook"],
    stack: ["Python", "scikit-learn", "PyTorch or TensorFlow", "FastAPI", "MLflow-style tracking", "Docker basics"],
    architecture: "A reliable ML architecture separates data preparation, training, evaluation, serving, monitoring, and feedback.",
    applications: ["Recommendations", "Fraud detection", "Personalized learning", "Document intelligence", "Forecasting"],
    careers: ["ML engineer", "AI developer", "Data scientist", "MLOps associate", "Applied AI analyst"],
    salary: "AI salaries improve when learners show production judgment, not just notebook experimentation.",
    companies: ["SaaS companies", "Fintech teams", "Healthcare AI groups", "EdTech platforms", "Automation startups"],
    trends: "AI teams are moving toward smaller specialized models, retrieval workflows, evaluation pipelines, and responsible deployment.",
    diagram: "ml-loop",
    code: {
      language: "python",
      label: "Evaluation beyond accuracy",
      content: `from sklearn.metrics import classification_report\n\nmodel.fit(X_train, y_train)\npredictions = model.predict(X_valid)\nprint(classification_report(y_valid, predictions))`,
    },
  },
  "agentic-ai": {
    subject: "Agentic AI",
    platform: "QuantumVerse",
    industry: "Agentic AI matters because teams want systems that can plan, call tools, use memory, check progress, and complete multi-step work with oversight.",
    outcomes: ["Explain the difference between chatbots and agents.", "Design planner, tool, memory, and evaluator components.", "Build an agent workflow with human approval gates.", "Trace tool calls and failure modes.", "Define safety and quality checks."],
    skills: ["Prompt design", "Tool calling", "Workflow orchestration", "Memory design", "Evaluation", "Guardrails"],
    projects: ["Research assistant agent", "Course support workflow", "Document triage agent", "Agent evaluation harness"],
    stack: ["JavaScript or Python", "LLM APIs", "Vector search", "Workflow state machines", "Observability logs", "Test datasets"],
    architecture: "Agent architecture coordinates a goal, planner, tools, memory, policies, evaluator, and human handoff.",
    applications: ["Support automation", "Research workflows", "CRM assistants", "Learning tutors", "Operations copilots"],
    careers: ["AI automation engineer", "Agent workflow developer", "Prompt engineer", "AI product engineer"],
    salary: "Agentic AI compensation depends heavily on whether you can build reliable workflows and not just impressive demos.",
    companies: ["Automation startups", "Enterprise SaaS teams", "Consulting firms", "Customer support platforms", "AI labs"],
    trends: "Agent systems are shifting from open-ended demos to auditable workflows with permissions, state, evaluation, and rollback.",
    diagram: "agent-loop",
    code: {
      language: "javascript",
      label: "Agent tool contract",
      content: `const tools = {\n  searchKnowledgeBase: async ({ query }) => ({ source: "kb", query }),\n  createTicket: async ({ title, priority }) => ({ id: crypto.randomUUID(), title, priority }),\n};\n\nexport async function runAgentStep(plan) {\n  const tool = tools[plan.toolName];\n  if (!tool) throw new Error("Unknown tool");\n  return tool(plan.arguments);\n}`,
    },
  },
  "quantum-gates": {
    subject: "Quantum Gates and Circuit Design",
    platform: "QuantumVerse",
    industry: "Quantum gates are important because every useful quantum workflow depends on precise state preparation, controlled transformation, and measurement.",
    outcomes: ["Explain common gates and their effect on qubits.", "Construct multi-qubit circuits with controls.", "Read circuit diagrams confidently.", "Debug measurement outcomes.", "Design small circuits for portfolio demonstrations."],
    skills: ["Gate intuition", "Circuit notation", "Bloch sphere basics", "Entanglement patterns", "Measurement analysis", "Simulation"],
    projects: ["Gate visualizer", "Teleportation circuit", "Entanglement lab", "Circuit optimization report"],
    stack: ["Python", "Qiskit-style simulators", "Circuit diagrams", "NumPy", "Jupyter", "Git"],
    architecture: "Circuit architecture starts with registers, applies a sequence of gates, introduces controls and rotations, then measures selected qubits for classical analysis.",
    applications: ["Quantum education", "Algorithm preparation", "Simulation", "Error correction foundations", "Hardware-aware design"],
    careers: ["Quantum circuit designer", "Quantum software learner", "Research assistant", "Technical instructor"],
    salary: "Circuit design knowledge is most valuable when paired with algorithm context, simulation skill, and clear technical writing.",
    companies: ["Quantum startups", "Research labs", "Cloud quantum teams", "Advanced computing education companies"],
    trends: "Circuit design is moving toward hardware-aware compilation, error mitigation, visual learning tools, and reusable circuit libraries.",
    diagram: "gate-grid",
    code: {
      language: "python",
      label: "Controlled rotation pattern",
      content: `from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(3, 3)\nqc.h(0)\nqc.cx(0, 1)\nqc.ry(0.7, 2)\nqc.cx(1, 2)\nqc.measure([0, 1, 2], [0, 1, 2])`,
    },
  },
};

const blogShells = [
  {
    id: "advanced-quantum",
    slug: "advanced-quantum",
    title: "Advanced Quantum Computing using HDQS",
    category: "Quantum Computing",
    coverImage: advancedQuantumImage,
    courseBadge: "HDQS Quantum Track",
    difficulty: "Advanced",
    duration: "6 weeks",
    readingTime: "18 min read",
    publishedDate: "June 30, 2026",
    shortDescription: "A professional guide to HDQS workflows, quantum states, circuit experiments, and career-ready project practice.",
    relatedCourses: relatedCourseMap.quantum,
  },
  {
    id: "quantum-algorithms",
    slug: "quantum-algorithms",
    title: "Quantum Algorithms and Complex Computations",
    category: "Quantum Computing",
    coverImage: quantumAlgorithmsImage,
    courseBadge: "Quantum Algorithms Track",
    difficulty: "Advanced",
    duration: "6 weeks",
    readingTime: "17 min read",
    publishedDate: "June 30, 2026",
    shortDescription: "Learn how quantum algorithms use amplitude, interference, and hybrid computation to approach complex problems.",
    relatedCourses: relatedCourseMap.quantum,
  },
  {
    id: "data-science",
    slug: "data-science",
    title: "Data Science",
    category: "Data Science",
    coverImage: dataScienceImage,
    courseBadge: "Data Science Track",
    difficulty: "Beginner to Intermediate",
    duration: "6 weeks",
    readingTime: "16 min read",
    publishedDate: "June 30, 2026",
    shortDescription: "A beginner-friendly but professional roadmap for analytics, statistics, dashboards, ML foundations, and portfolio projects.",
    relatedCourses: relatedCourseMap.data,
  },
  {
    id: "ai-machine-learning",
    slug: "ai-machine-learning",
    title: "AI & Machine Learning",
    category: "AI & ML",
    coverImage: aiMachineLearningImage,
    courseBadge: "AI Engineering Track",
    difficulty: "Intermediate",
    duration: "6 weeks",
    readingTime: "17 min read",
    publishedDate: "June 30, 2026",
    shortDescription: "Understand how to build, evaluate, deploy, and explain reliable AI and machine learning systems.",
    relatedCourses: relatedCourseMap.ai,
  },
  {
    id: "agentic-ai",
    slug: "agentic-ai",
    title: "Agentic AI",
    category: "Artificial Intelligence",
    coverImage: agenticAiImage,
    courseBadge: "Agentic AI Track",
    difficulty: "Intermediate to Advanced",
    duration: "6 weeks",
    readingTime: "18 min read",
    publishedDate: "June 30, 2026",
    shortDescription: "Design autonomous AI agents with planning, tools, memory, evaluation, and human-centered safeguards.",
    relatedCourses: relatedCourseMap.ai,
  },
  {
    id: "quantum-gates",
    slug: "quantum-gates",
    title: "Quantum Gates and Circuit Design",
    category: "Quantum Computing",
    coverImage: quantumGatesImage,
    courseBadge: "Quantum Circuit Track",
    difficulty: "Beginner to Intermediate",
    duration: "6 weeks",
    readingTime: "16 min read",
    publishedDate: "June 30, 2026",
    shortDescription: "Build intuition for quantum gates, controls, rotations, circuit diagrams, and measurement-driven debugging.",
    relatedCourses: relatedCourseMap.quantum,
  },
];

export const PREMIUM_BLOGS = blogShells.map((blog, index, list) => {
  const sections = buildSections(topicData[blog.slug]);
  const bodyText = sections
    .map((section) => {
      const bullets = section.bullets?.length ? `\n${section.bullets.map((item) => `- ${item}`).join("\n")}` : "";
      const code = section.code ? `\n\n\`\`\`${section.code.language}\n${section.code.content}\n\`\`\`` : "";
      return `## ${section.title}\n${section.paragraphs.join("\n\n")}${bullets}${code}`;
    })
    .join("\n\n");

  return {
    ...blog,
    author,
    featured: index === 0,
    trending: index < 3,
    views: 24000 - index * 1250,
    status: "published",
    sections,
    bodyText,
    previousSlug: list[(index - 1 + list.length) % list.length].slug,
    nextSlug: list[(index + 1) % list.length].slug,
  };
});

export function getPremiumBlogBySlug(slug) {
  return PREMIUM_BLOGS.find((blog) => blog.slug === slug || String(blog.id) === String(slug)) || null;
}

export function isPremiumBlog(blog) {
  return Boolean(blog?.sections?.length);
}
