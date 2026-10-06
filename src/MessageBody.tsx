import { useState, type ReactNode } from 'react'

interface Part {
  kind: 'text' | 'code'
  value: string
  lang?: string
}

function split(content: string): Part[] {
  const parts: Part[] = []
  const pattern = /```(\w*)\n([\s\S]*?)```/g
  let last = 0
  for (const match of content.matchAll(pattern)) {
    const start = match.index ?? 0
    if (start > last) parts.push({ kind: 'text', value: content.slice(last, start) })
    parts.push({ kind: 'code', lang: match[1] || 'text', value: match[2].replace(/\n$/, '') })
    last = start + match[0].length
  }
  if (last < content.length) parts.push({ kind: 'text', value: content.slice(last) })
  return parts
}

function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((chunk, i) => {
    if (chunk.startsWith('`') && chunk.endsWith('`') && chunk.length > 1) {
      return <code key={i}>{chunk.slice(1, -1)}</code>
    }
    if (chunk.startsWith('**') && chunk.endsWith('**') && chunk.length > 3) {
      return <strong key={i}>{chunk.slice(2, -2)}</strong>
    }
    return chunk
  })
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="code">
      <div className="code-head">
        <span>{lang}</span>
        <button type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function MessageBody({ content }: { content: string }) {
  return (
    <>
      {split(content).map((part, i) =>
        part.kind === 'code' ? (
          <CodeBlock key={i} code={part.value} lang={part.lang ?? 'text'} />
        ) : (
          part.value
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p, j) => <p key={`${i}-${j}`}>{inline(p)}</p>)
        ),
      )}
    </>
  )
}
