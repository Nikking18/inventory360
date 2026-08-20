import React from 'react';

interface BlogContentRendererProps {
  content: string;
}

export const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({ content }) => {
  // Parse markdown into structured blocks
  const rawBlocks = content.split(/\n\n+/);
  const blocks: string[] = [];

  // Group fenced code blocks and tables if they span multiple newlines
  let inCode = false;
  let codeBuffer: string[] = [];

  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (trimmed.startsWith('```') && !inCode) {
      if (trimmed.endsWith('```') && trimmed.length > 3 && trimmed.slice(3).includes('```')) {
        blocks.push(block);
      } else {
        inCode = true;
        codeBuffer.push(block);
      }
    } else if (inCode) {
      codeBuffer.push(block);
      if (trimmed.endsWith('```')) {
        inCode = false;
        blocks.push(codeBuffer.join('\n\n'));
        codeBuffer = [];
      }
    } else {
      blocks.push(block);
    }
  }
  if (codeBuffer.length > 0) {
    blocks.push(codeBuffer.join('\n\n'));
  }

  const renderInline = (text: string, isDarkBg = false): React.ReactNode => {
    // Process bold, italic, code, links, inline math
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    // Helper regex for inline tokens
    while (remaining.length > 0) {
      // Inline math: $formula$
      const mathMatch = remaining.match(/^(\$)(.+?)(\$)/);
      if (mathMatch) {
        let cleanMath = mathMatch[2]
          .replace(/\\text\{([^}]+)\}/g, '$1')
          .replace(/\\times/g, '×')
          .replace(/\\approx/g, '≈')
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
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

      // Inline code: `code`
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

      // Bold: **text**
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        parts.push(
          <strong
            key={key++}
            className={`font-bold ${isDarkBg ? 'text-emerald-300 font-extrabold' : 'text-slate-950'}`}
          >
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic: *text* or _text_
      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch) {
        parts.push(
          <em key={key++} className={`italic ${isDarkBg ? 'text-slate-100' : 'text-slate-800'}`}>
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Link: [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            className={`font-bold hover:underline underline-offset-2 ${
              isDarkBg ? 'text-emerald-400' : 'text-emerald-700'
            }`}
            target={linkMatch[2].startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // Normal character chunk until next special char
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

  const renderTable = (block: string, key: number) => {
    const lines = block
      .trim()
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('|') && l.endsWith('|'));

    if (lines.length < 2) return null;

    const parseRow = (line: string) => {
      return line
        .slice(1, -1)
        .split('|')
        .map((cell) => cell.trim());
    };

    const headerCells = parseRow(lines[0]);
    const bodyLines = lines.slice(2); // skip header and separator

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
    // Clean LaTeX syntax into highly legible formula typography
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

  const renderCodeBlock = (block: string, key: number) => {
    const lines = block.trim().split('\n');
    const contentLines = lines.slice(1, lines[lines.length - 1].startsWith('```') ? -1 : undefined);
    const codeText = contentLines.join('\n');

    return (
      <div key={key} className="my-6 bg-slate-950 border border-slate-800 shadow-md">
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
          <code>{codeText}</code>
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-4 text-slate-800 font-sans leading-relaxed text-sm">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();

        // 1. Table
        if (trimmed.startsWith('|') && trimmed.includes('\n|')) {
          return renderTable(trimmed, idx);
        }

        // 2. Fenced Code / Diagram Block
        if (trimmed.startsWith('```')) {
          return renderCodeBlock(trimmed, idx);
        }

        // 3. Display Math Block: $$ formula $$
        if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
          const math = trimmed.slice(2, -2).trim();
          return renderFormulaCard(math, idx);
        }

        // 4. Heading 3: ### Title
        if (trimmed.startsWith('### ')) {
          const title = trimmed.replace('### ', '');
          const slugId = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');

          return (
            <div key={idx} id={slugId} className="pt-6 pb-2 border-b border-slate-200 scroll-mt-24">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-none shrink-0" />
                <span>{title}</span>
              </h3>
            </div>
          );
        }

        // 5. Heading 4: #### Subtitle
        if (trimmed.startsWith('#### ')) {
          const title = trimmed.replace('#### ', '');
          return (
            <h4
              key={idx}
              className="text-sm sm:text-base font-bold text-slate-900 font-heading pt-3 text-emerald-950"
            >
              {title}
            </h4>
          );
        }

        // 6. Blockquote: > text
        if (trimmed.startsWith('> ')) {
          const quoteText = trimmed.replace(/^>\s*/gm, '');
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
                {renderInline(quoteText, true)}
              </div>
            </div>
          );
        }

        // 7. Divider: ---
        if (trimmed === '---') {
          return <hr key={idx} className="border-slate-200 my-6" />;
        }

        // 8. Bullet List: * or -
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const items = trimmed.split('\n').filter((l) => l.trim().length > 0);
          return (
            <ul key={idx} className="space-y-2 my-3 pl-1">
              {items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 bg-emerald-600 shrink-0 mt-2 rotate-45" />
                  <span className="leading-relaxed">{renderInline(item.replace(/^[\*\-]\s+/, ''))}</span>
                </li>
              ))}
            </ul>
          );
        }

        // 9. Numbered List: 1. or 2.
        if (/^\d+\.\s+/.test(trimmed)) {
          const items = trimmed.split('\n').filter((l) => l.trim().length > 0);
          return (
            <ol key={idx} className="space-y-2.5 my-3 pl-1">
              {items.map((item, itemIdx) => {
                const match = item.match(/^(\d+)\.\s+(.*)/);
                const num = match ? match[1] : itemIdx + 1;
                const text = match ? match[2] : item;
                return (
                  <li key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <span className="w-5 h-5 bg-slate-900 text-white text-[10px] font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                      {num}
                    </span>
                    <span className="leading-relaxed pt-0.5">{renderInline(text)}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // 10. Default Paragraph
        return (
          <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
            {renderInline(block)}
          </p>
        );
      })}
    </div>
  );
};
