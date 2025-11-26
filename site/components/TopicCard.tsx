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
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-blue-200 group-hover:-translate-y-1 relative overflow-hidden bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-lg font-semibold leading-tight text-gray-900 line-clamp-2" title={topic.query}>
              {topic.query}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 -mt-1 -mr-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
          <CardDescription className="text-xs mt-1">
            Created {new Date(topic.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-medium text-slate-600">{subtopicCount}</span>
              </div>
              {topic.content && (
                <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium text-emerald-700">Doc</span>
                </div>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
