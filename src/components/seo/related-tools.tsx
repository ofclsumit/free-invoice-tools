"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export interface RelatedTool {
  title: string
  description: string
  href: string
}

export interface RelatedTool {
  title: string
  description: string
  href: string
}

export function RelatedTools({ tools, isUltra = false }: { tools: RelatedTool[]; isUltra?: boolean }) {
  if (!tools || tools.length === 0) return null

  if (isUltra) {
    return (
      <section className="related-tools-root-glass">
        <style dangerouslySetInnerHTML={{ __html: `
          .related-tools-root-glass {
            max-width: 920px;
            width: 100%;
            margin-top: 1.5rem;
            font-family: 'Inter', sans-serif;
          }
          
          .related-title {
            font-size: .7rem;
            font-weight: 700;
            letter-spacing: .12em;
            text-transform: uppercase;
            color: rgba(15, 23, 42, 0.45);
            margin-bottom: .75rem;
            text-align: center;
          }
          .dark .related-title {
            color: rgba(255,255,255,.35);
          }

          .related-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: .75rem;
          }

          @media (max-width: 580px) {
            .related-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          .related-card {
            position: relative;
            display: block;
            text-decoration: none;
            color: #1e293b;
            background: transparent;
            border-radius: 1.1rem;
            overflow: hidden;
            box-shadow: 0 0 0 1px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06);
            transition: transform .3s cubic-bezier(.175,.885,.32,2.2), box-shadow .25s ease;
          }
          .dark .related-card {
            color: #fff;
            box-shadow: 0 0 0 1px rgba(255,255,255,.1), 0 4px 16px rgba(0,0,0,.35);
          }

          .related-card:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 0 0 1px rgba(109,40,217,.25), 0 8px 24px rgba(109,40,217,.1);
          }
          .dark .related-card:hover {
            box-shadow: 0 0 0 1px rgba(167,139,250,.3), 0 8px 24px rgba(0,0,0,.4);
          }

          .related-card .glass-filter {
            position: absolute;
            inset: 0;
            z-index: 0;
            backdrop-filter: blur(10px) saturate(1.4);
            -webkit-backdrop-filter: blur(10px) saturate(1.4);
            filter: url(#lg-dist);
            isolation: isolate;
          }

          .related-card .glass-overlay {
            position: absolute;
            inset: 0;
            z-index: 1;
            background: rgba(255,255,255,.55);
          }
          .dark .related-card .glass-overlay {
            background: rgba(255,255,255,.1);
          }

          .related-card .glass-specular {
            position: absolute;
            inset: 0;
            z-index: 2;
            border-radius: inherit;
            overflow: hidden;
            box-shadow:
              inset 1.5px 1.5px 0 rgba(255,255,255,.75),
              inset -1px -1px 0 rgba(0,0,0,.04),
              inset 0 0 8px rgba(255,255,255,.2);
          }
          .dark .related-card .glass-specular {
            box-shadow:
              inset 1.5px 1.5px 0 rgba(255,255,255,.5),
              inset -1px -1px 0 rgba(255,255,255,.08),
              inset 0 0 8px rgba(255,255,255,.12);
          }

          .related-card .glass-content {
            position: relative;
            z-index: 3;
            display: flex;
            flex-direction: column;
            padding: .85rem 1rem .8rem;
            width: 100%;
          }

          .rc-name {
            font-size: .82rem;
            font-weight: 700;
            line-height: 1.3;
            color: #1e293b;
          }
          .dark .rc-name {
            color: #fff;
          }

          .rc-desc {
            font-size: .71rem;
            font-weight: 400;
            color: rgba(30, 41, 59, 0.65);
            margin-top: .15rem;
            line-height: 1.3;
          }
          .dark .rc-desc {
            color: rgba(255,255,255,.45);
          }
        ` }} />

        <h2 className="related-title">Related Tools</h2>
        <div className="related-grid">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="related-card">
              <div className="glass-filter" />
              <div className="glass-overlay" />
              <div className="glass-specular" />
              <div className="glass-content">
                <span className="rc-name">{tool.title}</span>
                <span className="rc-desc">{tool.description}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    )
  }

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
