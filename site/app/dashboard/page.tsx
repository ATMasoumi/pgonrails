import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { AddTopicForm } from '@/components/AddTopicForm'
import { TopicCard } from '@/components/TopicCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Filter for root topics (no parent)
  const rootTopics = documents?.filter(doc => !doc.parent_id) || []

  // Helper to count descendants for a root topic
  const getDescendantCount = (rootId: string) => {
    let count = 0;
    const stack = [rootId];
    const visited = new Set<string>([rootId]);
    
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      const children = documents?.filter(d => d.parent_id === currentId) || [];
      count += children.length;
      for (const child of children) {
        if (!visited.has(child.id)) {
          visited.add(child.id);
          stack.push(child.id);
        }
      }
    }
    return count;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">AI Topic Manager</h1>
          <p className="text-gray-600">Create topics and generate content with AI</p>
        </div>

        <AddTopicForm />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {rootTopics.length > 0 ? (
            rootTopics.map((topic) => (
              <TopicCard 
                key={topic.id} 
                topic={topic} 
                subtopicCount={getDescendantCount(topic.id)} 
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed">
              No topics created yet. Add one above to get started!
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
