"use client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none prose-img:rounded-lg prose-headings:scroll-m-20 prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline prose-a:hover:underline">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        code({ node, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "")
          const inline = props.inline || false
          return !inline && match ? (
            <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
        h1: ({ node, ...props }) => (
          <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight" {...props} />
        ),
        h3: ({ node, ...props }) => <h3 className="scroll-m-20 text-xl font-semibold tracking-tight" {...props} />,
        h4: ({ node, ...props }) => <h4 className="scroll-m-20 text-lg font-semibold tracking-tight" {...props} />,
        p: ({ node, ...props }) => <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />,
        ul: ({ node, ...props }) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className="mt-6 border-l-2 pl-6 italic" {...props} />,
        img: ({ node, ...props }) => <img className="rounded-md border" {...props} />,
        table: ({ node, ...props }) => (
          <div className="my-6 w-full overflow-y-auto">
            <table className="w-full" {...props} />
          </div>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  )
}

