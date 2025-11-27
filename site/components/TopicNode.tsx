"use client"

import { memo, useState } from 'react'
import { Handle, Position, NodeProps, Node } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { FileText, Loader2, BookOpen, Trash2, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

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
          "bg-[#0A0A0A]/90 backdrop-blur-md rounded-xl border border-white/10 shadow-lg transition-all duration-300 w-[280px] overflow-hidden hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-xl group-hover:scale-[1.02]",
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
                  title="Generate Document"
                >
                  {loadingType === 'explanation' ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Generate Doc
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
