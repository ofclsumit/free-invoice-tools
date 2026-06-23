import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'src/content/blog')

export interface BlogPost {
  slug: string
  title: string
  date: string
  description: string
  content: string
  category: string
  faqs?: { question: string; answer: string }[]
}

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) return []
  return fs.readdirSync(postsDirectory)
}

export function getPostBySlug(slug: string): BlogPost {
  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = path.join(postsDirectory, `${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return {
    slug: realSlug,
    title: data.title,
    date: data.date,
    description: data.description,
    category: data.category,
    faqs: data.faqs || [],
    content,
  }
}

export function getAllPosts(): BlogPost[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .filter(slug => slug.endsWith('.md'))
    .map((slug) => getPostBySlug(slug))
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
  return posts
}
