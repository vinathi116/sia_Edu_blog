"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";

export function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="my-6 overflow-hidden rounded-lg border border-[#dbe5df] bg-white">
      <div className="flex items-center justify-between border-b border-[#dbe5df] bg-[#eef6f3] px-4 py-2">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#526866]">{language || "code"}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-[#ccd9d4] bg-white px-3 text-sm text-[#153d39]"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter language={language || "text"} style={oneLight} customStyle={{ margin: 0, padding: "1rem" }}>
        {value}
      </SyntaxHighlighter>
    </div>
  );
}
