import React from 'react';

interface BlogContentRendererProps {
  content: string;
}

type SubItem = {
  text: string;
};

type ListItem = {
  text: string;
  num?: string;
  subItems?: SubItem[];
};

type BlockNode =
  | { type: 'h3'; text: string; id: string }
  | { type: 'h4'; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'hr' }
  | { type: 'code'; code: string }
  | { type: 'table'; lines: string[] }
  | { type: 'formula'; math: string }
  | { type: 'list'; ordered: boolean; items: ListItem[] }
  | { type: 'paragraph'; text: string };

export const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({ content }) => {
  // 1. Line-by-line Parser
  const parseBlocks = (rawText: string): BlockNode[] => {
    const lines = rawText.replace(/\r\n/g, '\n').split('\n');
    const result: BlockNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Empty line -> skip
      if (!trimmed) {
        i++;
        continue;
      }

      // Fenced code block: ```
      if (trimmed.startsWith('```')) {
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++; // consume closing ```
        result.push({ type: 'code', code: codeLines.join('\n') });
        continue;
      }

      // Display Math Block: $$
      if (trimmed.startsWith('$$')) {
        if (trimmed.endsWith('$$') && trimmed.length > 2) {
          result.push({ type: 'formula', math: trimmed.slice(2, -2).trim() });
          i++;
        } else {
          const mathLines: string[] = [trimmed.slice(2)];
          i++;
          while (i < lines.length && !lines[i].trim().endsWith('$$')) {
            mathLines.push(lines[i]);
            i++;
          }
          if (i < lines.length) {
            const endLine = lines[i].trim();
            mathLines.push(endLine.slice(0, -2));
            i++;
          }
          result.push({ type: 'formula', math: mathLines.join(' ').trim() });
        }
        continue;
      }

      // Markdown Table: lines starting with |
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }
        if (tableLines.length >= 2) {
          result.push({ type: 'table', lines: tableLines });
          continue;
        }
      }

      // Heading 3: ### Title
      if (trimmed.startsWith('### ')) {
        const title = trimmed.replace(/^###\s+/, '').trim();
        const slugId = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        result.push({ type: 'h3', text: title, id: slugId });
        i++;
        continue;
      }

      // Heading 4: #### Subtitle
      if (trimmed.startsWith('#### ')) {
        const title = trimmed.replace(/^####\s+/, '').trim();
        result.push({ type: 'h4', text: title });
        i++;
        continue;
      }

      // Blockquote: > Text
      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('>') || (lines[i].trim() && quoteLines.length > 0 && !lines[i].trim().match(/^(\#\#\#|\#\#\#\#|\-|\*|\d+\.|\||```)/)))) {
          quoteLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        result.push({ type: 'blockquote', text: quoteLines.join(' ').trim() });
        continue;
      }

      // Divider: --- or ***
      if (trimmed === '---' || trimmed === '***') {
        result.push({ type: 'hr' });
        i++;
        continue;
      }

      // Lists: Ordered (1.) or Unordered (* or -)
      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      const unorderedMatch = trimmed.match(/^[\*\-]\s+(.*)/);

      if (orderedMatch || unorderedMatch) {
        const isOrdered = !!orderedMatch;
        const items: ListItem[] = [];

        while (i < lines.length) {
          const curLine = lines[i];
          const curTrimmed = curLine.trim();

          if (!curTrimmed) {
            // Check if next non-empty line continues list
            if (i + 1 < lines.length && (lines[i + 1].trim().match(/^(\d+\.|[\*\-])\s+/) || lines[i + 1].startsWith('   ') || lines[i + 1].startsWith('\t'))) {
              i++;
              continue;
            }
            break;
          }

          // Check if top-level ordered item
          const oMatch = curTrimmed.match(/^(\d+)\.\s+(.*)/);
          // Check if top-level unordered item
          const uMatch = curTrimmed.match(/^[\*\-]\s+(.*)/);
          // Check if indented sub-item
          const isIndented = curLine.startsWith('   ') || curLine.startsWith('  ') || curLine.startsWith('\t');
          const subMatch = curTrimmed.match(/^[\*\-]\s+(.*)/);

          if (isIndented && subMatch && items.length > 0) {
            if (!items[items.length - 1].subItems) {
              items[items.length - 1].subItems = [];
            }
            items[items.length - 1].subItems!.push({ text: subMatch[1] });
            i++;
          } else if (isOrdered && oMatch) {
            items.push({ text: oMatch[2], num: oMatch[1] });
            i++;
          } else if (!isOrdered && uMatch) {
            items.push({ text: uMatch[1] });
            i++;
          } else if (isOrdered && uMatch && items.length > 0) {
            // Unordered item inside ordered list context (sub-item)
            if (!items[items.length - 1].subItems) {
              items[items.length - 1].subItems = [];
            }
            items[items.length - 1].subItems!.push({ text: uMatch[1] });
            i++;
          } else {
            // End of this list block
            break;
          }
        }

        if (items.length > 0) {
          result.push({ type: 'list', ordered: isOrdered, items });
          continue;
        }
      }

      // Default Paragraph: accumulate regular text lines until empty line or special token
      const pLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !lines[i].trim().startsWith('### ') &&
        !lines[i].trim().startsWith('#### ') &&
        !lines[i].trim().startsWith('```') &&
        !lines[i].trim().startsWith('$$') &&
        !lines[i].trim().startsWith('>') &&
        !lines[i].trim().startsWith('|') &&
        lines[i].trim() !== '---' &&
        !lines[i].trim().match(/^(\d+\.|[\*\-])\s+/)
      ) {
        pLines.push(lines[i].trim());
        i++;
      }

      if (pLines.length > 0) {
        result.push({ type: 'paragraph', text: pLines.join(' ') });
      }
    }

    return result;
  };

  // 2. Inline Formatter (Bold, Italic, Math, Code, Links)
  const renderInline = (text: string, isDarkBg = false): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // 1. Math Formula: $formula$
      // Match $...$ only if it contains math syntax (backslash, operator, etc.) or doesn't look like currency ($100)
      const mathMatch = remaining.match(/^(\$)([^\$\n]+?)(\$)/);
      if (mathMatch && (mathMatch[2].includes('\\') || mathMatch[2].includes('×') || mathMatch[2].includes('=') || mathMatch[2].includes('√') || mathMatch[2].length > 3 || isNaN(Number(mathMatch[2].trim())))) {
        let cleanMath = mathMatch[2]
          .replace(/\\text\{([^}]+)\}/g, '$1')
          .replace(/\\times/g, '×')
          .replace(/\\approx/g, '≈')
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 ÷ $2)')
          .replace(/\\sum/g, 'Σ')
          .replace(/\\sigma/g, 'σ')
          .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
          .replace(/\\le/g, '≤')
          .replace(/\\ge/g, '≥')
          .replace(/\\Delta/g, 'Δ')
          .replace(/\\cdot/g, '·')
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

      // 2. Inline code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={key++}
            className={`px-1.5 py-0.5 font-mono text-[11px] font-semibold rounded-xs ${
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
            className={`font-bold ${isDarkBg ? '!text-emerald-300 text-emerald-300 font-extrabold' : 'text-slate-950'}`}
          >
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // 4. Italic: *text* or _text_
      const italicMatch = remaining.match(/^\*([^*]+)\*/) || remaining.match(/^_([^_]+)_/);
      if (italicMatch) {
        parts.push(
          <em key={key++} className={`italic ${isDarkBg ? 'text-slate-100' : 'text-slate-800'}`}>
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // 5. Link: [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkUrl = linkMatch[2];
        const isExternal = linkUrl.startsWith('http');

        parts.push(
          <a
            key={key++}
            href={linkUrl}
            className={`font-bold underline underline-offset-2 transition-colors ${
              isDarkBg
                ? 'text-emerald-400 hover:text-emerald-300'
                : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 px-0.5 rounded-xs'
            }`}
            target={isExternal ? '_blank' : '_self'}
            rel={isExternal ? 'noopener noreferrer' : undefined}
          >
            {linkText}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // Normal character chunk until next special char
      const nextSpecial = remaining.search(/[\$`\*_\[]/);
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

  // 3. Block Renderers
  const renderTable = (lines: string[], key: number) => {
    if (lines.length < 2) return null;

    const parseRow = (line: string) => {
      return line
        .slice(1, -1)
        .split('|')
        .map((cell) => cell.trim());
    };

    const headerCells = parseRow(lines[0]);
    const bodyLines = lines.slice(2); // skip header & separator

    return (
      <div key={key} className="my-6 overflow-hidden border border-slate-300 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-800">
                {headerCells.map((th, i) => (
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
              {bodyLines.map((row, rowIdx) => {
                const cells = parseRow(row);
                return (
                  <tr
                    key={rowIdx}
                    className={`transition-colors hover:bg-emerald-50/50 ${
                      rowIdx % 2 === 1 ? 'bg-slate-50/80' : 'bg-white'
                    }`}
                  >
                    {cells.map((td, cellIdx) => (
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderFormulaCard = (mathContent: string, key: number) => {
    const cleaned = mathContent
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
        key={key}
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
  };

  const renderCodeBlock = (codeText: string, key: number) => {
    return (
      <div key={key} className="my-6 bg-slate-950 border border-slate-800 shadow-md">
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest ml-2">
              Architecture &amp; Data Pipeline
            </span>
          </div>
        </div>
        <pre className="p-4 overflow-x-auto font-mono text-xs text-emerald-400 leading-relaxed">
          <code>{codeText}</code>
        </pre>
      </div>
    );
  };

  const blocks = parseBlocks(content);

  return (
    <div className="space-y-4 text-slate-800 font-sans leading-relaxed text-sm">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h3':
            return (
              <div key={idx} id={block.id} className="pt-7 pb-2 border-b border-slate-200 scroll-mt-24">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-none shrink-0" />
                  <span>{block.text}</span>
                </h3>
              </div>
            );

          case 'h4':
            return (
              <h4
                key={idx}
                className="text-sm sm:text-base font-bold text-slate-900 font-heading pt-4 text-emerald-950 flex items-center gap-1.5"
              >
                <span>{renderInline(block.text)}</span>
              </h4>
            );

          case 'blockquote':
            return (
              <div
                key={idx}
                className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white border border-slate-800 border-l-4 border-l-emerald-400 shadow-md my-5 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400"></span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                    Executive Takeaway &amp; Operational Rule
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-100 font-mono leading-relaxed">
                  {renderInline(block.text, true)}
                </div>
              </div>
            );

          case 'hr':
            return <hr key={idx} className="border-slate-200 my-6" />;

          case 'table':
            return renderTable(block.lines, idx);

          case 'formula':
            return renderFormulaCard(block.math, idx);

          case 'code':
            return renderCodeBlock(block.code, idx);

          case 'list':
            if (block.ordered) {
              return (
                <ol key={idx} className="space-y-3 my-4 pl-1">
                  {block.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="space-y-2">
                      <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                        <span className="w-5 h-5 bg-slate-900 text-white text-[10px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          {item.num || itemIdx + 1}
                        </span>
                        <span className="leading-relaxed pt-0.5">{renderInline(item.text)}</span>
                      </div>
                      {item.subItems && item.subItems.length > 0 && (
                        <ul className="pl-8 space-y-1.5 pt-1">
                          {item.subItems.map((sub, subIdx) => (
                            <li key={subIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                              <span className="w-1.5 h-1.5 bg-emerald-600 shrink-0 mt-2 rotate-45" />
                              <span className="leading-relaxed">{renderInline(sub.text)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              );
            } else {
              return (
                <ul key={idx} className="space-y-2.5 my-3 pl-1">
                  {block.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="space-y-1.5">
                      <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                        <span className="w-1.5 h-1.5 bg-emerald-600 shrink-0 mt-2 rotate-45" />
                        <span className="leading-relaxed">{renderInline(item.text)}</span>
                      </div>
                      {item.subItems && item.subItems.length > 0 && (
                        <ul className="pl-6 space-y-1 pt-1">
                          {item.subItems.map((sub, subIdx) => (
                            <li key={subIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                              <span className="w-1 h-1 bg-slate-400 shrink-0 mt-2 rounded-full" />
                              <span className="leading-relaxed">{renderInline(sub.text)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              );
            }

          case 'paragraph':
            return (
              <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                {renderInline(block.text)}
              </p>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

