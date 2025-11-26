import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { TopicDiagram } from '@/components/TopicDiagram'
import { TopicActions } from '@/components/TopicActions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function TopicDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  // Fetch all documents for the user to build the tree
  // In a production app with many docs, we'd want a recursive query here
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })

  if (!documents) {
    return <div>Topic not found</div>
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
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Navbar />
      
      {/* Header Bar */}
      <div className="bg-white border-b px-4 py-3 shadow-sm shrink-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {rootTopic.query}
              </h1>
              <p className="text-xs text-gray-500">
                {treeDocuments.length} topics • Last updated {new Date(rootTopic.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <TopicActions document={rootTopic} />
        </div>
      </div>

      {/* Main Content - Full Height Diagram */}
      <main className="flex-1 relative w-full bg-slate-50">
         <div className="absolute inset-0">
            <TopicDiagram documents={treeDocuments} rootId={id} />
         </div>
      </main>
    </div>
  )
}
