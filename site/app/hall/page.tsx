import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function PublicHallPage() {
  const supabase = await createClient()
  
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('is_public', true)
    .is('parent_id', null)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">DocTree Public Hall</span>
          </Link>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Public Knowledge Trees</h1>
          <p className="text-lg text-gray-600">Discover and learn from trees shared by the community.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents?.map((doc) => (
            <Link key={doc.id} href={`/share/${doc.id}`} className="block group">
              <div className="bg-white rounded-xl shadow-sm border p-6 h-full transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <Share2 className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {doc.query}
                </h3>
                <p className="text-sm text-gray-500">
                  Shared by {doc.users?.raw_user_meta_data?.full_name || 'Anonymous'}
                </p>
                <div className="mt-4 text-sm text-gray-400">
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
          
          {documents?.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No public trees found yet. Be the first to share one!
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
