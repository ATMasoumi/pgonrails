"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ArrowRight, FileText, GitBranch, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { deleteTopic } from '@/app/documents/actions'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Topic {
  id: string
  query: string
  content: string | null
  created_at: string
  parent_id: string | null
  user_id: string
  is_read?: boolean
}

interface TopicCardProps {
  topic: Topic
  subtopicCount: number
}

export function TopicCard({ topic, subtopicCount }: TopicCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this topic?')) return

    setIsDeleting(true)
    try {
      await deleteTopic(topic.id)
      router.refresh()
    } catch (error) {
      console.error(error)
      setIsDeleting(false)
    }
  }

  return (
    <Link href={`/dashboard/${topic.id}`} className="block group h-full">
      <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 hover:border-blue-500/30 group-hover:-translate-y-1 relative overflow-hidden bg-white/5 border-white/10 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg font-semibold leading-tight text-white group-hover:text-blue-400 transition-colors line-clamp-2" title={topic.query}>
              {topic.query}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10 -mt-1 -mr-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
          <CardDescription className="text-xs mt-1 text-gray-500">
            Created {new Date(topic.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 group-hover:border-blue-500/20 transition-colors">
                <GitBranch className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                <span className="font-medium text-gray-400 group-hover:text-blue-300 transition-colors">{subtopicCount}</span>
              </div>
              {topic.content && (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-medium text-emerald-400">Doc</span>
                </div>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors border border-white/5 group-hover:border-blue-500/30">
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
