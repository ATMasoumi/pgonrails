"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Loader2, FileText, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/RichTextEditor'
import { updateNote, removeDocumentHighlight } from '@/app/documents/actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface NoteSidePanelProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  initialNote?: string | null
  title: string
  pendingNoteText?: string | null
  onNoteTextAdded?: () => void
  onNavigateToText?: (text: string) => void
  onHighlightDeleted?: (text: string) => void
  onNoteChange?: (noteContent: string) => void
}

export function NoteSidePanel({ isOpen, onClose, documentId, initialNote, title, pendingNoteText, onNoteTextAdded, onNavigateToText, onHighlightDeleted, onNoteChange }: NoteSidePanelProps) {
  const [note, setNote] = useState(initialNote || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | 'idle'>('idle')
  const [currentDocId, setCurrentDocId] = useState(documentId)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedNoteRef = useRef(initialNote || '')
  const pendingNoteTextProcessedRef = useRef<string | null>(null)

  // Auto-save function
  const saveNote = useCallback(async (noteContent: string) => {
    if (noteContent === lastSavedNoteRef.current) return
    
    setIsSaving(true)
    setSaveStatus('saving')
    
    try {
      await updateNote(documentId, noteContent)
      lastSavedNoteRef.current = noteContent
      setSaveStatus('saved')
      // Reset to idle after showing saved status
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Auto-save error:', error)
      setSaveStatus('error')
      toast.error('Failed to save note. Will retry...')
      // Retry after 5 seconds
      setTimeout(() => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveNote(noteContent)
      }, 5000)
    } finally {
      setIsSaving(false)
    }
  }, [documentId])

  // Reset note when document changes - this is critical for switching between nodes
  useEffect(() => {
    if (documentId !== currentDocId) {
      setNote(initialNote || '')
      lastSavedNoteRef.current = initialNote || ''
      setSaveStatus('idle')
      setCurrentDocId(documentId)
      pendingNoteTextProcessedRef.current = null
    }
  }, [documentId, initialNote, currentDocId])

  // Set initial note when panel first opens
  useEffect(() => {
    if (isOpen && !note && initialNote) {
      setNote(initialNote)
      lastSavedNoteRef.current = initialNote
    }
  }, [isOpen, initialNote])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Handle pending note text from selection - add as block quote label
  useEffect(() => {
    if (pendingNoteText && pendingNoteText !== pendingNoteTextProcessedRef.current) {
      pendingNoteTextProcessedRef.current = pendingNoteText
      
      // Create the quote label HTML to insert into the note (as a block div)
      const quoteLabelHtml = `<div data-quote-label="true" data-quote-text="${pendingNoteText.replace(/"/g, '&quot;')}" class="quote-label-node">"${pendingNoteText}"</div>`
      
      // Append to note content
      const currentContent = note || ''
      const newContent = currentContent 
        ? `${currentContent}${quoteLabelHtml}`
        : quoteLabelHtml
      
      setNote(newContent)
      onNoteChange?.(newContent)
      
      // Trigger auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveNote(newContent)
      }, 1500)
      
      onNoteTextAdded?.()
    }
  }, [pendingNoteText, note, onNoteTextAdded, saveNote, onNoteChange])

  const handleNoteChange = (newNote: string) => {
    setNote(newNote)
    onNoteChange?.(newNote)
    
    // Debounced auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Only auto-save if content actually changed from last saved version
    if (newNote !== lastSavedNoteRef.current) {
      saveTimeoutRef.current = setTimeout(() => {
        saveNote(newNote)
      }, 1500) // 1.5 second debounce
    }
  }

  const handleClose = async () => {
    // Save any pending changes before closing
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // If there are unsaved changes, save them first
    if (note !== lastSavedNoteRef.current) {
      await saveNote(note)
    }
    
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleClose}
      />
      
      {/* Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[700px] bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-blue-900/10 to-purple-900/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20 shrink-0">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                {saveStatus === 'saving' && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <Check className="h-3 w-3 text-green-400" />
                    Saved
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <AlertCircle className="h-3 w-3 text-red-400" />
                    Save failed, retrying...
                  </>
                )}
                {saveStatus === 'idle' && 'Auto-saves as you type'}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose} 
            className="text-gray-400 hover:text-white hover:bg-white/10 shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Rich Text Editor */}
          <div className="flex-1 min-h-0 overflow-auto">
            <RichTextEditor 
              key={documentId}
              content={note} 
              onChange={handleNoteChange}
              onHighlightDeleted={async (text) => {
                // Remove from database
                try {
                  await removeDocumentHighlight(documentId, text)
                } catch (err) {
                  console.error('Failed to remove highlight from database:', err)
                }
                // Notify parent to update document view
                onHighlightDeleted?.(text)
              }}
              onNavigateToHighlight={onNavigateToText}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end items-center bg-[#050505]">
          <Button 
            onClick={handleClose} 
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-white/10"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Close'
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
