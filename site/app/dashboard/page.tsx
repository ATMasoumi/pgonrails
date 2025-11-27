import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { AddTopicForm } from '@/components/AddTopicForm'
import { TopicCard } from '@/components/TopicCard'
import { cn } from "@/lib/utils"

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
  const hasTopics = rootTopics.length > 0

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
    <div className="min-h-screen bg-[#020202] text-white flex flex-col">
      <Navbar />
      <main className={cn(
        "container mx-auto px-4 flex-1 flex flex-col",
        hasTopics ? "py-12" : "justify-center items-center pb-32"
      )}>
        <div className={cn("text-center space-y-4", hasTopics ? "mb-12" : "mb-8")}>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70">
            AI Topic Manager
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Create topics and generate content with AI. Organize your thoughts in a powerful, visual way.
          </p>
        </div>

        <div className={cn("w-full transition-all duration-500", !hasTopics && "max-w-2xl")}>
          <AddTopicForm showSuggestions={!hasTopics} />
        </div>

        {hasTopics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 w-full">
            {rootTopics.map((topic) => (
              <TopicCard 
                key={topic.id} 
                topic={topic} 
                subtopicCount={getDescendantCount(topic.id)} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
