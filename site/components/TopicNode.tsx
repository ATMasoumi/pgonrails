"use client"

import { memo, useState, useRef } from 'react'
import { Handle, Position, NodeProps, Node } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { FileText, Loader2, BookOpen, Trash2, Plus, Minus, Brain, Headphones, StickyNote, Layers, Square, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateQuiz, getLatestQuiz, generatePodcast, getPodcast } from '@/app/documents/actions'
import { QuizModal, QuizQuestion } from '@/components/QuizModal'
import { usePodcast } from '@/lib/contexts/PodcastContext'

interface TopicNodeData extends Record<string, unknown> {
  id: string
  rootId: string
  label: string
  content: string | null
  createdAt: string
  hasChildren: boolean
  isCollapsed: boolean
  readOnly?: boolean
  onToggleCollapse: () => void
  onOpenDocument: () => void
  onDelete: (id: string) => Promise<void>
  onGenerate: (id: string, type: 'subtopic' | 'explanation') => Promise<void>
}

type TopicNode = Node<TopicNodeData>

export const TopicNode = memo(({ data, isConnectable }: NodeProps<TopicNode>) => {
  const { label, content, onGenerate, id, rootId, hasChildren, isCollapsed, readOnly, onToggleCollapse, onDelete } = data
  const [loadingType, setLoadingType] = useState<'subtopic' | 'explanation' | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [quizId, setQuizId] = useState<string | null>(null)
  const [existingAnswers, setExistingAnswers] = useState<number[] | undefined>(undefined)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)

  // Podcast state
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false)
  const [podcastUrl, setPodcastUrl] = useState<string | null>(null)
  const { playPodcast, currentUrl, isPlaying, togglePlayPause } = usePodcast()
  
  const isThisPodcastPlaying = isPlaying && currentUrl === podcastUrl

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

  const generateNewQuiz = async () => {
    if (!content) return
    setIsGeneratingQuiz(true)
    // Close modal while generating new one
    setIsQuizOpen(false)
    setExistingAnswers(undefined)
    
    try {
      const result = await generateQuiz(id, content)
      if (result.success && result.quiz) {
        setQuizQuestions(result.quiz.questions)
        setQuizId(result.quizId)
        setIsQuizOpen(true)
      }
    } catch (error) {
      console.error('Error generating quiz:', error)
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  const handleQuizClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!content || isGeneratingQuiz) return

    setIsGeneratingQuiz(true)
    try {
      // First check for existing quiz
      const existing = await getLatestQuiz(id)
      
      if (existing && existing.quiz) {
        setQuizQuestions(existing.quiz.questions)
        setQuizId(existing.quiz.id)
        if (existing.attempt) {
          setExistingAnswers(existing.attempt.answers)
        } else {
          setExistingAnswers(undefined)
        }
        setIsQuizOpen(true)
      } else {
        // No existing quiz, generate new one
        await generateNewQuiz()
      }
    } catch (error) {
      console.error('Error fetching/generating quiz:', error)
    } finally {
      setIsGeneratingQuiz(false)
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
      <QuizModal 
        isOpen={isQuizOpen} 
        onClose={() => setIsQuizOpen(false)} 
        questions={quizQuestions}
        quizId={quizId}
        existingAnswers={existingAnswers}
        onGenerateNew={generateNewQuiz}
      />
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
            <span className="font-semibold text-base text-gray-200 leading-snug break-words flex-1 group-hover:text-blue-400 transition-colors" title={label}>
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
                  "flex items-center gap-1.5 bg-purple-500/10 px-2 py-1 rounded-md border border-purple-500/20 hover:bg-purple-500/20 transition-colors cursor-pointer",
                  isGeneratingQuiz && "opacity-50 cursor-not-allowed"
                )}
              >
                {isGeneratingQuiz ? (
                  <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
                ) : (
                  <Brain className="w-3 h-3 text-purple-400" />
                )}
                <span className="text-[10px] font-medium text-purple-400">Quiz</span>
              </button>
              <button 
                onClick={handlePodcastClick}
                disabled={isGeneratingPodcast}
                className={cn(
                  "flex items-center gap-1.5 bg-orange-500/10 px-2 py-1 rounded-md border border-orange-500/20 hover:bg-orange-500/20 transition-colors cursor-pointer",
                  isGeneratingPodcast && "opacity-50 cursor-not-allowed",
                  isThisPodcastPlaying && "bg-orange-500/30 border-orange-500/50 animate-pulse"
                )}
              >
                {isGeneratingPodcast ? (
                  <Loader2 className="w-3 h-3 text-orange-400 animate-spin" />
                ) : isThisPodcastPlaying ? (
                  <Square className="w-3 h-3 text-orange-400 fill-current" />
                ) : (
                  <Headphones className="w-3 h-3 text-orange-400" />
                )}
                <span className="text-[10px] font-medium text-orange-400">
                  {isThisPodcastPlaying ? "Stop" : "Podcast"}
                </span>
              </button>
              <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                <StickyNote className="w-3 h-3 text-yellow-400" />
                <span className="text-[10px] font-medium text-yellow-400">Note</span>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                <Layers className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-medium text-blue-400">Flashcard</span>
              </div>
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
