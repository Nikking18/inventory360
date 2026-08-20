import React from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

interface BlogContentRendererProps {
  content: string;
}

type AstNode =
  | { type: 'heading'; level: 2 | 3 | 4; text: string; id: string }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; code: string; language?: string }
  | { type: 'math'; formula: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'blockquote'; lines: string[] }
  | { type: 'hr' }
  | {
      type: 'ordered-list';
      items: {
        num: string;
        text: string;
        subItems: string[];
      }[];
    }
  | {
      type: 'unordered-list';
      items: {
        text: string;
        subItems: string[];
      }[];
    };

export const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({ content }) => {
  // 1. INLINE RENDERER (Tokens: Links, Bold, Italic, Code, Inline Math)
  const renderInline = (text: string, isDarkBg = false): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // 1. Inline Math: $formula$
      const mathMatch = remaining.match(/^(\$)(.+?)(\$)/);
      if (mathMatch) {
        let cleanMath = mathMatch[2]
          .replace(/\\text\{([^}]+)\}/g, '$1')
          .replace(/\\times/g, '×')
          .replace(/\\approx/g, '≈')
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
          .replace(/\\sum/g, 'Σ')
          .replace(/\\sigma_\{([^}]+)\}/g, 'σ_$1')
          .replace(/\\sigma/g, 'σ')
          .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
          .replace(/\\le/g, '≤')
          .replace(/\\ge/g, '≥')
          .replace(/\\Delta/g, 'Δ')
          .replace(/\\cdot/g, '·')
          .replace(/\\left/g, '')
          .replace(/\\right/g, '')
          .replace(/\\([a-zA-Z]+)/g, '$1')
          .replace(/\\/g, '');

        parts.push(
          <span
            key={key++}
            className={`inline-flex items-center px-1.5 py-0.5 mx-0.5 font-mono text-xs font-semibold rounded-xs shadow-2xs ${
              isDarkBg
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
            }`}
          >
            {cleanMath}
          </span>
        );
        remaining = remaining.slice(mathMatch[0].length);
        continue;
      }

      // 2. Inline Code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={key++}
            className={`px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
              isDarkBg
                ? 'bg-slate-800 border border-slate-700 text-emerald-300'
                : 'bg-slate-100 border border-slate-300 text-slate-900'
            }`}
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // 3. Bold: **text**
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        parts.push(
          <strong
            key={key++}
            className={`font-bold ${isDarkBg ? 'text-emerald-300 font-extrabold' : 'text-slate-950'}`}
          >
            {renderInline(boldMatch[1], isDarkBg)}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // 4. Italic: *text* (when not bold)
      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch) {
        parts.push(
          <em key={key++} className={`italic ${isDarkBg ? 'text-slate-100' : 'text-slate-800'}`}>
            {renderInline(italicMatch[1], isDarkBg)}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // 5. Links: [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkHref = linkMatch[2];
        const isExternal = linkHref.startsWith('http');

        parts.push(
          <a
            key={key++}
            href={linkHref}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className={`inline-flex items-center gap-1 font-bold underline underline-offset-3 transition-colors ${
              isDarkBg
                ? 'text-emerald-300 hover:text-emerald-200'
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            <span>{linkText}</span>
            {isExternal && <ExternalLink className="w-3 h-3 opacity-70" />}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // 6. Normal character chunk until next special delimiter
      const nextSpecial = remaining.search(/[\$`\*\[]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts;
  };

  // 2. PARSE MARKDOWN INTO STRUCTURED AST NODES
  const parseMarkdown = (rawText: string): AstNode[] => {
    const lines = rawText.split('\n');
    const nodes: AstNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip blank lines
      if (!trimmed) {
        i++;
        continue;
      }

      // A. Fenced Code Block: ```
      if (trimmed.startsWith('```')) {
        const lang = trimmed.replace(/^```/, '').trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++; // skip closing ```
        nodes.push({ type: 'code', code: codeLines.join('\n'), language: lang });
        continue;
      }

      // B. Display Math Block: $$
      if (trimmed.startsWith('$$')) {
        if (trimmed.endsWith('$$') && trimmed.length > 2) {
          const formula = trimmed.slice(2, -2).trim();
          nodes.push({ type: 'math', formula });
          i++;
        } else {
          const mathLines: string[] = [];
          i++;
          while (i < lines.length && !lines[i].trim().endsWith('$$')) {
            mathLines.push(lines[i]);
            i++;
          }
          if (i < lines.length) {
            const lastLine = lines[i].trim().replace(/\$\$$/, '');
            if (lastLine) mathLines.push(lastLine);
            i++;
          }
          nodes.push({ type: 'math', formula: mathLines.join(' ') });
        }
        continue;
      }

      // C. Table: lines starting with |
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }
        if (tableLines.length >= 2) {
          const parseRow = (r: string) =>
            r
              .slice(1, -1)
              .split('|')
              .map((c) => c.trim());
          const headers = parseRow(tableLines[0]);
          // Skip separator line (line 1)
          const rows = tableLines.slice(2).map(parseRow);
          nodes.push({ type: 'table', headers, rows });
        }
        continue;
      }

      // D. Headings
      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace('### ', '');
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        nodes.push({ type: 'heading', level: 3, text, id });
        i++;
        continue;
      }
      if (trimmed.startsWith('#### ')) {
        const text = trimmed.replace('#### ', '');
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        nodes.push({ type: 'heading', level: 4, text, id });
        i++;
        continue;
      }
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace('## ', '');
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        nodes.push({ type: 'heading', level: 2, text, id });
        i++;
        continue;
      }

      // E. Horizontal Rule
      if (trimmed === '---' || trimmed === '***') {
        nodes.push({ type: 'hr' });
        i++;
        continue;
      }

      // F. Blockquote: lines starting with >
      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
          i++;
        }
        nodes.push({ type: 'blockquote', lines: quoteLines });
        continue;
      }

      // G. Numbered List: 1. Item
      if (/^\d+\.\s+/.test(trimmed)) {
        const listItems: { num: string; text: string; subItems: string[] }[] = [];
        while (i < lines.length) {
          const currentTrim = lines[i].trim();
          const matchNum = currentTrim.match(/^(\d+)\.\s+(.*)/);
          if (matchNum) {
            listItems.push({
              num: matchNum[1],
              text: matchNum[2],
              subItems: [],
            });
            i++;
          } else if (
            currentTrim.startsWith('* ') ||
            currentTrim.startsWith('- ') ||
            currentTrim.startsWith('• ')
          ) {
            // Sub bullet belonging to the last numbered item
            if (listItems.length > 0) {
              listItems[listItems.length - 1].subItems.push(
                currentTrim.replace(/^[\*\-•]\s+/, '')
              );
            }
            i++;
          } else if (lines[i].startsWith('   ') || lines[i].startsWith('\t')) {
            // Indented line
            const subTrim = currentTrim.replace(/^[\*\-•]\s+/, '');
            if (listItems.length > 0 && subTrim) {
              listItems[listItems.length - 1].subItems.push(subTrim);
            }
            i++;
          } else {
            break;
          }
        }
        nodes.push({ type: 'ordered-list', items: listItems });
        continue;
      }

      // H. Bulleted List: * Item or - Item
      if (
        trimmed.startsWith('* ') ||
        trimmed.startsWith('- ') ||
        trimmed.startsWith('• ')
      ) {
        const bulletItems: { text: string; subItems: string[] }[] = [];
        while (i < lines.length) {
          const currentLine = lines[i];
          const currentTrim = currentLine.trim();

          if (
            currentTrim.startsWith('* ') ||
            currentTrim.startsWith('- ') ||
            currentTrim.startsWith('• ')
          ) {
            if (currentLine.startsWith('   ') || currentLine.startsWith('\t')) {
              // Sub item
              if (bulletItems.length > 0) {
                bulletItems[bulletItems.length - 1].subItems.push(
                  currentTrim.replace(/^[\*\-•]\s+/, '')
                );
              }
            } else {
              bulletItems.push({
                text: currentTrim.replace(/^[\*\-•]\s+/, ''),
                subItems: [],
              });
            }
            i++;
          } else if (
            (currentLine.startsWith('   ') || currentLine.startsWith('\t')) &&
            currentTrim.length > 0
          ) {
            if (bulletItems.length > 0) {
              bulletItems[bulletItems.length - 1].subItems.push(
                currentTrim.replace(/^[\*\-•]\s+/, '')
              );
            }
            i++;
          } else {
            break;
          }
        }
        nodes.push({ type: 'unordered-list', items: bulletItems });
        continue;
      }

      // I. Regular Paragraph
      const pLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim().length > 0 &&
        !lines[i].trim().startsWith('```') &&
        !lines[i].trim().startsWith('$$') &&
        !lines[i].trim().startsWith('|') &&
        !lines[i].trim().startsWith('#') &&
        !lines[i].trim().startsWith('>') &&
        !lines[i].trim().startsWith('---') &&
        !/^\d+\.\s+/.test(lines[i].trim()) &&
        !lines[i].trim().startsWith('* ') &&
        !lines[i].trim().startsWith('- ')
      ) {
        pLines.push(lines[i].trim());
        i++;
      }
      if (pLines.length > 0) {
        nodes.push({ type: 'paragraph', text: pLines.join(' ') });
      }
    }

    return nodes;
  };

  const ast = parseMarkdown(content);

  // 3. RENDER AST NODES
  return (
    <div className="space-y-5 text-slate-800 font-sans leading-relaxed text-sm">
      {ast.map((node, index) => {
        switch (node.type) {
          case 'heading': {
            if (node.level === 2 || node.level === 3) {
              return (
                <div
                  key={index}
                  id={node.id}
                  className="pt-7 pb-2.5 border-b border-slate-200 scroll-mt-24"
                >
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading tracking-tight flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-none shrink-0" />
                    <span>{renderInline(node.text)}</span>
                  </h3>
                </div>
              );
            }
            return (
              <h4
                key={index}
                id={node.id}
                className="text-base sm:text-lg font-bold text-slate-900 font-heading pt-4 text-emerald-950 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-slate-900 rotate-45 shrink-0" />
                <span>{renderInline(node.text)}</span>
              </h4>
            );
          }

          case 'paragraph': {
            return (
              <p
                key={index}
                className="text-sm text-slate-700 leading-relaxed font-sans"
              >
                {renderInline(node.text)}
              </p>
            );
          }

          case 'ordered-list': {
            return (
              <ol key={index} className="list-none space-y-3.5 my-4 pl-1">
                {node.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="space-y-2 list-none">
                    <div className="flex items-start gap-3 text-sm text-slate-800">
                      <span className="w-6 h-6 bg-slate-900 text-white text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {item.num}
                      </span>
                      <div className="leading-relaxed pt-0.5">
                        {renderInline(item.text)}
                      </div>
                    </div>

                    {/* Nested Sub-Bullets */}
                    {item.subItems.length > 0 && (
                      <ul className="list-none ml-9 space-y-1.5 border-l-2 border-slate-200 pl-3">
                        {item.subItems.map((sub, subIdx) => (
                          <li
                            key={subIdx}
                            className="list-none flex items-start gap-2 text-xs sm:text-sm text-slate-600"
                          >
                            <span className="w-1.5 h-1.5 bg-emerald-600 shrink-0 mt-1.5 rotate-45" />
                            <span className="leading-relaxed">
                              {renderInline(sub)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            );
          }

          case 'unordered-list': {
            return (
              <ul key={index} className="list-none space-y-2.5 my-4 pl-1">
                {node.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="list-none space-y-1.5">
                    <div className="flex items-start gap-2.5 text-sm text-slate-800">
                      <span className="w-1.5 h-1.5 bg-emerald-600 shrink-0 mt-2 rotate-45" />
                      <div className="leading-relaxed">
                        {renderInline(item.text)}
                      </div>
                    </div>

                    {/* Nested Sub-Bullets */}
                    {item.subItems.length > 0 && (
                      <ul className="list-none ml-6 space-y-1.5 border-l-2 border-slate-200 pl-3 mt-1">
                        {item.subItems.map((sub, subIdx) => (
                          <li
                            key={subIdx}
                            className="list-none flex items-start gap-2 text-xs sm:text-sm text-slate-600"
                          >
                            <span className="w-1 h-1 bg-slate-400 shrink-0 mt-2" />
                            <span className="leading-relaxed">
                              {renderInline(sub)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            );
          }

          case 'blockquote': {
            return (
              <div
                key={index}
                className="p-5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white border border-slate-800 border-l-4 border-l-emerald-400 shadow-md my-6 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400"></span>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                    Executive Takeaway &amp; Operational Rule
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-100 font-mono leading-relaxed space-y-1">
                  {node.lines.map((l, lIdx) => (
                    <p key={lIdx}>{renderInline(l, true)}</p>
                  ))}
                </div>
              </div>
            );
          }

          case 'table': {
            return (
              <div
                key={index}
                className="my-6 overflow-hidden border border-slate-300 shadow-xs"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-900 text-white border-b border-slate-800">
                        {node.headers.map((th, i) => (
                          <th
                            key={i}
                            className="py-3 px-4 font-bold text-[11px] uppercase tracking-wider text-slate-100"
                          >
                            {renderInline(th, true)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {node.rows.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className={`transition-colors hover:bg-emerald-50/50 ${
                            rowIdx % 2 === 1 ? 'bg-slate-50/80' : 'bg-white'
                          }`}
                        >
                          {row.map((td, cellIdx) => (
                            <td
                              key={cellIdx}
                              className={`py-2.5 px-4 text-slate-700 leading-normal ${
                                cellIdx === 0 ? 'font-bold text-slate-900' : ''
                              }`}
                            >
                              {renderInline(td)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          case 'math': {
            const cleaned = node.formula
              .replace(/\\text\{([^}]+)\}/g, '$1')
              .replace(/\\times/g, ' × ')
              .replace(/\\approx/g, ' ≈ ')
              .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1) ÷ ($2)')
              .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
              .replace(/\\sigma_\{([^}]+)\}/g, 'σ_$1')
              .replace(/\\sigma/g, 'σ')
              .replace(/\\sum/g, 'Σ')
              .replace(/\\Delta/g, 'Δ')
              .replace(/\\cdot/g, ' · ')
              .replace(/\\left/g, '')
              .replace(/\\right/g, '')
              .replace(/\\([a-zA-Z]+)/g, '$1')
              .replace(/\\/g, '')
              .trim();

            return (
              <div
                key={index}
                className="my-5 p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-slate-50 to-emerald-50/40 border border-emerald-300 border-l-4 border-l-emerald-600 shadow-2xs"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 font-mono bg-emerald-100 px-2 py-0.5 border border-emerald-300">
                    Formula Definition
                  </span>
                </div>
                <div className="text-sm sm:text-base font-bold font-mono text-slate-950 tracking-tight py-1 overflow-x-auto">
                  {cleaned}
                </div>
              </div>
            );
          }

          case 'code': {
            return (
              <div
                key={index}
                className="my-6 bg-slate-950 border border-slate-800 shadow-md"
              >
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest ml-2">
                      System Architecture &amp; Execution Diagram
                    </span>
                  </div>
                </div>
                <pre className="p-4 overflow-x-auto font-mono text-xs text-emerald-400 leading-relaxed">
                  <code>{node.code}</code>
                </pre>
              </div>
            );
          }

          case 'hr': {
            return <hr key={index} className="border-slate-200 my-6" />;
          }

          default:
            return null;
        }
      })}
    </div>
  );
};

