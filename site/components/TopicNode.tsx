"use client"

import { memo, useState, useEffect } from 'react'
import { Handle, Position, NodeProps, Node } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { FileText, Loader2, BookOpen, Trash2, Plus, Minus, Brain, Headphones, StickyNote, Layers, Square, Library } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generatePodcast, getPodcast, generateResources, generateSummary } from '@/app/documents/actions'
import { ResourceData } from '@/components/ResourcesModal'
import { QuizQuestion } from '@/components/QuizSidePanel'
import { usePodcast } from '@/lib/contexts/PodcastContext'
import { toast } from 'sonner'

interface TopicNodeData extends Record<string, unknown> {
  id: string
  rootId: string
  label: string
  content: string | null
  createdAt: string
  hasChildren: boolean
  isCollapsed: boolean
  readOnly?: boolean
  hasQuiz?: boolean
  hasPodcast?: boolean
  hasFlashcards?: boolean
  hasResources?: boolean
  hasNote?: boolean
  hasSummary?: boolean
  isGeneratingQuiz?: boolean
  isGeneratingFlashcards?: boolean
  onToggleCollapse: () => void
  onOpenDocument: () => void
  onOpenNote: (id: string) => void
  onOpenQuiz: (id: string) => void
  onOpenFlashcards: (id: string) => void
  onOpenResources: (title: string, resources: ResourceData) => void
  onOpenSummary: (title: string, summary: string) => void
  onDelete: (id: string) => Promise<void>
  onGenerate: (id: string, type: 'subtopic' | 'explanation') => Promise<void>
}

type TopicNode = Node<TopicNodeData>

export const TopicNode = memo(({ data, isConnectable }: NodeProps<TopicNode>) => {
  const { label, content, onGenerate, id, rootId, hasChildren, isCollapsed, readOnly, onToggleCollapse, onDelete, hasQuiz, hasPodcast, hasFlashcards, hasResources, hasNote, hasSummary, isGeneratingQuiz, isGeneratingFlashcards, onOpenNote, onOpenQuiz, onOpenFlashcards, onOpenResources, onOpenSummary } = data
  const [loadingType, setLoadingType] = useState<'subtopic' | 'explanation' | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Resources state
  const [isGeneratingResources, setIsGeneratingResources] = useState(false)
  const [resources, setResources] = useState<ResourceData | null>(null)

  // Summary state
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)

  // Sync local summary state with prop
  useEffect(() => {
    if (!hasSummary) {
      setSummary(null)
    }
  }, [hasSummary])

  // Podcast state
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false)
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null)
  const { playPodcast, currentUrl, isPlaying, togglePlayPause } = usePodcast()
  
  const isThisPodcastPlaying = isPlaying && currentUrl === podcastUrl

  const handleSummaryClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (summary) {
      onOpenSummary(label, summary)
      return
    }

    setIsGeneratingSummary(true)
    try {
      const result = await generateSummary(id)
      if (result.success && result.summary) {
        setSummary(result.summary)
        onOpenSummary(label, result.summary)
      } else {
        toast.error(result.error || 'Failed to generate summary')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to generate summary')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handleGenerate = async (type: 'subtopic' | 'explanation') => {
    if (loadingType) return
    setLoadingType(type)
    try {
      await onGenerate(id, type)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingType(null)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDeleting) return
    setIsDeleting(true)
    try {
      await onDelete(id)
    } catch (error) {
      console.error(error)
      setIsDeleting(false)
    }
  }

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren) {
      onToggleCollapse?.()
    } else {
      handleGenerate('subtopic')
    }
  }

  const handleQuizClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!content) return
    onOpenQuiz(id)
  }

  const handleFlashcardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!content || isGeneratingFlashcards) return
    onOpenFlashcards(id)
  }

  const handleResourcesClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!content || isGeneratingResources) return

    if (resources) {
      onOpenResources(label, resources)
      return
    }

    setIsGeneratingResources(true)
    try {
      const result = await generateResources(id, label, content)
      if (result.success && result.resources) {
        setResources(result.resources)
        onOpenResources(label, result.resources)
      } else {
        toast.error(result.error || 'Failed to generate resources')
      }
    } catch (error) {
      console.error('Error generating resources:', error)
      toast.error('An error occurred while generating resources')
    } finally {
      setIsGeneratingResources(false)
    }
  }

  const handlePodcastClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isThisPodcastPlaying) {
      togglePlayPause()
      return
    }

    if (podcastUrl && currentUrl === podcastUrl) {
      // It's paused but loaded
      togglePlayPause()
      return
    }

    setIsGeneratingPodcast(true)
    try {
      let url = podcastUrl

      if (!url) {
        // Check for existing podcast
        const existing = await getPodcast(id)
        
        if (existing) {
          url = existing.audio_url
        } else {
          // Generate new
          url = await generatePodcast(id)
        }
        setPodcastUrl(url)
      }

      if (url) {
        playPodcast(url, label)
      }
    } catch (error) {
      console.error('Error playing podcast:', error)
    } finally {
      setIsGeneratingPodcast(false)
    }
  }

  return (
    <div className="relative group">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="!bg-blue-500 !w-2 !h-2 !-ml-1 !border-0 z-50"
      />
      
      <div 
        className={cn(
          "bg-[#0A0A0A]/90 backdrop-blur-md rounded-xl border border-white/10 shadow-lg transition-all duration-300 w-[360px] overflow-hidden hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-xl group-hover:scale-[1.02]",
          loadingType ? "ring-2 ring-blue-500/20 animate-pulse" : ""
        )}
      >
        <div className="p-4 flex flex-col gap-3">
          {/* Header: Title + Actions */}
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-base text-gray-400 leading-snug break-words flex-1 group-hover:text-blue-400 transition-colors" title={label}>
              {label}
            </span>
            
            {!readOnly && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleDelete}
                  className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-500/10"
                  title="Delete topic"
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Badges */}
          {content && (
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={handleQuizClick}
                disabled={isGeneratingQuiz}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all cursor-pointer",
                  "bg-purple-500/5 border-purple-500/10 text-purple-400/50 hover:text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/20",
                  isGeneratingQuiz && "opacity-50 cursor-not-allowed",
                  hasQuiz && !isGeneratingQuiz && "border-purple-500/50 bg-purple-500/10 text-purple-400 opacity-100"
                )}
              >
                {isGeneratingQuiz ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Brain className="w-3 h-3" />
                )}
                <span className="text-[10px] font-medium">{isGeneratingQuiz ? 'Generating...' : 'Quiz'}</span>
              </button>
              <button 
                onClick={handlePodcastClick}
                disabled={isGeneratingPodcast}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all cursor-pointer",
                  "bg-orange-500/5 border-orange-500/10 text-orange-400/50 hover:text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/20",
                  isGeneratingPodcast && "opacity-50 cursor-not-allowed",
                  isThisPodcastPlaying && "bg-orange-500/30 border-orange-500/50 animate-pulse text-orange-400 opacity-100",
                  (hasPodcast || podcastUrl) && !isThisPodcastPlaying && "border-orange-500/50 bg-orange-500/10 text-orange-400 opacity-100"
                )}
              >
                {isGeneratingPodcast ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isThisPodcastPlaying ? (
                  <Square className="w-3 h-3 fill-current" />
                ) : (
                  <Headphones className="w-3 h-3" />
                )}
                <span className="text-[10px] font-medium">
                  {isThisPodcastPlaying ? "Stop" : "Podcast"}
                </span>
              </button>
              {!readOnly && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenNote?.(id)
                }}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all cursor-pointer",
                  "bg-yellow-500/5 border-yellow-500/10 text-yellow-400/50 hover:text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/20",
                  hasNote && "border-yellow-500/50 bg-yellow-500/10 text-yellow-400 opacity-100"
                )}
              >
                <StickyNote className="w-3 h-3" />
                <span className="text-[10px] font-medium">Note</span>
              </button>
              )}
              <button 
                onClick={handleFlashcardClick}
                disabled={isGeneratingFlashcards}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all cursor-pointer",
                  "bg-cyan-500/5 border-cyan-500/10 text-cyan-400/50 hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/20",
                  isGeneratingFlashcards && "opacity-50 cursor-not-allowed",
                  hasFlashcards && !isGeneratingFlashcards && "border-cyan-500/50 bg-cyan-500/10 text-cyan-400 opacity-100"
                )}
              >
                {isGeneratingFlashcards ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Layers className="w-3 h-3" />
                )}
                <span className="text-[10px] font-medium">{isGeneratingFlashcards ? 'Generating...' : 'Flashcards'}</span>
              </button>
              <button 
                onClick={handleResourcesClick}
                disabled={isGeneratingResources}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all cursor-pointer",
                  "bg-pink-500/5 border-pink-500/10 text-pink-400/50 hover:text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/20",
                  isGeneratingResources && "opacity-50 cursor-not-allowed",
                  (hasResources || resources) && "border-pink-500/50 bg-pink-500/10 text-pink-400 opacity-100"
                )}
              >
                {isGeneratingResources ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Library className="w-3 h-3" />
                )}
                <span className="text-[10px] font-medium">Resources</span>
              </button>
              <button 
                onClick={handleSummaryClick}
                disabled={isGeneratingSummary}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all cursor-pointer",
                  "bg-teal-500/5 border-teal-500/10 text-teal-400/50 hover:text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/20",
                  isGeneratingSummary && "opacity-50 cursor-not-allowed",
                  (hasSummary || summary) && "border-teal-500/50 bg-teal-500/10 text-teal-400 opacity-100"
                )}
              >
                {isGeneratingSummary ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <FileText className="w-3 h-3" />
                )}
                <span className="text-[10px] font-medium">Summary</span>
              </button>
            </div>
          )}

          {/* Actions Row */}
          <div className="flex items-center gap-2">
            {content ? (
               <Button 
                variant="default" 
                size="sm" 
                className="flex-1 text-xs h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 border border-emerald-500/20"
                onClick={(e) => {
                  e.stopPropagation()
                  window.location.href = `/documents/${id}?rootId=${rootId}`
                }}
                title="Read Document"
              >
                <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                Read Doc
              </Button>
            ) : (
              !readOnly && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs h-8 px-3 bg-white/5 border-white/10 text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleGenerate('explanation')
                  }}
                  disabled={!!loadingType}
                  title="Learn More"
                >
                  {loadingType === 'explanation' ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Learn More
                </Button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Generate Subtopics / Collapse Button (Right Side) */}
      {(!readOnly || hasChildren) && (
        <div className="absolute -right-5 top-1/2 -translate-y-1/2 z-50">
          <button
            onClick={handleNodeClick}
            className="bg-[#0A0A0A] rounded-full shadow-lg border border-white/10 p-1.5 hover:border-blue-500/50 hover:text-blue-400 text-gray-400 transition-all hover:scale-110 hover:shadow-blue-500/20"
            title={hasChildren ? (isCollapsed ? "Expand" : "Collapse") : "Generate subtopics"}
            disabled={!!loadingType}
          >
            {loadingType === 'subtopic' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (hasChildren && !isCollapsed) ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="!bg-transparent !w-2 !h-2 !-mr-1 border-0 z-0 opacity-0"
      />
    </div>
  )
})

TopicNode.displayName = 'TopicNode'
