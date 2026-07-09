import type { TocItem } from "./types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "section";
}

export function buildRuntimeToc(markdown: string): TocItem[] {
  const counts = new Map<string, number>();
  let inCode = false;

  return markdown.split(/\r?\n/).flatMap((line) => {
    if (line.trim().startsWith("```")) {
      inCode = !inCode;
      return [];
    }
    if (inCode) return [];

    const match = /^(#{1,3})\s+(.+?)\s*$/.exec(line);
    if (!match) return [];

    const level = match[1].length;
    const title = match[2].trim();
    const base = slugify(title);
    const nextCount = (counts.get(base) || 0) + 1;
    counts.set(base, nextCount);

    return [{ level, title, anchor: nextCount === 1 ? base : `${base}-${nextCount}` }];
  });
}

export function mergeToc(stored: TocItem[] | null | undefined, markdown: string) {
  return stored && stored.length > 0 ? stored : buildRuntimeToc(markdown);
}
