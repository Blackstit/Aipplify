"use client"

import React from "react"

interface Props {
  content: string
}

export function ArticleContent({ content }: Props) {
  const blocks = content.split("\n\n")
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < blocks.length) {
    const block = blocks[i]

    if (block.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="text-xl font-bold text-gray-900 mt-8 mb-3"
        >
          {renderInline(block.slice(4))}
        </h3>,
      )
    } else if (block.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="text-2xl font-bold text-gray-900 mt-10 mb-4"
        >
          {renderInline(block.slice(3))}
        </h2>,
      )
    } else if (block.startsWith("> ")) {
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-primary/40 bg-primary/5 rounded-r-lg pl-5 pr-4 py-4 my-6 italic text-gray-700 text-sm leading-relaxed"
        >
          {renderInline(block.replace(/^> /gm, ""))}
        </blockquote>,
      )
    } else if (block.startsWith("| ") && block.includes("|")) {
      const tableBlocks = [block]
      while (
        i + 1 < blocks.length &&
        blocks[i + 1].startsWith("| ")
      ) {
        i++
        tableBlocks.push(blocks[i])
      }
      const fullTable = tableBlocks.join("\n\n")
      elements.push(
        <div key={i} className="my-6 overflow-x-auto">
          {renderTable(fullTable)}
        </div>,
      )
    } else if (
      block.startsWith("- ") ||
      block.startsWith("* ")
    ) {
      const items = block
        .split("\n")
        .filter((l) => l.startsWith("- ") || l.startsWith("* "))
      elements.push(
        <ul
          key={i}
          className="list-disc list-inside space-y-1.5 my-4 text-gray-700 text-[15px] leading-relaxed"
        >
          {items.map((item, j) => (
            <li key={j}>{renderInline(item.replace(/^[-*] /, ""))}</li>
          ))}
        </ul>,
      )
    } else if (/^\d+\.\s/.test(block)) {
      const items = block.split("\n").filter((l) => /^\d+\.\s/.test(l))
      elements.push(
        <ol
          key={i}
          className="list-decimal list-inside space-y-1.5 my-4 text-gray-700 text-[15px] leading-relaxed"
        >
          {items.map((item, j) => (
            <li key={j}>
              {renderInline(item.replace(/^\d+\.\s/, ""))}
            </li>
          ))}
        </ol>,
      )
    } else if (block.startsWith("**Q:") || block.startsWith("**Q ")) {
      elements.push(
        <div
          key={i}
          className="bg-gray-50 rounded-xl p-4 my-3 text-sm leading-relaxed"
        >
          {renderInline(block)}
        </div>,
      )
    } else if (block.trim()) {
      elements.push(
        <p
          key={i}
          className="text-gray-700 text-[15px] leading-relaxed mb-4"
        >
          {renderInline(block)}
        </p>,
      )
    }
    i++
  }

  return <div className="prose-custom">{elements}</div>
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*.*?\*\*)|(`[^`]+`)|(\[.*?\]\(.*?\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const m = match[0]
    if (m.startsWith("**") && m.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-gray-900">
          {m.slice(2, -2)}
        </strong>,
      )
    } else if (m.startsWith("`") && m.endsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="bg-gray-100 text-[13px] px-1.5 py-0.5 rounded font-mono text-gray-800"
        >
          {m.slice(1, -1)}
        </code>,
      )
    } else if (m.startsWith("[")) {
      const linkMatch = m.match(/\[(.*?)\]\((.*?)\)/)
      if (linkMatch) {
        parts.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            className="text-primary hover:underline"
          >
            {linkMatch[1]}
          </a>,
        )
      }
    }
    lastIndex = match.index + m.length
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return parts.length === 1 ? parts[0] : <>{parts}</>
}

function renderTable(text: string): React.ReactNode {
  const lines = text.split("\n").filter((l) => l.trim().startsWith("|"))
  if (lines.length < 2) return null

  const parseRow = (line: string) =>
    line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim())

  const headers = parseRow(lines[0])
  const separatorIdx = lines.findIndex((l) => /^\|[\s:|-]+\|$/.test(l.trim()))
  const bodyStart = separatorIdx >= 0 ? separatorIdx + 1 : 1
  const dataRows = lines.slice(bodyStart).map(parseRow)

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              className="text-left px-3 py-2.5 bg-gray-50 border border-gray-200 font-semibold text-gray-900 text-xs uppercase tracking-wider"
            >
              {renderInline(h)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dataRows.map((row, ri) => (
          <tr key={ri} className={ri % 2 === 1 ? "bg-gray-50/50" : ""}>
            {row.map((cell, ci) => (
              <td
                key={ci}
                className="px-3 py-2 border border-gray-200 text-gray-700"
              >
                {renderInline(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
