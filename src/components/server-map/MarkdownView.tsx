/**
 * MarkdownView — render GFM markdown with the dashboard's styling.
 *
 * react-markdown + remark-gfm; v9 dropped its built-in sanitizer but
 * the system-map content is operator-written / trusted (same repo
 * pipeline as the dashboard itself), so we don't need rehype-sanitize.
 * See docs/INFRA_VIEW_PLAN.md §7 flag #9.
 */
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  markdown: string
}

export default function MarkdownView({ markdown }: Props) {
  return (
    <div className="prose-server-map text-sm text-g-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...p }) => <h1 className="text-xl font-semibold text-white mt-2 mb-3" {...p} />,
          h2: ({ node, ...p }) => <h2 className="text-base font-semibold text-white mt-6 mb-2 border-b border-g-border pb-1" {...p} />,
          h3: ({ node, ...p }) => <h3 className="text-sm font-semibold text-white mt-4 mb-2" {...p} />,
          h4: ({ node, ...p }) => <h4 className="text-xs font-semibold text-g-text uppercase tracking-wide mt-3 mb-1" {...p} />,
          p:  ({ node, ...p }) => <p className="text-sm text-g-text leading-relaxed my-2" {...p} />,
          ul: ({ node, ...p }) => <ul className="list-disc pl-5 my-2 space-y-1 text-sm text-g-text" {...p} />,
          ol: ({ node, ...p }) => <ol className="list-decimal pl-5 my-2 space-y-1 text-sm text-g-text" {...p} />,
          li: ({ node, ...p }) => <li className="text-sm text-g-text leading-relaxed" {...p} />,
          a:  ({ node, ...p }) => <a className="text-accent hover:underline" {...p} />,
          hr: ({ node, ...p }) => <hr className="my-4 border-g-border" {...p} />,
          blockquote: ({ node, ...p }) => (
            <blockquote className="border-l-2 border-accent/40 pl-3 my-3 text-g-muted italic" {...p} />
          ),
          code: ({ node, className, children, ...p }) => {
            const isInline = !className
            return isInline
              ? <code className="font-mono text-[11px] bg-g-deep text-g-text px-1 py-0.5 rounded" {...p}>{children}</code>
              : <code className={`font-mono text-[11px] text-g-text ${className ?? ''}`} {...p}>{children}</code>
          },
          pre: ({ node, ...p }) => (
            <pre className="bg-g-deep border border-g-border rounded-lg p-3 my-3 overflow-x-auto text-[11px]" {...p} />
          ),
          table: ({ node, ...p }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-g-border">
              <table className="w-full text-xs text-g-text" {...p} />
            </div>
          ),
          thead: ({ node, ...p }) => <thead className="bg-g-deep" {...p} />,
          tr:    ({ node, ...p }) => <tr className="border-b border-g-border/50 last:border-0" {...p} />,
          th:    ({ node, ...p }) => <th className="text-left px-3 py-2 text-[10px] font-semibold text-g-muted uppercase tracking-wider" {...p} />,
          td:    ({ node, ...p }) => <td className="px-3 py-2 align-top text-xs text-g-text" {...p} />,
          strong: ({ node, ...p }) => <strong className="text-white font-semibold" {...p} />,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
