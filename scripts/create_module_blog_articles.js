const fs = require("fs");
const path = require("path");

const root = process.cwd();
const courseDir = path.join(
  root,
  "sia_edu",
  "backend",
  "content",
  "courses",
  "advanced-quantum-computing-using-hdqs",
);
const blogDir = path.join(root, "sia_edu", "backend", "content", "blogs");
const courseSlug = "advanced-quantum-computing-using-hdqs";
const heroImage = "courses/images/advanced-quantum-computing-using-hdqs.webp";

const articles = [
  {
    file: "module-01-mathematical-foundations.md",
    slug: "advanced-quantum-computing-module-01-mathematical-foundations",
    title: "Advanced Quantum Computing Module 1: Mathematical Foundations",
    description:
      "Build the mathematical foundation for advanced quantum computing with qubits, state normalization, matrices, Hilbert space, measurement, and HDQS workflows.",
    tags: ["Quantum Computing", "Mathematical Foundations", "Qubits", "HDQS"],
  },
  {
    file: "module-02-quantum-gates.md",
    slug: "advanced-quantum-computing-module-02-quantum-gates",
    title: "Advanced Quantum Computing Module 2: Quantum Gates",
    description:
      "Learn single-qubit gates, multi-qubit gates, circuit construction, measurement, state evolution, and circuit optimization using HDQS examples.",
    tags: ["Quantum Gates", "Quantum Circuits", "HDQS", "Circuit Optimization"],
  },
  {
    file: "module-03-entanglement.md",
    slug: "advanced-quantum-computing-module-03-entanglement",
    title: "Advanced Quantum Computing Module 3: Entanglement",
    description:
      "Study Bell states, quantum entanglement, density matrices, mixed states, Bloch sphere analysis, and practical entanglement metrics.",
    tags: ["Entanglement", "Bell States", "Density Matrices", "Bloch Sphere"],
  },
  {
    file: "module-04-algorithms.md",
    slug: "advanced-quantum-computing-module-04-algorithms",
    title: "Advanced Quantum Computing Module 4: Quantum Algorithms",
    description:
      "Explore Deutsch, Deutsch-Jozsa, Bernstein-Vazirani, Simon, Grover, QFT, phase estimation, amplitude amplification, and Shor algorithms.",
    tags: ["Quantum Algorithms", "Deutsch-Jozsa", "Grover Search", "QFT", "Shor Algorithm"],
  },
  {
    file: "module-05-search.md",
    slug: "advanced-quantum-computing-module-05-search",
    title: "Advanced Quantum Computing Module 5: Quantum Search",
    description:
      "Understand Quantum Fourier Transform, phase estimation, Grover search, amplitude amplification, quantum counting, and search workflow design.",
    tags: ["Quantum Search", "Grover Algorithm", "Phase Estimation", "Amplitude Amplification"],
  },
  {
    file: "module-06-cryptography.md",
    slug: "advanced-quantum-computing-module-06-cryptography",
    title: "Advanced Quantum Computing Module 6: Quantum Cryptography",
    description:
      "Learn quantum key distribution, BB84, E91, teleportation, quantum communication, security analysis, and HDQS cryptography simulations.",
    tags: ["Quantum Cryptography", "BB84", "E91", "QKD", "Quantum Teleportation"],
  },
  {
    file: "module-07-variational.md",
    slug: "advanced-quantum-computing-module-07-variational",
    title: "Advanced Quantum Computing Module 7: Variational Quantum Computing",
    description:
      "Master parameterized quantum circuits, VQE, QAOA, gradient optimization, barren plateaus, and hardware-efficient ansatze.",
    tags: ["VQE", "QAOA", "Variational Algorithms", "Hybrid Quantum Computing"],
  },
  {
    file: "module-08-qml.md",
    slug: "advanced-quantum-computing-module-08-qml",
    title: "Advanced Quantum Computing Module 8: Quantum Machine Learning",
    description:
      "Build quantum machine learning foundations with data encoding, feature maps, quantum kernels, variational classifiers, QNNs, and hybrid pipelines.",
    tags: ["Quantum Machine Learning", "Feature Maps", "Quantum Kernels", "VQC", "QNN"],
  },
  {
    file: "projects.md",
    slug: "advanced-quantum-computing-projects",
    title: "Advanced Quantum Computing Projects and Capstone Labs",
    description:
      "Complete HDQS project articles covering quantum randomness, entanglement, Deutsch-Jozsa, Grover, BB84, VQE, QAOA, and QML capstones.",
    tags: ["Quantum Projects", "HDQS Labs", "Capstone", "VQE", "QAOA"],
  },
];

function yamlString(value) {
  return JSON.stringify(value);
}

function yamlList(values) {
  return values.map((value) => `  - ${yamlString(value)}`).join("\n");
}

for (const article of articles) {
  const sourcePath = path.join(courseDir, article.file);
  const body = fs.readFileSync(sourcePath, "utf8").trim();
  const outputDir = path.join(blogDir, article.slug);
  fs.mkdirSync(outputDir, { recursive: true });

  const frontmatter = [
    "---",
    `title: ${yamlString(article.title)}`,
    `slug: ${yamlString(article.slug)}`,
    `description: ${yamlString(article.description)}`,
    'author: "SIA Technical Editorial Team"',
    'published: "2026-07-06"',
    'updated: "2026-07-06"',
    'category: "Quantum Computing"',
    'status: "published"',
    "tags:",
    yamlList(article.tags),
    `heroImage: ${yamlString(heroImage)}`,
    "featured: false",
    "relatedCourses:",
    `  - ${yamlString(courseSlug)}`,
    `seoTitle: ${yamlString(`${article.title} | SIA Software Innovations`)}`,
    `metaDescription: ${yamlString(article.description)}`,
    "---",
  ].join("\n");

  fs.writeFileSync(path.join(outputDir, "index.md"), `${frontmatter}\n\n${body}\n`, "utf8");
}

console.log(`Created ${articles.length} separated advanced quantum computing blog articles.`);
