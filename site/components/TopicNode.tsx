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
  onToggleCollapse: () => void
  onOpenDocument: () => void
  onDelete: (id: string) => Promise<void>
  onGenerate: (id: string, type: 'subtopic' | 'explanation') => Promise<void>
}

type TopicNode = Node<TopicNodeData>

export const TopicNode = memo(({ data, isConnectable }: NodeProps<TopicNode>) => {
  const { label, content, onGenerate, onOpenDocument, id, rootId, hasChildren, isCollapsed, onToggleCollapse, onDelete } = data
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
        className="!bg-gray-300 !w-2 !h-2 !-ml-1 border-2 border-white z-50"
      />
      
      <div 
        className={cn(
          "bg-white rounded-xl border shadow-sm transition-all duration-200 w-[220px] overflow-hidden hover:border-blue-400 hover:shadow-md",
          loadingType ? "ring-2 ring-blue-500/20 animate-pulse" : ""
        )}
      >
        <div className="p-3 flex flex-col gap-3">
          {/* Header: Title + Actions */}
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-sm text-gray-900 leading-snug break-words flex-1" title={label}>
              {label}
            </span>
            
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleDelete}
                className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50"
                title="Delete topic"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>


          {/* Actions Row */}
          <div className="flex items-center gap-2">
            {content ? (
               <Button 
                variant="default" 
                size="sm" 
                className="flex-1 text-[10px] h-7 px-2 bg-green-600 hover:bg-green-700"
                onClick={(e) => {
                  e.stopPropagation()
                  window.location.href = `/documents/${id}?rootId=${rootId}`
                }}
                title="Read Document"
              >
                <BookOpen className="w-3 h-3 mr-1" />
                Read
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-[10px] h-7 px-2 bg-white hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                onClick={(e) => {
                  e.stopPropagation()
                  handleGenerate('explanation')
                }}
                disabled={!!loadingType}
                title="Generate Document"
              >
                {loadingType === 'explanation' ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <FileText className="w-3 h-3 mr-1" />
                )}
                Gen Doc
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Generate Subtopics / Collapse Button (Right Side) */}
      <div className="absolute -right-5 top-1/2 -translate-y-1/2 z-50">
        <button
          onClick={handleNodeClick}
          className="bg-white rounded-full shadow-sm border border-slate-200 p-1.5 hover:border-blue-400 hover:text-blue-500 text-slate-400 transition-all hover:scale-110"
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
