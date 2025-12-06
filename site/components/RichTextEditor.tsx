"use client"

import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { Node, mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { Button } from '@/components/ui/button'
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  Heading1, Heading2, List, ListOrdered, 
  CheckSquare, Quote, Code, 
  Paperclip, Loader2, Trash2, Maximize2, Mic, Square, FileText,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

const ImageThumbnail = ({ src, onClick, onDelete }: { src: string, onClick: () => void, onDelete?: () => void }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  
  return (
    <div 
      className="group relative rounded-xl border border-white/10 overflow-hidden transition-all duration-200 aspect-square cursor-pointer bg-zinc-900"
      onClick={onClick}
    >
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={src} 
        alt="Thumbnail"
        className={cn(
          "w-full h-full object-cover transition-transform duration-300",
          imageLoaded ? "opacity-100" : "opacity-0",
          "group-hover:scale-110"
        )}
        onLoad={() => setImageLoaded(true)}
      />
      
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 bg-black/60 hover:bg-blue-500 text-white backdrop-blur-md border border-white/20 rounded-full shadow-lg transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          title="Expand"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        {onDelete && (
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 bg-black/60 hover:bg-red-500 text-white backdrop-blur-md border border-white/20 rounded-full shadow-lg transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ImageComponent = ({ node, deleteNode }: any) => {
  const [showModal, setShowModal] = useState(false)
  
  return (
    <NodeViewWrapper className="inline-block w-32 m-1.5 align-top">
      <ImageThumbnail 
        src={node.attrs.src} 
        onClick={() => setShowModal(true)}
        onDelete={deleteNode}
      />
      
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-7xl w-full p-2 bg-black/95 border border-white/10 shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={node.attrs.src} 
            alt={node.attrs.alt || 'Uploaded image'}
            className="w-full h-auto rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </NodeViewWrapper>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ImageGalleryComponent = ({ node, deleteNode, updateAttributes }: any) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  
  // Parse images - handle both array and string formats
  let images: string[] = []
  const rawImages = node.attrs.images
  if (Array.isArray(rawImages)) {
    images = rawImages
  } else if (typeof rawImages === 'string') {
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(rawImages)
      images = Array.isArray(parsed) ? parsed : []
    } catch {
      // If not valid JSON, try splitting by comma (legacy format)
      images = rawImages.split(',').filter((s: string) => s.trim().length > 0)
    }
  }
  
  const handleDeleteImage = (indexToDelete: number) => {
    const newImages = images.filter((_, i) => i !== indexToDelete)
    if (newImages.length === 0) {
      deleteNode()
    } else {
      updateAttributes({ images: newImages })
    }
  }

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedIndex(prev => {
      if (prev === null) return null
      return (prev + 1) % images.length
    })
  }, [images.length])

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedIndex(prev => {
      if (prev === null) return null
      return (prev - 1 + images.length) % images.length
    })
  }, [images.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'Escape') setSelectedIndex(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, handleNext, handlePrev])
  
  if (images.length === 0) {
    return null
  }

  return (
    <NodeViewWrapper className="block w-full my-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((src: string, index: number) => (
          <ImageThumbnail 
            key={index} 
            src={src} 
            onClick={() => setSelectedIndex(index)}
            onDelete={() => handleDeleteImage(index)}
          />
        ))}
      </div>
      
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center focus:outline-none">
          {selectedIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center" onClick={() => setSelectedIndex(null)}>
              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/10 backdrop-blur-sm transition-all hover:scale-110"
                    onClick={handlePrev}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/10 backdrop-blur-sm transition-all hover:scale-110"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}

              {/* Image Container */}
              <div 
                className="relative max-w-full max-h-full flex items-center justify-center px-20 py-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={images[selectedIndex]} 
                  alt={`Gallery image ${selectedIndex + 1}`}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
                
                {/* Counter Badge */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-md text-sm font-medium border border-white/10">
                  {selectedIndex + 1} / {images.length}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </NodeViewWrapper>
  )
}



// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AudioComponent = ({ node, deleteNode }: any) => {
  return (
    <NodeViewWrapper className="block w-full my-3">
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-3 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-colors">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20 shrink-0">
          <Mic className="h-5 w-5 text-purple-400" />
        </div>
        <audio controls src={node.attrs.src} className="flex-1 h-10" />
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10 shrink-0 transition-colors"
          onClick={() => deleteNode()}
          title="Delete audio"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </NodeViewWrapper>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FileAttachmentComponent = ({ node, deleteNode }: any) => {
  const fileName = node.attrs.fileName || 'document'
  const fileSize = node.attrs.fileSize
  const fileUrl = node.attrs.href
  
  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (['pdf'].includes(ext || '')) return '📄'
    if (['doc', 'docx'].includes(ext || '')) return '📝'
    if (['xls', 'xlsx'].includes(ext || '')) return '📊'
    if (['zip', 'rar', '7z'].includes(ext || '')) return '📦'
    if (['txt'].includes(ext || '')) return '📃'
    return '📎'
  }
  
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  
  return (
    <NodeViewWrapper className="block w-full my-3">
      <div className="group flex items-center gap-3 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 p-3 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/20 shrink-0 text-2xl">
          {getFileIcon(fileName)}
        </div>
        <div className="flex-1 min-w-0">
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-medium truncate block transition-colors"
          >
            {fileName}
          </a>
          {fileSize && (
            <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(fileSize)}</p>
          )}
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10 shrink-0 transition-colors opacity-0 group-hover:opacity-100"
          onClick={() => deleteNode()}
          title="Delete file"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </NodeViewWrapper>
  )
}

const AudioExtension = Node.create({
  name: 'audio',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'audio',
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['audio', mergeAttributes(HTMLAttributes, { controls: true })]
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(AudioComponent)
  },
})

const FileAttachmentExtension = Node.create({
  name: 'fileAttachment',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      href: {
        default: null,
      },
      fileName: {
        default: null,
      },
      fileSize: {
        default: null,
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-file-attachment]',
        getAttrs: (element) => {
          const el = element as HTMLElement
          return {
            href: el.getAttribute('data-href'),
            fileName: el.getAttribute('data-filename'),
            fileSize: el.getAttribute('data-filesize') ? parseInt(el.getAttribute('data-filesize')!) : null,
          }
        },
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-file-attachment': 'true',
      'data-href': HTMLAttributes.href,
      'data-filename': HTMLAttributes.fileName,
      'data-filesize': HTMLAttributes.fileSize,
    })]
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentComponent)
  },
})

const ImageGalleryExtension = Node.create({
  name: 'imageGallery',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      images: {
        default: [],
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-image-gallery]',
        getAttrs: (element) => {
          const el = element as HTMLElement
          const imagesStr = el.getAttribute('data-images')
          console.log('Parsing gallery, raw data-images:', imagesStr)
          
          // Fallback: try to get from 'images' attribute if data-images fails
          if (!imagesStr) {
            const legacyAttr = el.getAttribute('images')
            console.log('Trying legacy images attribute:', legacyAttr)
            if (legacyAttr) {
              // Old format was comma-separated URLs
              return { images: legacyAttr.split(',') }
            }
          }
          
          try {
            const decoded = imagesStr?.replace(/&quot;/g, '"')
            const parsed = decoded ? JSON.parse(decoded) : []
            console.log('Parsed images:', parsed)
            return { images: parsed }
          } catch (error) {
            console.error('Failed to parse images:', error, 'Raw:', imagesStr)
            // Last resort: try to extract from the partial JSON
            const match = imagesStr?.match(/\[(.*?)\]/)
            if (match) {
              try {
                const urls = match[0].replace(/&quot;/g, '"')
                const parsed = JSON.parse(urls)
                console.log('Recovered images from partial JSON:', parsed)
                return { images: parsed }
              } catch {
                return { images: [] }
              }
            }
            return { images: [] }
          }
        },
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    // We need to be careful with how we serialize the images array
    // We want to ensure it's a valid JSON string that can be parsed back
    const images = HTMLAttributes.images || []
    const imagesJson = JSON.stringify(images).replace(/"/g, '&quot;')
    
    // Remove 'images' from HTMLAttributes to avoid duplicate/conflicting attribute
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { images: _, ...otherAttrs } = HTMLAttributes
    
    return ['div', mergeAttributes(otherAttrs, { 
      'data-image-gallery': 'true',
      'data-images': imagesJson,
    })]
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(ImageGalleryComponent)
  },
})

// Helper function to detect if text is RTL (Arabic, Hebrew, Persian, etc.)
const isRTL = (text: string): boolean => {
  const rtlRegex = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/
  return rtlRegex.test(text)
}

// HighlightCard component for non-editable quote block with inline note
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HighlightCard = ({ node, deleteNode, updateAttributes }: any) => {
  const text = node.attrs.text || ''
  const userNote = node.attrs.userNote || ''
  const isTextRTL = isRTL(text)
  const [localNote, setLocalNote] = useState(userNote)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const latestNoteRef = useRef(localNote)
  const updateAttributesRef = useRef(updateAttributes)
  
  // Keep refs updated
  useEffect(() => {
    latestNoteRef.current = localNote
  }, [localNote])

  useEffect(() => {
    updateAttributesRef.current = updateAttributes
  }, [updateAttributes])
  
  // Focus input when component mounts if no note exists
  useEffect(() => {
    if (!userNote && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
        setIsFocused(true)
      }, 100)
    }
  }, [userNote])

  // Auto-resize textarea on mount and when content changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
    }
  }, [localNote])

  // Cleanup timeout and flush pending save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        // Flush pending save
        updateAttributesRef.current({ userNote: latestNoteRef.current })
      }
    }
  }, [])
  
  const handleClick = () => {
    // Dispatch custom event for navigation
    window.dispatchEvent(new CustomEvent('quote-label-click', { detail: { text } }))
  }
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const confirmDelete = window.confirm(`Delete this highlight?\n\n"${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`)
    if (confirmDelete) {
      // Dispatch custom event for deletion
      window.dispatchEvent(new CustomEvent('quote-label-delete', { detail: { text } }))
      deleteNode()
    }
  }
  
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = e.target.value
    setLocalNote(newNote)
    
    // Debounce updateAttributes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      updateAttributesRef.current({ userNote: newNote })
      saveTimeoutRef.current = null
    }, 500)
    
    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Delete the whole highlight when backspace/delete is pressed on empty note
    if ((e.key === 'Backspace' || e.key === 'Delete') && localNote === '') {
      e.preventDefault()
      deleteNode()
    }
  }
  
  return (
    <NodeViewWrapper as="div" className="my-6 w-full">
      <div 
        className={cn(
          "group relative w-full rounded-xl overflow-hidden transition-all duration-200",
          "bg-[#121212] border border-white/10",
          isFocused ? "ring-1 ring-amber-500/50 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]" : "hover:border-white/20"
        )}
        data-quote-text={text}
      >
        {/* Accent Bar */}
        <div className={cn(
          "absolute top-0 bottom-0 w-1 bg-amber-500",
          isTextRTL ? "right-0" : "left-0"
        )} />
        
        <div className={cn(
          "flex flex-col p-4",
          isTextRTL ? "pr-5 pl-4" : "pl-5 pr-4"
        )}>
          {/* Header: Highlight Text + Actions */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div 
              className={cn(
                "text-[15px] text-[#e0e0e0] leading-relaxed font-medium opacity-90",
                isTextRTL && "text-right"
              )}
              dir={isTextRTL ? "rtl" : "ltr"}
            >
              "{text}"
            </div>
            
            {/* Actions - Visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
              <button
                onClick={handleClick}
                className="p-1.5 text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors"
                title="Go to text in document"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                title="Delete highlight"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          
          {/* Divider */}
          <div className="h-px w-full bg-white/5 mb-3" />
          
          {/* Note Input */}
          <textarea
            ref={inputRef}
            value={localNote}
            onChange={handleNoteChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Add your thoughts..."
            className={cn(
              "w-full bg-transparent text-[14px] text-gray-300 leading-relaxed",
              "placeholder:text-gray-600 placeholder:italic",
              "resize-none focus:outline-none",
              "min-h-[80px]"
            )}
            dir={isRTL(localNote) ? "rtl" : "ltr"}
            spellCheck={false}
          />
        </div>
      </div>
    </NodeViewWrapper>
  )
}

// QuoteLabel extension - non-editable block node for document highlights
const QuoteLabelExtension = Node.create({
  name: 'quoteLabel',
  group: 'block',
  atom: false, // Allow updates to attributes
  
  addAttributes() {
    return {
      text: {
        default: '',
      },
      userNote: {
        default: '',
      },
    }
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-quote-label]',
        getAttrs: (element) => {
          const el = element as HTMLElement
          return { 
            text: el.getAttribute('data-quote-text') || el.textContent?.replace(/^"|"$/g, '') || '',
            userNote: el.getAttribute('data-user-note') || ''
          }
        },
      },
      // Also support old span format for backwards compatibility
      {
        tag: 'span[data-quote-label]',
        getAttrs: (element) => {
          const el = element as HTMLElement
          return { 
            text: el.getAttribute('data-quote-text') || el.textContent?.replace(/^"|"$/g, '') || '',
            userNote: ''
          }
        },
      },
    ]
  },
  
  renderHTML({ HTMLAttributes }) {
    const text = HTMLAttributes.text || ''
    const userNote = HTMLAttributes.userNote || ''
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-quote-label': 'true',
      'data-quote-text': text,
      'data-user-note': userNote,
      class: 'quote-label-node',
    }), `"${text}"`]
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(HighlightCard)
  },
})

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
  onHighlightDeleted?: (highlightText: string) => void
  onNavigateToHighlight?: (text: string) => void
  highlightNotes?: Map<string, string> // Map of highlight text -> user note
}

export function RichTextEditor({ content, onChange, editable = true, onHighlightDeleted, onNavigateToHighlight, highlightNotes }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [hoveredHighlight, setHoveredHighlight] = useState<{ text: string; note: string; x: number; y: number } | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const editorRef = useRef<HTMLDivElement>(null)
  const onHighlightDeletedRef = useRef(onHighlightDeleted)
  const onNavigateToHighlightRef = useRef(onNavigateToHighlight)
  
  // Keep refs updated
  useEffect(() => {
    onHighlightDeletedRef.current = onHighlightDeleted
    onNavigateToHighlightRef.current = onNavigateToHighlight
  }, [onHighlightDeleted, onNavigateToHighlight])

  // Store highlightNotes in a ref for event handlers
  const highlightNotesRef = useRef(highlightNotes)
  useEffect(() => {
    highlightNotesRef.current = highlightNotes
  }, [highlightNotes])

  // Listen for custom events from QuoteLabel components
  useEffect(() => {
    const handleQuoteClick = (e: CustomEvent<{ text: string }>) => {
      if (onNavigateToHighlightRef.current) {
        onNavigateToHighlightRef.current(e.detail.text)
      }
    }
    
    const handleQuoteDelete = (e: CustomEvent<{ text: string }>) => {
      if (onHighlightDeletedRef.current) {
        onHighlightDeletedRef.current(e.detail.text)
      }
    }
    
    window.addEventListener('quote-label-click', handleQuoteClick as EventListener)
    window.addEventListener('quote-label-delete', handleQuoteDelete as EventListener)
    
    return () => {
      window.removeEventListener('quote-label-click', handleQuoteClick as EventListener)
      window.removeEventListener('quote-label-delete', handleQuoteDelete as EventListener)
    }
  }, [])

  // Handle hover on highlights to show tooltip
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('quote-highlight') || target.closest('.quote-highlight')) {
        const highlightEl = target.classList.contains('quote-highlight') ? target : target.closest('.quote-highlight') as HTMLElement
        if (highlightEl && highlightNotesRef.current) {
          const highlightText = highlightEl.textContent || ''
          const note = highlightNotesRef.current.get(highlightText)
          if (note) {
            const rect = highlightEl.getBoundingClientRect()
            setHoveredHighlight({
              text: highlightText,
              note,
              x: rect.left + rect.width / 2,
              y: rect.bottom + 8
            })
          }
        }
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('quote-highlight') || target.closest('.quote-highlight')) {
        setHoveredHighlight(null)
      }
    }

    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Disable built-in extensions that we configure separately
      }),
      Underline,
      TaskList,
      AudioExtension,
      FileAttachmentExtension,
      ImageGalleryExtension,
      QuoteLabelExtension,
      TaskItem.configure({
        nested: true,
      }),
      Highlight.configure({
        multicolor: false,
        HTMLAttributes: {
          class: 'quote-highlight',
        },
      }),
      Image.extend({
        addNodeView() {
          return ReactNodeViewRenderer(ImageComponent)
        },
      }).configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 hover:underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Write your notes here...',
      }),
    ],
    content,
    editable,
    autofocus: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-2 prose-p:leading-relaxed prose-li:my-0 prose-li:leading-tight prose-ul:my-2 prose-ol:my-2 prose-headings:my-4 prose-headings:font-semibold [&_li>p]:my-0 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-500/5 prose-blockquote:py-1',
        tabindex: '0',
      },
      handleDOMEvents: {
        focus: () => {
          return false
        },
        keydown: (view, event) => {
          const { state } = view
          const { selection } = state
          const { $from, $to } = selection
          
          // Check if cursor is inside a highlight mark
          const marks = $from.marks()
          const highlightMark = marks.find(m => m.type.name === 'highlight')
          
          // If inside a highlight, only allow backspace/delete (with confirmation)
          // Block all other input
          if (highlightMark) {
            // Allow navigation keys
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Escape', 'Tab'].includes(event.key)) {
              return false
            }
            
            // Handle delete
            if (event.key === 'Backspace' || event.key === 'Delete') {
              event.preventDefault()
              
              // Find the extent of the highlight
              let start = $from.pos
              let end = $from.pos
              
              while (start > 0) {
                const $pos = state.doc.resolve(start - 1)
                if (!$pos.marks().some(m => m.type.name === 'highlight')) break
                start--
              }
              
              while (end < state.doc.content.size) {
                const $pos = state.doc.resolve(end)
                if (!$pos.marks().some(m => m.type.name === 'highlight')) break
                end++
              }
              
              const highlightText = state.doc.textBetween(start, end)
              
              const confirmDelete = window.confirm(`Delete this highlight?\n\n"${highlightText.substring(0, 100)}${highlightText.length > 100 ? '...' : ''}"`)
              
              if (confirmDelete) {
                // Find the parent paragraph and delete the entire paragraph
                const $start = state.doc.resolve(start)
                const parentStart = $start.before($start.depth)
                const parentEnd = $start.after($start.depth)
                
                // Delete the paragraph containing the highlight
                const tr = state.tr.delete(parentStart, parentEnd)
                view.dispatch(tr)
                
                // Notify parent about deleted highlight
                if (onHighlightDeletedRef.current && highlightText) {
                  onHighlightDeletedRef.current(highlightText)
                }
              }
              
              return true
            }
            
            // Block all other input when inside highlight
            event.preventDefault()
            return true
          }
          
          // Check if we're about to type/delete into a highlight
          if (event.key === 'Backspace' && $from.pos > 0) {
            const posBefore = $from.pos - 1
            const $posBefore = state.doc.resolve(posBefore)
            const marksBefore = $posBefore.marks()
            if (marksBefore.some(m => m.type.name === 'highlight')) {
              event.preventDefault()
              
              // Find the extent of the highlight
              let start = posBefore
              let end = posBefore
              
              while (start > 0) {
                const $pos = state.doc.resolve(start - 1)
                if (!$pos.marks().some(m => m.type.name === 'highlight')) break
                start--
              }
              
              while (end < state.doc.content.size) {
                const $pos = state.doc.resolve(end)
                if (!$pos.marks().some(m => m.type.name === 'highlight')) break
                end++
              }
              
              const highlightText = state.doc.textBetween(start, end)
              
              const confirmDelete = window.confirm(`Delete this highlight?\n\n"${highlightText.substring(0, 100)}${highlightText.length > 100 ? '...' : ''}"`)
              
              if (confirmDelete) {
                const $start = state.doc.resolve(start)
                const parentStart = $start.before($start.depth)
                const parentEnd = $start.after($start.depth)
                const tr = state.tr.delete(parentStart, parentEnd)
                view.dispatch(tr)
                
                if (onHighlightDeletedRef.current && highlightText) {
                  onHighlightDeletedRef.current(highlightText)
                }
              }
              
              return true
            }
          }
          
          return false
        },
      },
    },
  })

  // Sync editor content when the content prop changes (important for switching between documents)
  // Only sync when document changes, not during typing
  const lastSyncedContent = useRef(content)
  useEffect(() => {
    if (editor && content !== lastSyncedContent.current) {
      // Only update if the content is significantly different (not just whitespace)
      const currentHTML = editor.getHTML()
      if (content !== currentHTML) {
        // Use queueMicrotask to avoid flushSync error during React render
        queueMicrotask(() => {
          editor.commands.setContent(content || '')
          lastSyncedContent.current = content
        })
      }
    }
  }, [editor, content])

  if (!editor) {
    return null
  }

  const uploadFile = async (file: File) => {
    if (!editor) return
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'file'
      const filePath = `${type}s/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('note_assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('note_assets')
        .getPublicUrl(filePath)

      if (type === 'image') {
        const content = `<img src="${publicUrl}" alt="${file.name}" /><p></p>`
        console.log('Inserting image:', publicUrl)
        editor.chain().focus().insertContent(content).run()
        console.log('Editor HTML after insert:', editor.getHTML())
      } else if (type === 'audio') {
        editor.chain().focus().insertContent([
          { type: 'audio', attrs: { src: publicUrl } },
          { type: 'paragraph' }
        ]).run()
      } else {
        editor.chain().focus().insertContent([
          { type: 'fileAttachment', attrs: { href: publicUrl, fileName: file.name, fileSize: file.size } },
          { type: 'paragraph' }
        ]).run()
      }
      
      toast.success(`Uploaded ${file.name}`)
    } catch (error) {
      console.error(error)
      toast.error(`Failed to upload ${file.name}`)
    }
  }

  const uploadImagesAsGallery = async (files: File[]) => {
    if (!editor) return
    
    try {
      const uploadedUrls: string[] = []
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `images/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('note_assets')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('note_assets')
          .getPublicUrl(filePath)
        
        uploadedUrls.push(publicUrl)
      }
      
      // Create gallery container with all images - use proper JSON encoding
      const imagesJson = JSON.stringify(uploadedUrls).replace(/"/g, '&quot;')
      const galleryContent = `<div data-image-gallery="true" data-images="${imagesJson}"></div><p></p>`
      console.log('Inserting gallery with', uploadedUrls.length, 'images')
      console.log('Gallery content:', galleryContent)
      editor.chain().focus().insertContent(galleryContent).run()
      console.log('Editor HTML after gallery insert:', editor.getHTML())
      
      toast.success(`Uploaded ${files.length} images`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to upload images')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' })
        await uploadFile(file)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.error('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    console.log('Files selected:', files.length)
    if (files.length === 0) return

    setIsUploading(true)
    try {
      const imageFiles = files.filter(f => f.type.startsWith('image/'))
      const otherFiles = files.filter(f => !f.type.startsWith('image/'))
      
      console.log('Image files:', imageFiles.length, 'Other files:', otherFiles.length)
      
      // Upload images as gallery if multiple, otherwise individually
      if (imageFiles.length > 1) {
        console.log('Uploading as gallery')
        await uploadImagesAsGallery(imageFiles)
      } else if (imageFiles.length === 1) {
        console.log('Uploading single image')
        await uploadFile(imageFiles[0])
      }
      
      // Upload other files individually
      for (const file of otherFiles) {
        await uploadFile(file)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (editable) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (!editable || !editor) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    // Try to set cursor position to where the drop happened
    // This prevents replacing selected content (like a gallery) if it was selected
    try {
      const coordinates = { left: e.clientX, top: e.clientY }
      const pos = editor.view.posAtCoords(coordinates)
      if (pos) {
        editor.commands.setTextSelection(pos.pos)
      }
    } catch (err) {
      console.error('Failed to set drop position:', err)
    }

    setIsUploading(true)
    try {
      const imageFiles = files.filter(f => f.type.startsWith('image/'))
      const otherFiles = files.filter(f => !f.type.startsWith('image/'))
      
      // Upload images as gallery if multiple, otherwise individually
      if (imageFiles.length > 1) {
        await uploadImagesAsGallery(imageFiles)
      } else if (imageFiles.length === 1) {
        await uploadFile(imageFiles[0])
      }
      
      // Upload other files individually
      for (const file of otherFiles) {
        await uploadFile(file)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const ToolbarButton = ({ 
    isActive, 
    onClick, 
    children,
    disabled = false
  }: { 
    isActive: boolean
    onClick: () => void
    children: React.ReactNode
    disabled?: boolean
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 w-8 p-0 hover:bg-white/10 hover:text-white",
        isActive ? "bg-white/20 text-white" : "text-gray-400"
      )}
    >
      {children}
    </Button>
  )

  return (
    <div 
      className="flex flex-col h-full relative"
      ref={editorRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && editable && (
        <div className="absolute inset-0 z-50 bg-blue-500/10 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Paperclip className="h-12 w-12 text-blue-400 mx-auto mb-2" />
            <p className="text-lg font-semibold text-blue-400">Drop files here</p>
            <p className="text-sm text-gray-400 mt-1">Images, audio, and documents supported</p>
          </div>
        </div>
      )}

      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 shrink-0 bg-[#050505]">
          <ToolbarButton
            isActive={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          
          <div className="w-px h-6 bg-white/10 mx-1" />

          <ToolbarButton
            isActive={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-white/10 mx-1" />

          <ToolbarButton
            isActive={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive('taskList')}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >
            <CheckSquare className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-white/10 mx-1" />

          <ToolbarButton
            isActive={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            isActive={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <div className="w-px h-6 bg-white/10 mx-1" />

          <ToolbarButton
            isActive={false}
            onClick={() => {
              console.log('Paperclip button clicked')
              console.log('File input ref:', fileInputRef.current)
              fileInputRef.current?.click()
            }}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
          </ToolbarButton>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.7z"
            onChange={(e) => {
              console.log('Input onChange triggered', e.target.files?.length)
              handleFileSelect(e)
            }}
          />
        </div>
      )}
      <div 
        className="flex-1 overflow-y-auto relative cursor-text"
        onClick={(e) => {
          // Only focus if clicking directly on the container, not on editor content
          if (editor && editable && e.target === e.currentTarget) {
            editor.commands.focus('end')
          }
        }}
      >
        {editable && !content && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <div className="text-center text-gray-600">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Start writing or drag & drop files here</p>
            </div>
          </div>
        )}
        <EditorContent 
          editor={editor} 
          className="h-full min-h-[300px] [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:h-full [&_.ProseMirror]:cursor-text [&_.ProseMirror]:outline-none [&_.ProseMirror]:p-4" 
        />
      </div>

      {/* Telegram-style Mic Button */}
      {editable && (
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isUploading}
          className={cn(
            "absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-20",
            isRecording 
              ? "bg-red-500 hover:bg-red-600 animate-pulse" 
              : "bg-blue-500 hover:bg-blue-600"
          )}
        >
          {isRecording ? (
            <Square className="h-6 w-6 text-white fill-current" />
          ) : (
            <Mic className="h-7 w-7 text-white" />
          )}
        </button>
      )}

      {/* Highlight Note Tooltip */}
      {hoveredHighlight && (
        <div
          className="fixed z-50 max-w-xs px-3 py-2 bg-[#2d332b] border border-amber-500/30 rounded-lg shadow-lg pointer-events-none"
          style={{
            left: hoveredHighlight.x,
            top: hoveredHighlight.y,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="flex items-start gap-2">
            <div className="w-1 h-full bg-amber-500 rounded-full shrink-0" />
            <p className="text-sm text-gray-300">{hoveredHighlight.note}</p>
          </div>
        </div>
      )}
    </div>
  )
}
