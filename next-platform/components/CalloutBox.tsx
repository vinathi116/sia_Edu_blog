import { Info } from "lucide-react";

export function CalloutBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-5 flex gap-3 rounded-lg border border-[#b8ddd6] bg-[#edf8f6] p-4">
      <Info className="mt-1 shrink-0 text-[#007b83]" size={20} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
