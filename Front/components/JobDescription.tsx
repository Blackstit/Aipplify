"use client"

import { useMemo } from "react"

interface JobDescriptionProps {
  description: string
}

// Helper to strip HTML tags (already done in parser, but keep for safety)
function stripHtml(html: string): string {
  if (!html) return ""
  
  // Remove images
  html = html.replace(/<img[^>]*>/gi, "")
  
  // Remove tags section
  html = html.replace(/<p>\s*Tags:\s*<a[^>]*>[^<]*<\/a>\s*(•\s*<a[^>]*>[^<]*<\/a>\s*)*<\/p>/i, "")
  
  // Convert lists to plain text
  html = html.replace(/<ul[^>]*>/gi, "\n")
  html = html.replace(/<\/ul>/gi, "\n")
  html = html.replace(/<li[^>]*>/gi, "• ")
  html = html.replace(/<\/li>/gi, "\n")
  
  // Convert headings
  html = html.replace(/<h[1-6][^>]*>/gi, "\n\n")
  html = html.replace(/<\/h[1-6]>/gi, "\n\n")
  
  // Convert paragraphs
  html = html.replace(/<p[^>]*>/gi, "\n")
  html = html.replace(/<\/p>/gi, "\n")
  
  // Remove all HTML tags
  html = html.replace(/<[^>]*>/g, "")
  
  // Decode entities
  html = html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim()
  
  return html
}

export function JobDescription({ description }: JobDescriptionProps) {
  const formattedDescription = useMemo(() => {
    if (!description) return { sections: [], hasSections: false }

    // Strip HTML if present
    let text = stripHtml(description)

    // Remove tags section if it exists at the beginning (multiple patterns)
    text = text.replace(/^Tags:\s*([^•\n]*\s*•\s*)*[^•\n]*\s*/i, "")
    text = text.replace(/^Tags:\s*([^\n]*\n?)*?(?=\n\n|\n[A-Z])/i, "")
    
    // Remove "Apply here 👉" links at the end
    text = text.replace(/Apply here\s*👉.*$/i, "").trim()
    
    // Remove privacy policy and footer text
    text = text.replace(/To see our Privacy Policy.*$/i, "").trim()
    text = text.replace(/These are the applicable requisites.*$/i, "").trim()
    text = text.replace(/Privacy Policy.*$/i, "").trim()

    // Clean up excessive whitespace but preserve intentional line breaks
    text = text.replace(/\n{3,}/g, "\n\n")
    text = text.replace(/[ \t]+/g, " ")

    // Split by common patterns that indicate sections
    const sections: { title?: string; content: string }[] = []
    
    // Common section headers (more comprehensive list)
    const sectionPatterns = [
      /^(Responsibilities?|What You'll Do|Key Responsibilities?|Duties|Your Role|What You Will Do)/i,
      /^(Requirements?|Qualifications?|What We're Looking For|Must Have|Required|What We Need)/i,
      /^(Nice to Have|Preferred Qualifications?|Bonus Points?|Additional|Pluses?|Nice to Have)/i,
      /^(About|Overview|Description|Summary|Introduction)/i,
      /^(Benefits?|Perks|Compensation|Salary|What We Offer)/i,
      /^(The Impact|Impact|What You'll Achieve)/i,
      /^(Your Team|Team|Who You'll Work With)/i,
      /^(Location|Where|Remote|Office)/i,
    ]

    // Try to split by section headers first
    const sectionMatches: Array<{ index: number; title: string }> = []
    
    // Find all potential section headers
    const lines = text.split(/\n/)
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (trimmed.length < 100 && trimmed.length > 3) {
        for (const pattern of sectionPatterns) {
          if (pattern.test(trimmed)) {
            sectionMatches.push({ index, title: trimmed })
            break
          }
        }
      }
    })

    // If we found sections, split by them
    if (sectionMatches.length > 0) {
      for (let i = 0; i < sectionMatches.length; i++) {
        const startIndex = sectionMatches[i].index
        const endIndex = i < sectionMatches.length - 1 
          ? sectionMatches[i + 1].index 
          : lines.length
        
        const sectionLines = lines.slice(startIndex + 1, endIndex)
        const content = sectionLines.join("\n").trim()
        
        if (content) {
          sections.push({
            title: sectionMatches[i].title,
            content,
          })
        }
      }
    }

    // If no sections found, try to intelligently split the text
    if (sections.length === 0) {
      // Split by double newlines or periods followed by capital letters
      const paragraphs = text.split(/\n\n+|(?<=\.)\s+(?=[A-Z])/).filter(p => p.trim())
      
      if (paragraphs.length > 1) {
        sections.push({ content: paragraphs.join("\n\n") })
      } else {
        sections.push({ content: text })
      }
    }

    return { sections, hasSections: sections.length > 1 || sections.some(s => s.title) }
  }, [description])

  if (!description) {
    return <p className="text-gray-500">No description available</p>
  }

  const { sections, hasSections } = formattedDescription

  // Format a single section's content
  const formatSectionContent = (content: string) => {
    const lines = content.split("\n").filter(line => line.trim())
    const formatted: JSX.Element[] = []
    let currentParagraph: string[] = []
    let listItems: string[] = []

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(" ").trim()
        if (paragraphText) {
          formatted.push(
            <p key={`p-${formatted.length}`} className="text-gray-700 leading-relaxed mb-3">
              {paragraphText}
            </p>
          )
        }
        currentParagraph = []
      }
    }

    const flushList = () => {
      if (listItems.length > 0) {
        formatted.push(
          <ul key={`ul-${formatted.length}`} className="space-y-2 mb-4 ml-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1 flex-shrink-0">•</span>
                <span className="text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        )
        listItems = []
      }
    }

    for (const line of lines) {
      const trimmed = line.trim()
      
      // Check if it's a list item
      const listMatch = trimmed.match(/^[•\-\*]\s+(.+)$/) || trimmed.match(/^\d+[\.\)]\s+(.+)$/)
      if (listMatch) {
        flushParagraph()
        listItems.push(listMatch[1])
      } else if (trimmed.length > 0) {
        flushList()
        // Check if line ends with period or is short (likely a header)
        if (trimmed.endsWith(":") || (trimmed.length < 80 && !trimmed.includes("."))) {
          flushParagraph()
          formatted.push(
            <h4 key={`h4-${formatted.length}`} className="font-semibold text-gray-900 mt-4 mb-2">
              {trimmed}
            </h4>
          )
        } else {
          currentParagraph.push(trimmed)
        }
      }
    }

    flushParagraph()
    flushList()

    return formatted.length > 0 ? formatted : (
      <p className="text-gray-700 leading-relaxed">{content}</p>
    )
  }

  if (!hasSections || sections.length === 0) {
    // Single section - format as paragraphs
    const content = sections[0]?.content || description
    const paragraphs = content
      .split(/\n\n+/)
      .filter(p => p.trim())
      .map(p => p.trim())

    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => {
          const formatted = formatSectionContent(paragraph)
          return <div key={index}>{formatted}</div>
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-3">
          {section.title && (
            <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mt-6 first:mt-0">
              {section.title}
            </h3>
          )}
          <div className="space-y-2">
            {formatSectionContent(section.content)}
          </div>
        </div>
      ))}
    </div>
  )
}
