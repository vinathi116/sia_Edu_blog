"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/types";

function TocLinks({ toc, activeId, onNavigate }: { toc: TocItem[]; activeId: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {toc.map((item) => (
        <a
          key={`${item.anchor}-${item.title}`}
          href={`#${item.anchor}`}
          onClick={onNavigate}
          className={`block rounded-md px-3 py-2 text-sm leading-snug transition ${
            activeId === item.anchor ? "bg-[#dff1ee] text-[#005f66]" : "text-[#526866] hover:bg-[#edf5f2]"
          } ${item.level === 2 ? "ml-3" : ""} ${item.level === 3 ? "ml-6" : ""}`}
        >
          {item.title}
        </a>
      ))}
    </nav>
  );
}

export function StickyTOC({ toc }: { toc: TocItem[] }) {
  const [activeId, setActiveId] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const headings = toc.map((item) => document.getElementById(item.anchor)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 1] }
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [toc]);

  return (
    <>
      <aside className="sticky top-20 hidden max-h-[calc(100vh-6rem)] overflow-auto rounded-lg border border-[#dbe5df] bg-white p-4 lg:block">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#6a7c78]">Contents</p>
        <TocLinks toc={toc} activeId={activeId} />
      </aside>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#007b83] text-white shadow-lg lg:hidden"
        aria-label="Open table of contents"
      >
        <Menu size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/35 lg:hidden" role="dialog" aria-modal="true">
          <div className="ml-auto h-full w-[min(88vw,380px)] overflow-auto bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#6a7c78]">Contents</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#dbe5df]"
                aria-label="Close table of contents"
              >
                <X size={20} />
              </button>
            </div>
            <TocLinks toc={toc} activeId={activeId} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
