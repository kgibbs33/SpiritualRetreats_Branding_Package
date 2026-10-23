import React from "react";

/**
 * Minimal markdown renderer for the legal documents (subset used by
 * privacy-cookie-policies-draft3.md): h2, h3, paragraphs, bullet lists,
 * bold, links, blockquotes and GFM tables. The LegalLayout article styling
 * applies throughout. Tables scroll horizontally on small screens.
 */
function inline(text: string): React.ReactNode {
  // Split on bold, links, and links-with-bold segments
  const parts: React.ReactNode[] = [];
  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2] !== undefined && m[3] !== undefined) {
      parts.push(
        <a key={key++} href={m[3]} className="text-link underline">
          {m[2]}
        </a>
      );
    } else if (m[4] !== undefined) {
      parts.push(<strong key={key++}>{m[4]}</strong>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderTable(lines: string[]): React.ReactNode {
  // lines[0] header, lines[1] separator, rest data rows
  const parseRow = (l: string) =>
    l
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());
  const header = parseRow(lines[0]);
  const rows = lines.slice(2).map(parseRow);
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {header.map((h, i) => (
              <th
                key={i}
                className="whitespace-nowrap border-b-2 border-sage-mist px-3 py-2 text-left font-semibold text-forest"
              >
                {inline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="odd:bg-warm-cream/40">
              {r.map((cell, j) => (
                <td key={j} className="border-b border-sage-mist px-3 py-2 align-top text-stone-700">
                  {inline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LegalMarkdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      out.push(
        <h2 key={key++}>{inline(line.slice(3))}</h2>
      );
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      out.push(
        <h3 key={key++}>{inline(line.slice(4))}</h3>
      );
      i++;
      continue;
    }
    if (line.trim().startsWith("|")) {
      // table: collect contiguous table lines
      const tbl: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tbl.push(lines[i]);
        i++;
      }
      out.push(<div key={key++}>{renderTable(tbl)}</div>);
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2).trim());
        i++;
      }
      out.push(
        <ul key={key++}>
          {items.map((it, j) => (
            <li key={j}>{inline(it)}</li>
          ))}
        </ul>
      );
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    // paragraph (possibly italic *…*)
    const text = line.replace(/\*([^*]+)\*/g, "$1");
    out.push(<p key={key++}>{inline(text)}</p>);
    i++;
  }

  return <>{out}</>;
}