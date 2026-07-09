export function parseMarkdown(text) {
  if (!text) return [];

  const blocks = [];
  const lines = text.split("\n");
  let currentList = null;
  let inCodeBlock = false;
  let codeSnippet = [];
  let codeLanguage = "javascript";

  let inContainerBlock = false;
  let containerBlockType = "";
  let containerBlockParams = "";
  let containerBlockContent = [];

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  const parseTable = (startIndex) => {
    const headerLine = lines[startIndex]?.trim();
    const dividerLine = lines[startIndex + 1]?.trim();
    if (!headerLine?.includes("|") || !/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(dividerLine || "")) {
      return null;
    }

    const rows = [];
    let index = startIndex + 2;
    while (index < lines.length && lines[index].trim().includes("|")) {
      rows.push(splitTableCells(lines[index]));
      index += 1;
    }

    return {
      block: {
        type: "table",
        headers: splitTableCells(headerLine),
        rows,
      },
      nextIndex: index - 1,
    };
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushList();
      if (inCodeBlock) {
        blocks.push({
          type: "code",
          code: codeSnippet.join("\n"),
          language: codeLanguage,
        });
        inCodeBlock = false;
        codeSnippet = [];
      } else {
        inCodeBlock = true;
        codeLanguage = trimmed.replace("```", "").trim() || "javascript";
      }
      continue;
    }

    if (inCodeBlock) {
      codeSnippet.push(line);
      continue;
    }

    if (trimmed.startsWith(":::")) {
      flushList();
      if (inContainerBlock) {
        blocks.push({
          type: "container",
          containerType: containerBlockType.toLowerCase(),
          params: containerBlockParams,
          content: containerBlockContent.join("\n"),
        });
        inContainerBlock = false;
        containerBlockContent = [];
        containerBlockType = "";
        containerBlockParams = "";
      } else {
        inContainerBlock = true;
        const lineParts = trimmed.substring(3).trim().split(/\s+/);
        containerBlockType = lineParts[0] || "";
        containerBlockParams = lineParts.slice(1).join(" ");
        containerBlockContent = [];
      }
      continue;
    }

    if (inContainerBlock) {
      containerBlockContent.push(line);
      continue;
    }

    if (trimmed === "") {
      flushList();
      continue;
    }

    if (/^[-*_]{3,}$/.test(trimmed)) {
      flushList();
      blocks.push({ type: "divider" });
      continue;
    }

    const table = parseTable(i);
    if (table) {
      flushList();
      blocks.push(table.block);
      i = table.nextIndex;
      continue;
    }

    const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)(?:\{(.*?)\})?$/);
    if (imageMatch) {
      const meta = parseImageMeta(imageMatch[3] || "");
      flushList();
      blocks.push({
        type: "image",
        alt: escapeHtml(imageMatch[1]),
        src: sanitizeUrl(imageMatch[2]),
        caption: escapeHtml(meta.caption || ""),
        align: meta.align || "center",
      });
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.*)$/);
    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (unorderedMatch || orderedMatch) {
      const listType = orderedMatch ? "ordered-list" : "list";
      const itemText = orderedMatch?.[1] || unorderedMatch?.[1] || "";
      const parsedItem = formatInlineStyles(itemText);

      if (currentList?.type === listType) {
        currentList.items.push(parsedItem);
      } else {
        flushList();
        currentList = { type: listType, items: [parsedItem] };
      }
      continue;
    }

    flushList();

    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "heading", level: 1, text: formatInlineStyles(trimmed.substring(2)) });
    } else if (trimmed.startsWith("## ")) {
      blocks.push({ type: "heading", level: 2, text: formatInlineStyles(trimmed.substring(3)) });
    } else if (trimmed.startsWith("### ")) {
      blocks.push({ type: "heading", level: 3, text: formatInlineStyles(trimmed.substring(4)) });
    } else if (trimmed.startsWith("> ")) {
      blocks.push({ type: "quote", text: formatInlineStyles(trimmed.substring(2)) });
    } else {
      blocks.push({ type: "paragraph", text: formatInlineStyles(line) });
    }
  }

  flushList();
  if (inCodeBlock) {
    blocks.push({
      type: "code",
      code: codeSnippet.join("\n"),
      language: codeLanguage,
    });
  }

  return blocks;
}

function parseImageMeta(value) {
  const meta = {};
  const alignMatch = value.match(/align=(left|center|right|full)/i);
  const captionMatch = value.match(/caption="([^"]*)"/i);
  if (alignMatch) meta.align = alignMatch[1].toLowerCase();
  if (captionMatch) meta.caption = captionMatch[1];
  return meta;
}

function splitTableCells(line) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => formatInlineStyles(cell.trim()));
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeUrl(url) {
  const trimmed = String(url || "").trim();
  if (/^(https?:\/\/|\/)/i.test(trimmed)) {
    return trimmed.replace(/"/g, "%22");
  }
  return "";
}

function formatInlineStyles(text) {
  if (!text) return "";
  let html = escapeHtml(text);

  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g, (_, label, url) => {
    return `<a href="${sanitizeUrl(url)}" target="_blank" rel="noreferrer">${label}</a>`;
  });
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  html = html.replace(/\+\+(.*?)\+\+/g, "<u>$1</u>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  html = html.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');

  return html;
}
