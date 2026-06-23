import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | QuoteStream',
  description: 'Learn how to create professional GST invoices, quotations, and manage your business billing.',
}

export default function BlogIndex() {
  const posts = getAllPosts()

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
        Billing & Invoicing Resources
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl">
        Expert guides on GST invoicing, creating quotations, and running your Indian business efficiently.
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
            <article className="h-full flex flex-col p-6 bg-white dark:bg-gray-900 border border-border rounded-2xl transition-all hover:shadow-xl hover:border-blue-500/30">
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-3 tracking-wider uppercase">
                {post.category}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                {post.description}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                {new Date(post.date).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
