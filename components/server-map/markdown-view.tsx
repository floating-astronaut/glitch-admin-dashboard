/**
 * MarkdownView — render GFM markdown for the Server Map.
 *
 * Wraps react-markdown + remark-gfm with kit-friendly styling.
 * GFM tables get an overflow-x-auto wrapper around the kit's Table
 * primitive so wide system-map tables (e.g. SERVER_REPO_MAP.md) stay
 * scrollable on narrow viewports.
 *
 * Content is trusted (operator-authored docs in glitch-trade-app),
 * so no rehype-sanitize.
 */
'use client'

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

const components: Components = {
  h1: ({ node, ...p }) => <h1 className="text-foreground mt-2 mb-3 text-xl font-semibold" {...p} />,
  h2: ({ node, ...p }) => <h2 className="text-foreground border-border mt-6 mb-2 border-b pb-1 text-base font-semibold" {...p} />,
  h3: ({ node, ...p }) => <h3 className="text-foreground mt-4 mb-2 text-sm font-semibold" {...p} />,
  h4: ({ node, ...p }) => <h4 className="text-foreground/90 mt-3 mb-1 text-xs font-semibold tracking-wide uppercase" {...p} />,
  p:  ({ node, ...p }) => <p className="text-foreground/90 my-2 text-sm leading-relaxed" {...p} />,
  ul: ({ node, ...p }) => <ul className="text-foreground/90 my-2 list-disc space-y-1 pl-5 text-sm" {...p} />,
  ol: ({ node, ...p }) => <ol className="text-foreground/90 my-2 list-decimal space-y-1 pl-5 text-sm" {...p} />,
  li: ({ node, ...p }) => <li className="text-foreground/90 text-sm leading-relaxed" {...p} />,
  a:  ({ node, ...p }) => <a className="text-primary hover:underline" {...p} />,
  hr: ({ node, ...p }) => <hr className="border-border my-4" {...p} />,
  blockquote: ({ node, ...p }) => (
    <blockquote className="border-primary/40 text-muted-foreground my-3 border-l-2 pl-3 italic" {...p} />
  ),
  code: ({ node, className, children, ...rest }) => {
    const inline = !className
    return inline
      ? <code className="bg-muted text-foreground rounded px-1 py-0.5 font-mono text-[11px]" {...rest}>{children}</code>
      : <code className={`text-foreground font-mono text-[11px] ${className ?? ''}`} {...rest}>{children}</code>
  },
  pre: ({ node, ...p }) => (
    <pre className="bg-muted border-border my-3 overflow-x-auto rounded-lg border p-3 text-[11px]" {...p} />
  ),
  table: ({ node, ...p }) => (
    <div className="border-border my-3 overflow-x-auto rounded-lg border">
      <table className="text-foreground w-full text-xs" {...p} />
    </div>
  ),
  thead: ({ node, ...p }) => <thead className="bg-muted/40" {...p} />,
  tr:    ({ node, ...p }) => <tr className="border-border/50 border-b last:border-0" {...p} />,
  th:    ({ node, ...p }) => <th className="text-muted-foreground px-3 py-2 text-left text-[10px] font-semibold tracking-wider uppercase" {...p} />,
  td:    ({ node, ...p }) => <td className="text-foreground px-3 py-2 align-top text-xs" {...p} />,
  strong: ({ node, ...p }) => <strong className="text-foreground font-semibold" {...p} />,
}

export default function MarkdownView({ markdown }: { markdown: string }) {
  return (
    <div className="text-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
