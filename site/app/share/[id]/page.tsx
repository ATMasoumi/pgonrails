import { createClient } from '@/lib/supabase/server'
import { TopicDiagram } from '@/components/TopicDiagram'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: doc } = await supabase
    .from('documents')
    .select('query')
    .eq('id', id)
    .single()

  if (!doc) return { title: 'DocTree' }

  return {
    title: `${doc.query} - DocTree`,
    description: `Check out this knowledge tree about ${doc.query} on DocTree.`,
    openGraph: {
      title: doc.query,
      description: `Check out this knowledge tree about ${doc.query} on DocTree.`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: doc.query,
      description: `Check out this knowledge tree about ${doc.query} on DocTree.`,
    }
  }
}

export default async function PublicSharePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the root document first to check if it's public
  const { data: rootDoc } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (!rootDoc || !rootDoc.is_public) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Topic not found or private</h1>
          <p className="text-gray-600 mb-4">This topic might have been deleted or is not shared publicly.</p>
          <Link href="/hall">
            <Button>Explore Public Hall</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Fetch all public documents to build the tree
  // We need to fetch all public documents because we don't have a recursive query
  // and we don't know which ones belong to this tree without traversing.
  // Ideally, we would filter by root_id if we had it, or use a recursive CTE.
  // For now, fetching all public docs might be heavy if there are many.
  // Optimization: Add a root_id column to documents to easily fetch a whole tree.
  // But for now, let's try to fetch by traversing or just fetch all public docs (limit 1000?).
  
  // Actually, since we updated togglePublic to mark all descendants as public,
  // we can just fetch all public documents and filter in JS, similar to the dashboard.
  // But for a public page, we should be careful about performance.
  // Let's assume for now the number of public docs isn't huge.
  
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('is_public', true)

  if (!documents) {
    return <div>Error loading topic</div>
  }

  // Filter documents to only include the tree rooted at 'id'
  const relevantIds = new Set<string>([id])
  let changed = true
  while (changed) {
    changed = false
    for (const doc of documents) {
      if (doc.parent_id && relevantIds.has(doc.parent_id) && !relevantIds.has(doc.id)) {
        relevantIds.add(doc.id)
        changed = true
      }
    }
  }

  const treeDocuments = documents.filter(d => relevantIds.has(d.id))

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/hall" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hall
          </Link>
          <div className="h-6 w-px bg-gray-200" />
          <h1 className="font-semibold text-gray-900">{rootDoc.query}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <BookOpen className="w-4 h-4 mr-2" />
              Create Your Own
            </Button>
          </Link>
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <TopicDiagram 
          documents={treeDocuments} 
          rootId={id} 
          readOnly={true}
        />
      </div>
    </div>
  )
}
