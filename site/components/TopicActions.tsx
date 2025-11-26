"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Copy, Twitter, Linkedin, Facebook, MoreHorizontal } from 'lucide-react'
import { togglePublic } from '@/app/documents/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Document {
  id: string
  query: string
  content: string | null
  created_at: string
  parent_id: string | null
  user_id: string
  is_read?: boolean
  is_public?: boolean
}

interface TopicActionsProps {
  document: Document
}

export function TopicActions({ document }: TopicActionsProps) {
  const router = useRouter()
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    setIsSharing(true)
    try {
      await togglePublic(document.id, !document.is_public)
      toast.success(document.is_public ? 'Topic is now private' : 'Topic is now public')
      router.refresh()
    } catch {
      toast.error('Failed to update sharing settings')
    } finally {
      setIsSharing(false)
    }
  }

  const copyShareLink = () => {
    const url = `${window.location.origin}/share/${document.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/${document.id}` : ''
  const shareText = `Check out this knowledge tree about ${document.query} on DocTree!`

  return (
    <div className="flex items-center gap-2">
      {document.is_public && (
        <div className="flex gap-1 mr-2 border-r pr-2 items-center">
          <Button variant="ghost" size="icon" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}>
            <Twitter className="w-4 h-4 text-blue-400" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}>
            <Linkedin className="w-4 h-4 text-blue-700" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}>
            <Facebook className="w-4 h-4 text-blue-600" />
          </Button>
        </div>
      )}

      <Button 
        onClick={handleShare} 
        disabled={isSharing} 
        variant={document.is_public ? "secondary" : "outline"}
        className={document.is_public ? "text-blue-600 bg-blue-50" : ""}
        size="sm"
      >
        <Share2 className="w-4 h-4 mr-2" />
        {document.is_public ? "Public" : "Share"}
      </Button>

      {document.is_public && (
        <Button onClick={copyShareLink} variant="outline" size="icon" title="Copy Link">
          <Copy className="w-4 h-4" />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-red-600">
            Delete Topic
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
