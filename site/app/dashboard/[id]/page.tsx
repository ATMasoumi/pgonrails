import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { TopicDiagram } from '@/components/TopicDiagram'
import { TopicActions } from '@/components/TopicActions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TopicDetailsPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ generating?: string }>
}) {
  const { id } = await params
  const { generating } = await searchParams
  const isGeneratingFirstLevel = generating === 'true'
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  // Fetch all documents for the user to build the tree
  // In a production app with many docs, we'd want a recursive query here
  const { data: documents, error } = await supabase
    .from('documents')
    .select('*, quizzes(id), podcasts(id), flashcards(id), resources(id)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })

  if (error) {
    console.error('Error fetching documents:', error)
    return <div className="text-white p-4">Error loading topic: {error.message}</div>
  }

  if (!documents) {
    return <div className="text-white p-4">Topic not found</div>
  }

  // Find the specific root topic to verify it exists and get its title
  const rootTopic = documents.find(d => d.id === id)
  
  if (!rootTopic) {
    return <div>Topic not found</div>
  }

  // Filter documents to only include the tree rooted at 'id'
  // We can do a BFS/DFS to find all descendants
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
    <div className="h-screen flex flex-col bg-[#020202] overflow-hidden">
      <Navbar />
      
      {/* Header Bar */}
      <div className="bg-[#020202]/80 border-b border-white/10 px-4 py-3 shadow-sm shrink-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                {rootTopic.query}
              </h1>
              <p className="text-xs text-gray-500">
                {treeDocuments.length} topics • Last updated {new Date(rootTopic.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <TopicActions />
        </div>
      </div>

      {/* Main Content - Full Height Diagram */}
      <main className="flex-1 relative w-full bg-[#020202]">
         <div className="absolute inset-0">
            <TopicDiagram documents={treeDocuments} rootId={id} isGeneratingFirstLevel={isGeneratingFirstLevel} />
         </div>
      </main>
    </div>
  )
}
