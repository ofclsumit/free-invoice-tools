import { getPostBySlug, getAllPosts } from '@/lib/blog'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Metadata } from 'next'
import { SchemaMarkup } from '@/components/seo/SchemaMarkup'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = getPostBySlug(params.slug)
    return {
      title: `${post.title} | QuoteStream Blog`,
      description: post.description,
      openGraph: {
        title: post.title,
        description: post.description,
        type: 'article',
        publishedTime: post.date,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description,
      }
    }
  } catch (e) {
    return {}
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  let post
  try {
    post = getPostBySlug(params.slug)
  } catch (e) {
    notFound()
  }

  const articleSchema = {
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "QuoteStream"
    }
  }

  const faqSchema = post.faqs && post.faqs.length > 0 ? {
    mainEntity: post.faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  } : null

  return (
    <>
      <SchemaMarkup type="Article" data={articleSchema} />
      {faqSchema && <SchemaMarkup type="FAQPage" data={faqSchema} />}

      <article className="container mx-auto px-4 py-16 max-w-3xl">
        <header className="mb-12 text-center">
          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-4 tracking-wider uppercase">
            {post.category}
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6">
            {post.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Published on {new Date(post.date).toLocaleDateString('en-IN', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </header>

        <div className="prose prose-blue prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </>
  )
}
