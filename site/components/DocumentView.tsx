"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { MessageSquare, ArrowLeft, Check, BookOpen, Clock, FileText, StickyNote, Sparkles, ArrowRight, Trash2 } from 'lucide-react'
import { DocumentSidePanel } from '@/components/DocumentSidePanel'
import { NoteSidePanel } from '@/components/NoteSidePanel'
import { updateNote, markAsRead, addDocumentHighlight, removeDocumentHighlight, updateDocumentHighlightNote } from '@/app/documents/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCompletion } from '@ai-sdk/react'
import { StreamingText } from '@/components/StreamingText'

// ============================================================================
// TYPES
// ============================================================================

interface Document {
  id: string
  query: string
  content: string | null
  created_at: string
  parent_id: string | null
  user_id: string
  is_read?: boolean
  note?: string | null
}

interface Highlight {
  id: string
  document_id: string
  user_id: string
  highlighted_text: string
  created_at: string
  note?: string | null
}

interface DocumentViewProps {
  doc: Document
  rootId?: string
  autoGenerate?: boolean
  highlights?: Highlight[]
}

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

// ============================================================================
// COMPONENT: DocumentView
// A Medium-style article reader with elegant typography and streaming support
// ============================================================================

// HighlightTooltip component
const HighlightTooltip = ({ 
  note, 
  x, 
  y, 
  onSave,
  onDelete,
  onMouseEnter, 
  onMouseLeave,
  isEditing,
  onFocus,
  containerRef
}: { 
  note: string; 
  x: number; 
  y: number; 
  onSave: (note: string) => void;
  onDelete: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isEditing?: boolean;
  onFocus?: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [localNote, setLocalNote] = useState(note)

  useEffect(() => {
    setLocalNote(note)
  }, [note])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [localNote])

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      if (document.activeElement !== textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }, [isEditing])

  // Handle click outside to save
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing && containerRef?.current && !containerRef.current.contains(event.target as Node)) {
        onSave(localNote)
      }
    }

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing, localNote, onSave, containerRef])

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute z-[100] pointer-events-none"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, 0)'
      }}
    >
      <div 
        className="relative pointer-events-auto"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl max-w-xs relative z-10 overflow-hidden flex flex-col min-w-[240px]">
          <div className="px-3 py-2.5 max-h-[240px] overflow-y-auto">
            <textarea
              ref={textareaRef}
              value={localNote}
              onChange={(e) => {
                setLocalNote(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
              onFocus={onFocus}
              placeholder="Add a note..."
              className="w-full bg-transparent text-sm text-[#e0e0e0] leading-relaxed resize-none focus:outline-none placeholder:text-gray-600"
              rows={1}
              onKeyDown={(e) => {
                e.stopPropagation()
              }}
            />
          </div>
          <div className="flex border-t border-white/5">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="w-full py-1.5 hover:bg-red-500/10 flex items-center justify-center gap-1.5 text-xs font-medium text-[#a0a0a0] hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function DocumentView({ doc, rootId, autoGenerate, highlights = [] }: DocumentViewProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const router = useRouter()
  const [isMarking, setIsMarking] = useState(false)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const [pendingNoteText, setPendingNoteText] = useState<string | null>(null)
  const [selectionPos, setSelectionPos] = useState<{ top: number, left: number } | null>(null)
  const [selectedText, setSelectedText] = useState<string>('')
  const [isTooltipHovered, setIsTooltipHovered] = useState(false)
  const [isSelectionLTR, setIsSelectionLTR] = useState(true)
  const [localHighlights, setLocalHighlights] = useState<string[]>(highlights.map(h => h.highlighted_text))
  const [hoveredNote, setHoveredNote] = useState<{ text: string; note: string; x: number; y: number } | null>(null)
  const [editingNote, setEditingNote] = useState<{ text: string; note: string; x: number; y: number } | null>(null)
  const [highlightNotes, setHighlightNotes] = useState<Map<string, string>>(new Map())
  const contentRef = useRef<HTMLDivElement>(null)
  const highlightsApplied = useRef(false)
  const closeTooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const saveNoteTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize notes from highlights prop
  useEffect(() => {
    const notes = new Map<string, string>()
    highlights.forEach(h => {
      notes.set(h.highlighted_text, h.note || '')
    })
    setHighlightNotes(notes)
  }, [highlights])

  // Handler for note content changes from NoteSidePanel - just for main note
  const handleNoteContentChange = useCallback(async (noteContent: string) => {
    // We no longer parse highlights from the main note
    // Just save the main note content
    try {
      await updateNote(doc.id, noteContent)
    } catch (err) {
      console.error('Failed to update note:', err)
    }
  }, [doc.id])

  const { complete, completion, isLoading: isGenerating } = useCompletion({
    api: '/api/generate-document',
    body: { documentId: doc.id },
    streamProtocol: 'text',
    onFinish: () => {
      toast.success('Document generated successfully')
      router.refresh()
    },
    onError: (error) => {
      console.error('Generation error:', error)
      toast.error('Failed to generate document')
    }
  })

  // Auto-generate document if requested and no content exists
  const hasTriggeredGeneration = useRef(false)
  
  useEffect(() => {
    if (autoGenerate && !doc.content && !isGenerating && !completion && !hasTriggeredGeneration.current) {
      hasTriggeredGeneration.current = true
      complete('')
    }
  }, [autoGenerate, doc.content, isGenerating, completion, complete])

  // Derived values for streaming
  const displayContent = completion || doc.content || ''
  const isCurrentlyStreaming = isGenerating
  const readTime = estimateReadTime(displayContent)

  // Selection handling for "Explain" feature
  useEffect(() => {
    const updateSelectionPosition = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        setSelectionPos(null)
        setSelectedText('')
        return
      }

      if (contentRef.current && !contentRef.current.contains(selection.anchorNode)) {
        setSelectionPos(null)
        setSelectedText('')
        return
      }

      const text = selection.toString().trim()
      if (!text) {
        setSelectionPos(null)
        setSelectedText('')
        return
      }

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      
      if (rect.width === 0) {
        setSelectionPos(null)
        return
      }
      
      // Determine selection direction by comparing anchor and focus positions
      // anchorNode is where the selection started, focusNode is where it ended
      const anchorRange = document.createRange()
      const focusRange = document.createRange()
      
      if (selection.anchorNode && selection.focusNode) {
        anchorRange.setStart(selection.anchorNode, selection.anchorOffset)
        anchorRange.collapse(true)
        focusRange.setStart(selection.focusNode, selection.focusOffset)
        focusRange.collapse(true)
        
        // Compare positions: -1 means anchor is before focus (left-to-right/top-to-bottom selection)
        const isLeftToRight = anchorRange.compareBoundaryPoints(Range.START_TO_START, focusRange) <= 0
        setIsSelectionLTR(isLeftToRight)
        
        // Get the bounding rect of the focus position (where selection ended)
        const focusRect = focusRange.getBoundingClientRect()
        
        // Position tooltip at the actual end point of the selection
        const tooltipLeft = isLeftToRight 
          ? focusRect.right + window.scrollX  // End is at focus position (right/bottom)
          : focusRect.left + window.scrollX   // End is at focus position (left/top)
        
        // Use the focus position's vertical position for multi-line selections
        setSelectionPos({
          top: focusRect.top + window.scrollY - 44,
          left: tooltipLeft
        })
      } else {
        // Fallback to center positioning
        setIsSelectionLTR(true)
        setSelectionPos({
          top: rect.top + window.scrollY - 44,
          left: rect.left + window.scrollX + (rect.width / 2)
        })
      }
      setSelectedText(text)
    }

    window.document.addEventListener('selectionchange', updateSelectionPosition)
    window.addEventListener('resize', updateSelectionPosition)

    return () => {
      window.document.removeEventListener('selectionchange', updateSelectionPosition)
      window.removeEventListener('resize', updateSelectionPosition)
    }
  }, [])

  const handleExplain = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selectedText) return
    setPendingMessage(`Explain this: "${selectedText}"`)
    setIsChatOpen(true)
    window.getSelection()?.removeAllRanges()
    setSelectionPos(null)
    setIsTooltipHovered(false)
  }

  const handleOpenNote = useCallback((text: string) => {
    setIsNotesOpen(true)
    // Scroll to the mark in notes
    setTimeout(() => {
      const notesPanel = document.querySelector('.ProseMirror')
      if (notesPanel) {
        const marks = notesPanel.querySelectorAll('div[data-quote-label]')
        for (const mark of marks) {
          if (mark.getAttribute('data-quote-text') === text) {
            mark.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Add a temporary highlight effect
            const originalTransition = (mark as HTMLElement).style.transition
            const originalTransform = (mark as HTMLElement).style.transform
            
            ;(mark as HTMLElement).style.transition = 'transform 0.2s ease, box-shadow 0.2s ease'
            ;(mark as HTMLElement).style.transform = 'scale(1.02)'
            ;(mark as HTMLElement).style.boxShadow = '0 0 0 2px rgba(245, 158, 11, 0.5)'
            
            setTimeout(() => {
              ;(mark as HTMLElement).style.transform = originalTransform
              ;(mark as HTMLElement).style.boxShadow = 'none'
              setTimeout(() => {
                ;(mark as HTMLElement).style.transition = originalTransition
              }, 200)
            }, 400)
            break
          }
        }
      }
    }, 400)
  }, [])

  // Function to create a highlight span with event handlers
  const createHighlightSpan = useCallback((text: string) => {
    const highlightSpan = document.createElement('span')
    highlightSpan.className = 'noted-text-highlight'
    highlightSpan.setAttribute('data-note-text', text)
    highlightSpan.style.cssText = `
      background-color: rgba(234, 179, 8, 0.15);
      border-bottom: 2px solid rgb(234, 179, 8);
      cursor: pointer;
      transition: background-color 0.2s ease;
    `
    
    // Add click handler to open notes
    highlightSpan.addEventListener('click', (evt) => {
      evt.preventDefault()
      evt.stopPropagation()
      // handleOpenNote(text) // Disabled opening side panel on click
    })
    
    return highlightSpan
  }, [])

  // Event delegation for highlight hover effects - uses latest highlightNotes
  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('noted-text-highlight')) {
        // Don't show hover tooltip if we are editing a note
        if (editingNote) return

        // Clear any pending close timer
        if (closeTooltipTimeoutRef.current) {
          clearTimeout(closeTooltipTimeoutRef.current)
          closeTooltipTimeoutRef.current = null
        }

        target.style.backgroundColor = 'rgba(234, 179, 8, 0.25)'
        
        const text = target.getAttribute('data-note-text')
        if (text) {
          const noteText = highlightNotes.get(text)
          if (noteText) {
            // Use getClientRects to find the specific line rect under the mouse
            const rects = target.getClientRects()
            let matchRect = target.getBoundingClientRect()
            
            // Find the rect that contains the mouse cursor
            for (let i = 0; i < rects.length; i++) {
              const r = rects[i]
              // Add a small buffer for easier detection
              if (e.clientY >= r.top - 10 && e.clientY <= r.bottom + 10 && 
                  e.clientX >= r.left - 10 && e.clientX <= r.right + 10) {
                matchRect = r
                break
              }
            }
            
            setHoveredNote({
              text,
              note: noteText,
              x: matchRect.left + matchRect.width / 2 + window.scrollX,
              y: matchRect.bottom + 8 + window.scrollY
            })
          }
        }
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('noted-text-highlight')) {
        target.style.backgroundColor = 'rgba(234, 179, 8, 0.15)'
        
        // Don't hide if editing
        if (editingNote) return

        // Delay closing the tooltip to allow moving mouse to it
        closeTooltipTimeoutRef.current = setTimeout(() => {
          setHoveredNote(null)
        }, 300) // 300ms delay
      }
    }

    container.addEventListener('mouseover', handleMouseOver)
    container.addEventListener('mouseout', handleMouseOut)

    return () => {
      container.removeEventListener('mouseover', handleMouseOver)
      container.removeEventListener('mouseout', handleMouseOut)
      if (closeTooltipTimeoutRef.current) {
        clearTimeout(closeTooltipTimeoutRef.current)
      }
    }
  }, [highlightNotes])

  // Apply saved highlights on document load
  useEffect(() => {
    if (!contentRef.current || highlightsApplied.current || localHighlights.length === 0) return
    if (!displayContent) return // Wait for content to be rendered
    
    // Small delay to ensure content is rendered
    const timer = setTimeout(() => {
      if (!contentRef.current) return
      
      localHighlights.forEach(text => {
        // Check if already highlighted
        const existing = contentRef.current?.querySelector(`[data-note-text="${CSS.escape(text)}"]`)
        if (existing) return
        
        // Find and highlight the text
        const walker = document.createTreeWalker(
          contentRef.current!,
          NodeFilter.SHOW_TEXT,
          null
        )
        
        let node: Text | null
        while ((node = walker.nextNode() as Text)) {
          if (node.textContent?.includes(text)) {
            try {
              const startIndex = node.textContent.indexOf(text)
              const range = document.createRange()
              range.setStart(node, startIndex)
              range.setEnd(node, startIndex + text.length)
              
              const highlightSpan = createHighlightSpan(text)
              range.surroundContents(highlightSpan)
            } catch {
              console.log('Could not apply highlight for:', text.substring(0, 30))
            }
            break
          }
        }
      })
      
      highlightsApplied.current = true
    }, 500)
    
    return () => clearTimeout(timer)
  }, [localHighlights, displayContent, createHighlightSpan])

  const highlightSafe = useCallback((range: Range, text: string) => {
    const commonAncestor = range.commonAncestorContainer;
    
    // Create a TreeWalker to find all text nodes within the common ancestor
    const walker = document.createTreeWalker(
      commonAncestor,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToWrap: { node: Text, start: number, end: number }[] = [];
    
    let currentNode: Node | null = walker.nextNode();
    while (currentNode) {
      const node = currentNode as Text;
      const nodeRange = document.createRange();
      nodeRange.selectNodeContents(node);
      
      if (range.compareBoundaryPoints(Range.START_TO_END, nodeRange) <= 0) {
        // Range starts after node ends -> skip
      } else if (range.compareBoundaryPoints(Range.END_TO_START, nodeRange) >= 0) {
        // Range ends before node starts -> skip
      } else {
        // Overlap
        const start = range.compareBoundaryPoints(Range.START_TO_START, nodeRange) > 0 
          ? range.startOffset 
          : 0;
          
        const end = range.compareBoundaryPoints(Range.END_TO_END, nodeRange) < 0
          ? range.endOffset
          : node.length;
          
        if (start < end) {
           nodesToWrap.push({ node, start, end });
        }
      }
      
      currentNode = walker.nextNode();
    }

    // Apply wraps
    nodesToWrap.forEach(({ node, start, end }) => {
      const wrapper = createHighlightSpan(text);
      const rangeToWrap = document.createRange();
      rangeToWrap.setStart(node, start);
      rangeToWrap.setEnd(node, end);
      try {
        rangeToWrap.surroundContents(wrapper);
      } catch (e) {
        console.error('Failed to wrap node:', e);
      }
    });
  }, [createHighlightSpan]);

  const handleAddToNote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selectedText || !selectionPos) return
    
    const textToHighlight = selectedText
    const currentSelectionPos = selectionPos
    
    // Get the current selection before clearing it
    const selection = window.getSelection()
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0).cloneRange()
      
      try {
        const highlightSpan = createHighlightSpan(textToHighlight)
        range.surroundContents(highlightSpan)
      } catch (err) {
        // If surroundContents fails (e.g., selection spans multiple elements), 
        // use fallback to wrap text nodes individually
        console.log('Using fallback highlight for multi-node selection')
        highlightSafe(range, textToHighlight)
      }
    }
    
    // Clear selection immediately after DOM manipulation
    window.getSelection()?.removeAllRanges()
    setSelectionPos(null)
    setIsTooltipHovered(false)
    
    // Save highlight to database and update state
    try {
      await addDocumentHighlight(doc.id, textToHighlight)
      setLocalHighlights(prev => [...prev, textToHighlight])
      
      // Add empty note to highlightNotes immediately so it's tracked
      setHighlightNotes(prev => {
        const next = new Map(prev)
        next.set(textToHighlight, '')
        return next
      })

      // Show editing tooltip
      setEditingNote({
        text: textToHighlight,
        note: '',
        x: currentSelectionPos.left,
        y: currentSelectionPos.top + 44 // Adjust for the offset we subtracted earlier
      })

    } catch (err) {
      console.error('Failed to save highlight:', err)
      toast.error('Failed to save highlight')
    }
  }

  const handleDeleteHighlight = useCallback(async (text: string) => {
    // Remove from local state
    setLocalHighlights(prev => prev.filter(h => h !== text))
    setHighlightNotes(prev => {
      const next = new Map(prev)
      next.delete(text)
      return next
    })
    
    // Remove the highlight spans from the document
    if (contentRef.current) {
      const highlightSpans = contentRef.current.querySelectorAll(`[data-note-text="${CSS.escape(text)}"]`)
      highlightSpans.forEach(span => {
        const textNode = document.createTextNode(span.textContent || '')
        span.parentNode?.replaceChild(textNode, span)
      })
    }

    // Close tooltip
    setHoveredNote(null)
    setEditingNote(null)

    // Delete from DB
    try {
      await removeDocumentHighlight(doc.id, text)
    } catch (err) {
      console.error('Failed to remove highlight from database:', err)
      toast.error('Failed to delete highlight')
    }
  }, [doc.id])

  const tooltipRef = useRef<HTMLDivElement>(null)

  const saveNoteToDb = useCallback(async (text: string, note: string) => {
    // Update local state map
    setHighlightNotes(prev => {
      const next = new Map(prev)
      next.set(text, note)
      return next
    })

    try {
      await updateDocumentHighlightNote(doc.id, text, note)
    } catch (err) {
      console.error('Failed to save note:', err)
      toast.error('Failed to save note')
    }
  }, [doc.id])

  const handleMarkAsRead = async () => {
    setIsMarking(true)
    try {
      await markAsRead(doc.id)
      toast.success('Marked as read')
      router.refresh()
    } catch {
      toast.error('Failed to mark as read')
    } finally {
      setIsMarking(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e6e6e6] relative">
      {/* Minimal top navigation - Medium style */}
      <nav className="border-b border-white/[0.06] sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="max-w-[900px] mx-auto px-6 h-14 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
            className="text-[#a0a0a0] hover:text-white hover:bg-transparent -ml-2 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          
          <div className="flex items-center gap-1">
            <Button 
              onClick={handleMarkAsRead} 
              disabled={isMarking || doc.is_read} 
              variant="ghost"
              size="sm"
              className={doc.is_read 
                ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" 
                : "text-[#a0a0a0] hover:text-white hover:bg-white/5"
              }
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">{doc.is_read ? "Read" : "Mark read"}</span>
            </Button>
            <Button 
              onClick={() => setIsNotesOpen(true)} 
              variant="ghost"
              size="sm"
              className="text-[#a0a0a0] hover:text-white hover:bg-white/5"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Notes</span>
            </Button>
            <Button 
              onClick={() => setIsChatOpen(true)} 
              variant="ghost"
              size="sm"
              className="text-[#a0a0a0] hover:text-white hover:bg-white/5"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Chat with AI</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Article content - Medium style layout */}
      <article className="relative">
        {/* Hero header section */}
        <header className="pt-12 pb-8 px-6">
          <div className="max-w-[680px] mx-auto">
            {/* Title */}
            <h1 className="text-[32px] sm:text-[42px] font-bold text-white leading-[1.15] tracking-[-0.02em] mb-6">
              {doc.query}
            </h1>
            
            {/* Meta info row */}
            <div className="flex items-center gap-4 text-[14px] text-[#757575]">
              <div className="flex items-center gap-4">
                {/* Date */}
                <span>{formatDate(doc.created_at)}</span>
                
                <span className="text-[#757575]">·</span>
                
                {/* Read time */}
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {isCurrentlyStreaming ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-pulse font-medium">
                        Writing
                      </span>
                      <span className="flex gap-0.5">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1 h-1 rounded-full bg-gradient-to-t from-blue-500 to-indigo-400"
                            style={{
                              animation: 'bounce 1.2s ease-in-out infinite',
                              animationDelay: `${i * 150}ms`,
                            }}
                          />
                        ))}
                      </span>
                    </span>
                  ) : (
                    <span>{readTime} min read</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Divider */}
        <div className="max-w-[680px] mx-auto px-6">
          <div className="h-px bg-white/[0.06]" />
        </div>

        {/* Main content area */}
        <div 
          ref={contentRef}
          className="py-10 px-6"
        >
          <div className="max-w-[680px] mx-auto">
            <StreamingText 
              content={displayContent} 
              isStreaming={isCurrentlyStreaming} 
            />
          </div>
        </div>

        {/* Bottom actions */}
        {!isCurrentlyStreaming && displayContent && (
          <footer className="border-t border-white/[0.06] py-8 px-6">
            <div className="max-w-[680px] mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#757575] text-sm">
                <BookOpen className="w-4 h-4" />
                <span>{readTime} min read</span>
              </div>
              
              <Button 
                onClick={() => setIsChatOpen(true)} 
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/10 text-[#e6e6e6] hover:bg-white/10 hover:text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat with AI
              </Button>
            </div>
          </footer>
        )}
      </article>

      {/* Selection tooltip with animated dual actions */}
      <AnimatePresence>
        {selectionPos && (
          <div 
            className="absolute z-50"
            style={{
              top: selectionPos.top,
              left: selectionPos.left,
              transform: isSelectionLTR ? 'translateX(4px)' : 'translateX(calc(-100% - 4px))'
            }}
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => setIsTooltipHovered(true)}
            onMouseLeave={() => setIsTooltipHovered(false)}
          >
            <div className="relative">
              {/* 3-dot button - always rendered but hidden when expanded */}
              <motion.div
                className="bg-[#141414] border border-white/10 shadow-2xl rounded-full w-8 h-8 flex items-center justify-center cursor-pointer"
                animate={{ 
                  opacity: isTooltipHovered ? 0 : 1,
                  scale: isTooltipHovered ? 0.8 : 1
                }}
                transition={{ duration: 0.15 }}
              >
                <span className="flex gap-1">
                  <span className="w-1 h-1 rounded-full bg-white/70" />
                  <span className="w-1 h-1 rounded-full bg-white/70" />
                  <span className="w-1 h-1 rounded-full bg-white/70" />
                </span>
              </motion.div>

              {/* Expanded menu - positioned absolutely */}
              <motion.div
                className="absolute top-0 left-0 bg-[#141414] border border-white/10 shadow-2xl backdrop-blur-sm rounded-xl p-1 flex gap-1"
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ 
                  opacity: isTooltipHovered ? 1 : 0,
                  scale: isTooltipHovered ? 1 : 0.9,
                  y: isTooltipHovered ? 0 : -4
                }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{ pointerEvents: isTooltipHovered ? 'auto' : 'none' }}
              >
                {/* Explain button */}
                <motion.button 
                  onClick={handleExplain}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Explain"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.button>
                
                {/* Add Note button */}
                <motion.button 
                  onClick={handleAddToNote}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Add Note"
                >
                  <StickyNote className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat side panel */}
      <DocumentSidePanel 
        topicId={doc.id} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        pendingMessage={pendingMessage}
        onMessageSent={() => setPendingMessage(null)}
      />

      {/* Notes side panel */}
      <NoteSidePanel
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        documentId={doc.id}
        initialNote={doc.note}
        title={doc.query}
        pendingNoteText={pendingNoteText}
        onNoteTextAdded={() => setPendingNoteText(null)}
        onNoteChange={handleNoteContentChange}
        onHighlightDeleted={(text) => {
          // Remove from local state
          setLocalHighlights(prev => prev.filter(h => h !== text))
          
          // Remove the highlight spans from the document
          if (contentRef.current) {
            const highlightSpans = contentRef.current.querySelectorAll(`[data-note-text="${CSS.escape(text)}"]`)
            highlightSpans.forEach(span => {
              const textNode = document.createTextNode(span.textContent || '')
              span.parentNode?.replaceChild(textNode, span)
            })
          }
        }}
        onNavigateToText={(text) => {
          // Close the notes panel first
          setIsNotesOpen(false)
          
          // Wait a bit for panel to close, then find and scroll to the text
          setTimeout(() => {
            if (!contentRef.current) return
            
            // First, check if there's already a highlighted span with this text
            const existingHighlight = contentRef.current.querySelector(`[data-note-text="${CSS.escape(text)}"]`) as HTMLElement
            if (existingHighlight) {
              // Just scroll to the existing highlight
              const rect = existingHighlight.getBoundingClientRect()
              const scrollY = window.scrollY + rect.top - window.innerHeight / 3
              window.scrollTo({ top: scrollY, behavior: 'smooth' })
              
              // Brief flash to indicate location
              existingHighlight.style.transition = 'background-color 0.2s ease'
              existingHighlight.style.backgroundColor = 'rgba(234, 179, 8, 0.35)'
              setTimeout(() => {
                existingHighlight.style.backgroundColor = 'rgba(234, 179, 8, 0.15)'
              }, 500)
              return
            }
            
            // Fallback: try to find the text in the document
            const walker = document.createTreeWalker(
              contentRef.current,
              NodeFilter.SHOW_TEXT,
              null
            )
            
            let node: Text | null
            while ((node = walker.nextNode() as Text)) {
              if (node.textContent?.includes(text)) {
                // Create a range and scroll to it
                const range = document.createRange()
                const startIndex = node.textContent.indexOf(text)
                range.setStart(node, startIndex)
                range.setEnd(node, startIndex + text.length)
                
                const rect = range.getBoundingClientRect()
                const scrollY = window.scrollY + rect.top - window.innerHeight / 3
                window.scrollTo({ top: scrollY, behavior: 'smooth' })
                
                return
              }
            }
            
            toast.error('Could not find the text in the document')
          }, 350)
        }}
      />

      {/* Tooltip for highlight notes */}
      <AnimatePresence>
        {(hoveredNote || editingNote) && (
          <HighlightTooltip 
            note={editingNote ? editingNote.note : hoveredNote!.note} 
            x={editingNote ? editingNote.x : hoveredNote!.x} 
            y={editingNote ? editingNote.y : hoveredNote!.y}
            isEditing={!!editingNote}
            onSave={(newNote) => {
              if (editingNote) {
                if (!newNote.trim()) {
                  handleDeleteHighlight(editingNote.text)
                } else {
                  saveNoteToDb(editingNote.text, newNote)
                }
                setEditingNote(null)
                setHoveredNote(null)
              }
            }}
            onDelete={() => {
              const text = editingNote ? editingNote.text : hoveredNote!.text
              handleDeleteHighlight(text)
            }}
            onFocus={() => {
              if (hoveredNote && !editingNote) {
                setEditingNote({
                  text: hoveredNote.text,
                  note: hoveredNote.note,
                  x: hoveredNote.x,
                  y: hoveredNote.y
                })
                setHoveredNote(null)
              }
            }}
            onMouseEnter={() => {
              if (closeTooltipTimeoutRef.current) {
                clearTimeout(closeTooltipTimeoutRef.current)
                closeTooltipTimeoutRef.current = null
              }
            }}
            onMouseLeave={() => {
              if (!editingNote) {
                closeTooltipTimeoutRef.current = setTimeout(() => {
                  setHoveredNote(null)
                }, 300)
              }
            }}
            containerRef={tooltipRef}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
