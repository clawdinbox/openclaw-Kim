import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const DOCS_PATH = path.join(process.cwd(), '..', 'documents')

export interface Document {
  slug: string
  title: string
  content: string
  category: string
  date?: string
  tags?: string[]
}

export interface DocumentTree {
  [category: string]: Document[]
}

function getFilesRecursively(dir: string, baseDir: string = dir): string[] {
  if (!fs.existsSync(dir)) return []
  
  const files: string[] = []
  const items = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      files.push(...getFilesRecursively(fullPath, baseDir))
    } else if (item.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  
  return files
}

export function getAllDocuments(): DocumentTree {
  const files = getFilesRecursively(DOCS_PATH)
  const tree: DocumentTree = {}
  
  for (const filePath of files) {
    const relativePath = path.relative(DOCS_PATH, filePath)
    const parts = relativePath.split(path.sep)
    const category = parts.length > 1 ? parts[0] : 'general'
    const fileName = parts[parts.length - 1]
    const slug = relativePath.replace(/\.md$/, '').replace(/\//g, '__')
    
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContent)
    
    const title = data.title || fileName.replace(/\.md$/, '').replace(/-/g, ' ')
    
    if (!tree[category]) {
      tree[category] = []
    }
    
    tree[category].push({
      slug,
      title,
      content,
      category,
      date: data.date,
      tags: data.tags,
    })
  }
  
  // Sort journal entries by date (newest first)
  if (tree['journal']) {
    tree['journal'].sort((a, b) => {
      const dateA = a.slug.match(/\d{4}-\d{2}-\d{2}/)?.[0] || ''
      const dateB = b.slug.match(/\d{4}-\d{2}-\d{2}/)?.[0] || ''
      return dateB.localeCompare(dateA)
    })
  }
  
  return tree
}

export function getDocument(slug: string): Document | null {
  const filePath = path.join(DOCS_PATH, slug.replace(/__/g, '/') + '.md')
  
  if (!fs.existsSync(filePath)) return null
  
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContent)
  
  const parts = slug.split('__')
  const category = parts.length > 1 ? parts[0] : 'general'
  const fileName = parts[parts.length - 1]
  const title = data.title || fileName.replace(/-/g, ' ')
  
  return {
    slug,
    title,
    content,
    category,
    date: data.date,
    tags: data.tags,
  }
}
