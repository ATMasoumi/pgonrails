"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react'
import { motion } from 'framer-motion'

interface Flashcard {
  front: string
  back: string
}

interface FlashcardModalProps {
  isOpen: boolean
  onClose: () => void
  cards: Flashcard[]
}

export function FlashcardModal({ isOpen, onClose, cards }: FlashcardModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false)
      setTimeout(() => setCurrentIndex(currentIndex + 1), 200)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false)
      setTimeout(() => setCurrentIndex(currentIndex - 1), 200)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  if (!cards.length) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-[#0A0A0A] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Flashcards ({currentIndex + 1}/{cards.length})</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-8">
          <div 
            className="relative w-full aspect-[3/2] cursor-pointer perspective-1000"
            onClick={handleFlip}
          >
            <motion.div
              className="w-full h-full relative preserve-3d transition-all duration-500"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-zinc-900 border border-white/10 rounded-xl p-8 flex items-center justify-center text-center shadow-xl" style={{ backfaceVisibility: 'hidden' }}>
                <p className="text-xl font-medium">{cards[currentIndex].front}</p>
                <div className="absolute bottom-4 text-xs text-gray-500 flex items-center gap-1">
                  <RotateCw className="w-3 h-3" /> Click to flip
                </div>
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 backface-hidden bg-zinc-800 border border-white/10 rounded-xl p-8 flex items-center justify-center text-center shadow-xl"
                style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
              >
                <p className="text-xl font-medium">{cards[currentIndex].back}</p>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
