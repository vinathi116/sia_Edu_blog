const styles: Record<string, string[]> = {
  comparison: ["Bits", "Qubits", "States", "Measurement"],
  industry: ["Health", "Finance", "Logistics", "Security", "Energy"],
  timeline: ["Theory", "Algorithms", "Cloud", "HDQS"],
  bloch: ["|0>", "phase", "|1>", "measure"],
  circuit: ["q0", "H", "CNOT", "M"],
  hybrid: ["App", "API", "Simulator", "QPU", "Results"],
  logos: ["IBM", "Qiskit", "Python", "Azure", "HDQS"],
  roadmap: ["Circuits", "Algorithms", "Hybrid", "Projects"],
  career: ["Developer", "Engineer", "Research", "Consulting"],
  future: ["Cloud", "AI", "QKD", "Internet"],
  lab: ["Design", "Run", "Analyze", "Improve"]
};

export function DiagramCard({ type, title, caption, alt }: { type: string; title: string; caption: string; alt: string }) {
  const nodes = styles[type] || styles.circuit;

  return (
    <figure className="my-8 rounded-lg border border-[#dbe5df] bg-white p-4" role="img" aria-label={alt}>
      <div className="rounded-lg bg-[#eef6f3] p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6a7c78]">Educational diagram</p>
            <h3 className="mt-1 text-xl font-bold text-[#153d39]">{title}</h3>
          </div>
          <div className="h-12 w-12 rounded-full border-4 border-[#007b83] bg-white shadow-inner" />
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {nodes.map((node, index) => (
            <div key={`${type}-${node}`} className="relative rounded-lg border border-[#c7d9d4] bg-white p-4 text-center">
              <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-[#007b83] text-center text-sm font-bold leading-10 text-white">
                {index + 1}
              </div>
              <p className="text-sm font-semibold text-[#153d39]">{node}</p>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="px-1 pt-3 text-sm text-[#5d6f6e]">{caption}</figcaption>
    </figure>
  );
}
