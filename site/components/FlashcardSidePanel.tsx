"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Layers, ChevronLeft, ChevronRight, RotateCcw, Loader2, CheckCircle, Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { updateFlashcardsMastered } from '@/app/documents/actions'

export interface Flashcard {
  front: string
  back: string
}

interface FlashcardSidePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  cards: Flashcard[]
  documentId?: string
  initialMasteredIndices?: number[]
  onGenerateNew?: () => void
  onMasteredChange?: (indices: number[]) => void
  isGenerating?: boolean
}

export function FlashcardSidePanel({ 
  isOpen, 
  onClose, 
  title, 
  cards,
  documentId,
  initialMasteredIndices,
  onGenerateNew,
  onMasteredChange,
  isGenerating 
}: FlashcardSidePanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set())
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([])
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingSaveRef = useRef<Set<number> | null>(null)

  // Reset state when panel opens or cards change
  useEffect(() => {
    if (isOpen && cards.length > 0) {
      setCurrentIndex(0)
      setIsFlipped(false)
      // Initialize with saved mastered indices if available
      setMasteredCards(new Set(initialMasteredIndices || []))
      setShuffledIndices(cards.map((_, i) => i))
    }
  }, [isOpen, cards, initialMasteredIndices])

  // Save mastered cards to database (debounced)
  const saveMasteredCards = useCallback((mastered: Set<number>) => {
    if (!documentId) return
    
    pendingSaveRef.current = mastered

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Debounce the save by 1 second
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateFlashcardsMastered(documentId, Array.from(mastered))
        pendingSaveRef.current = null
      } catch (error) {
        console.error('Failed to save mastered cards:', error)
      }
    }, 1000)
  }, [documentId])

  // Flush pending save when panel closes
  useEffect(() => {
    if (!isOpen && pendingSaveRef.current && documentId) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      updateFlashcardsMastered(documentId, Array.from(pendingSaveRef.current))
        .catch(err => console.error('Failed to flush save:', err))
      pendingSaveRef.current = null
    }
  }, [isOpen, documentId])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false)
      setTimeout(() => setCurrentIndex(currentIndex + 1), 150)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false)
      setTimeout(() => setCurrentIndex(currentIndex - 1), 150)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleMarkMastered = () => {
    const newMastered = new Set(masteredCards)
    if (newMastered.has(shuffledIndices[currentIndex])) {
      newMastered.delete(shuffledIndices[currentIndex])
    } else {
      newMastered.add(shuffledIndices[currentIndex])
    }
    setMasteredCards(newMastered)
    
    // Notify parent of change
    if (onMasteredChange) {
      onMasteredChange(Array.from(newMastered))
    }

    // Save to database
    saveMasteredCards(newMastered)
  }

  const handleShuffle = () => {
    const newIndices = [...shuffledIndices].sort(() => Math.random() - 0.5)
    setShuffledIndices(newIndices)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setMasteredCards(new Set())
    setShuffledIndices(cards.map((_, i) => i))
    
    // Notify parent
    if (onMasteredChange) {
      onMasteredChange([])
    }

    // Save empty mastered state to database
    saveMasteredCards(new Set())
  }

  const currentCard = cards[shuffledIndices[currentIndex]]
  const isMastered = masteredCards.has(shuffledIndices[currentIndex])
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0
  const masteredCount = masteredCards.size

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[600px] bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-cyan-900/10 to-blue-900/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-500/20 shrink-0">
              <Layers className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
              <p className="text-xs text-gray-400">
                {isGenerating ? 'Generating flashcards...' : `${cards.length} cards • ${masteredCount} mastered`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onGenerateNew && !isGenerating && cards.length > 0 && (
              <Button 
                onClick={onGenerateNew} 
                variant="ghost" 
                size="sm" 
                className="text-xs text-gray-400 hover:text-white"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                New Cards
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="text-gray-400 hover:text-white hover:bg-white/10 shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <p>Generating flashcards...</p>
            </div>
          ) : cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <Layers className="w-12 h-12 opacity-50" />
              <p>No flashcards available</p>
            </div>
          ) : (
            <div className="flex flex-col items-center p-6">
              {/* Progress Bar */}
              <div className="w-full mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Card {currentIndex + 1} of {cards.length}</span>
                  <span className="text-cyan-400">{masteredCount} mastered</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Card Navigation Dots */}
              <div className="flex gap-1.5 flex-wrap justify-center mb-6 max-w-full">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsFlipped(false)
                      setTimeout(() => setCurrentIndex(i), 150)
                    }}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      i === currentIndex && "ring-2 ring-cyan-500 ring-offset-1 ring-offset-[#0A0A0A]",
                      masteredCards.has(shuffledIndices[i]) 
                        ? "bg-emerald-500" 
                        : i === currentIndex 
                          ? "bg-cyan-500" 
                          : "bg-white/20 hover:bg-white/40"
                    )}
                  />
                ))}
              </div>

              {/* Flashcard */}
              <div 
                className={cn(
                  "relative w-full max-w-md aspect-[4/3] cursor-pointer perspective-1000 mb-6",
                  isMastered && "ring-2 ring-emerald-500/50 rounded-2xl"
                )}
                onClick={handleFlip}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="w-full h-full"
                  >
                    <motion.div
                      className="w-full h-full relative"
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Front */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xl"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        {isMastered && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 px-2 py-1 bg-cyan-500/20 rounded-md">
                          <span className="text-xs font-medium text-cyan-400">Question</span>
                        </div>
                        <p className="text-xl font-medium text-white leading-relaxed">{currentCard?.front}</p>
                        <div className="absolute bottom-4 text-xs text-gray-500 flex items-center gap-1">
                          <span className="px-2 py-1 bg-white/5 rounded-full">Click to flip</span>
                        </div>
                      </div>

                      {/* Back */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-xl"
                        style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                      >
                        {isMastered && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-500/20 rounded-md">
                          <span className="text-xs font-medium text-emerald-400">Answer</span>
                        </div>
                        <p className="text-xl font-medium text-white leading-relaxed">{currentCard?.back}</p>
                      </div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="w-12 h-12 rounded-full bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-all shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                
                <Button
                  variant={isMastered ? "default" : "outline"}
                  onClick={handleMarkMastered}
                  className={cn(
                    "rounded-full px-6 py-3 h-auto font-medium transition-all shadow-lg",
                    isMastered 
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/50 shadow-emerald-900/30" 
                      : "bg-white/5 border-white/20 text-gray-300 hover:bg-cyan-500/20 hover:border-cyan-500/40 hover:text-cyan-300"
                  )}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {isMastered ? 'Mastered' : 'Mark as Mastered'}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentIndex === cards.length - 1}
                  className="w-12 h-12 rounded-full bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-all shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isGenerating && cards.length > 0 && (
          <div className="shrink-0 p-4 border-t border-white/10 flex justify-center gap-3 bg-[#050505]">
            <Button 
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="text-gray-300 border-white/20 bg-white/5 hover:text-white hover:bg-white/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Progress
            </Button>
            <Button 
              onClick={handleShuffle}
              variant="outline"
              size="sm"
              className="text-gray-300 border-white/20 bg-white/5 hover:text-white hover:bg-white/10"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
