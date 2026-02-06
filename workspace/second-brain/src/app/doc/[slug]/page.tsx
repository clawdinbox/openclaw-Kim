import { notFound } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import DocumentView from '@/components/DocumentView'
import { getAllDocuments, getDocument } from '@/lib/documents'

export const dynamic = 'force-dynamic'

export default function DocPage({ params }: { params: { slug: string } }) {
  const documents = getAllDocuments()
  const document = getDocument(params.slug)
  
  if (!document) {
    notFound()
  }
  
  return (
    <div className="flex h-screen">
      <Sidebar documents={documents} />
      
      <main className="flex-1 overflow-y-auto p-8">
        <DocumentView document={document} />
      </main>
    </div>
  )
}
