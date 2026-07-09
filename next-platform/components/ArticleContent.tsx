import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { diagramPlacements } from "@/lib/diagrams";
import { CalloutBox } from "./CalloutBox";
import { CodeBlock } from "./CodeBlock";
import { DiagramCard } from "./DiagramCard";
import { ResponsiveTable } from "./ResponsiveTable";

function sectionDiagram(title: string) {
  return diagramPlacements.find((item) => item.match === title || title.includes(item.match));
}

function Heading({
  level,
  children
}: {
  level: 1 | 2 | 3;
  children: React.ReactNode;
}) {
  const text = String(children);
  const diagram = sectionDiagram(text);
  const Tag = `h${level}` as "h1" | "h2" | "h3";

  return (
    <>
      <Tag>{children}</Tag>
      {diagram && <DiagramCard type={diagram.type} title={diagram.title} caption={diagram.caption} alt={diagram.alt} />}
    </>
  );
}

export function ArticleContent({ markdown }: { markdown: string }) {
  return (
    <article className="article-content min-w-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]]}
        components={{
          h1: ({ children }) => <Heading level={1}>{children}</Heading>,
          h2: ({ children }) => <Heading level={2}>{children}</Heading>,
          h3: ({ children }) => <Heading level={3}>{children}</Heading>,
          blockquote: ({ children }) => <CalloutBox>{children}</CalloutBox>,
          table: ({ children }) => (
            <ResponsiveTable>
              <table>{children}</table>
            </ResponsiveTable>
          ),
          code: ({ className, children }) => {
            const value = String(children).replace(/\n$/, "");
            const match = /language-(\w+)/.exec(className || "");
            if (!className) {
              return <code className="rounded bg-[#eef6f3] px-1.5 py-0.5 text-[#8b4a00]">{children}</code>;
            }
            return <CodeBlock language={match?.[1] || "text"} value={value} />;
          }
        }}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
