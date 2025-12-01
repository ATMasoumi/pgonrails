import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, Brain, Headphones, StickyNote, Layers, Library, FileText, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LandingNavbar from '@/components/landing/LandingNavbar'

export default async function PublicHallPage() {
  const supabase = await createClient()
  
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('is_public', true)
    .is('parent_id', null)
    .order('published_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-purple-500/30 selection:text-purple-200">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-purple-500 opacity-20 blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        <LandingNavbar />

        <main className="container mx-auto py-32 px-4">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Public Knowledge Hall
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Discover and learn from knowledge trees shared by the community. 
              Explore topics ranging from technology to arts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents?.map((doc, index) => {
              return (
                <Link key={doc.id} href={`/share/${doc.id}`} className="block group h-full">
                  <div className="bg-[#0A0A0A]/90 backdrop-blur-md rounded-xl border border-white/10 shadow-lg w-full relative transform group-hover:scale-[1.02] transition-transform duration-300 hover:border-blue-500/50 hover:shadow-blue-500/10">
                    {/* Handles - mimicking React Flow handles */}
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                    
                    {/* Right Collapse Button */}
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-50">
                      <div className="bg-[#0A0A0A] rounded-full shadow-lg border border-white/10 p-1 text-gray-400 group-hover:text-blue-400 group-hover:border-blue-500/50 transition-colors">
                        <Minus className="w-3 h-3" />
                      </div>
                    </div>

                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-base text-gray-200 leading-snug break-words flex-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                          {doc.query}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-purple-500/10 border-purple-500/50 text-purple-400">
                          <Brain className="w-3 h-3" />
                          <span className="text-[10px] font-medium">Quiz</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-orange-500/10 border-orange-500/50 text-orange-400">
                          <Headphones className="w-3 h-3" />
                          <span className="text-[10px] font-medium">Podcast</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-cyan-500/10 border-cyan-500/50 text-cyan-400">
                          <Layers className="w-3 h-3" />
                          <span className="text-[10px] font-medium">Flashcards</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-pink-500/10 border-pink-500/50 text-pink-400">
                          <Library className="w-3 h-3" />
                          <span className="text-[10px] font-medium">Resources</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-teal-500/10 border-teal-500/50 text-teal-400">
                          <FileText className="w-3 h-3" />
                          <span className="text-[10px] font-medium">Summary</span>
                        </div>
                      </div>

                      <div className="w-full h-8 px-3 bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 border border-emerald-500/20 rounded-md flex items-center justify-center text-xs font-medium mt-1 group-hover:bg-emerald-500 transition-colors">
                        <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                        Read Doc
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
            
            {documents?.length === 0 && (
              <div className="col-span-full text-center py-24">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                  <BookOpen className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No public trees yet</h3>
                <p className="text-gray-400">Be the first to share your knowledge with the world!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
