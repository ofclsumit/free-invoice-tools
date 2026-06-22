import Link from "next/link"
import { ArrowRight } from "lucide-react"

export interface RelatedTool {
  title: string
  description: string
  href: string
}

export function RelatedTools({ tools }: { tools: RelatedTool[] }) {
  if (!tools || tools.length === 0) return null

  return (
    <section className="py-12 border-t border-border mt-16">
      <h2 className="text-2xl font-bold font-display mb-8">Related Tools</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group block p-6 bg-white dark:bg-gray-900 border border-border rounded-xl hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
              {tool.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {tool.description}
            </p>
            <div className="flex items-center text-sm font-medium text-primary">
              Use Tool <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
