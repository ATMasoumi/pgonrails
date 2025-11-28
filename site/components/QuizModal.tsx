"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { saveQuizAttempt } from "@/app/documents/actions"

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizModalProps {
  isOpen: boolean
  onClose: () => void
  questions: QuizQuestion[]
  quizId: string | null
  existingAnswers?: number[]
  onGenerateNew?: () => void
}

export function QuizModal({ isOpen, onClose, questions, quizId, existingAnswers, onGenerateNew }: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])

  // Reset and initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0)
      setIsFinished(false)
      
      if (existingAnswers && existingAnswers.length > 0) {
        setAnswers(existingAnswers)
        setSelectedAnswer(existingAnswers[0])
        setShowExplanation(true)
        
        // Calculate score
        let initialScore = 0
        questions.forEach((q, i) => {
          if (existingAnswers[i] === q.correctAnswer) initialScore++
        })
        setScore(initialScore)
      } else {
        setAnswers([])
        setSelectedAnswer(null)
        setShowExplanation(false)
        setScore(0)
      }
    }
  }, [isOpen, existingAnswers, questions])

  // Update selected answer when question index changes in review mode
  const handleQuestionChange = (newIndex: number) => {
    setCurrentQuestionIndex(newIndex)
    if (existingAnswers && existingAnswers.length > 0) {
      setSelectedAnswer(existingAnswers[newIndex])
      setShowExplanation(true)
    } else {
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null || (existingAnswers && existingAnswers.length > 0)) return
    setSelectedAnswer(index)
    setShowExplanation(true)
    
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = index
    setAnswers(newAnswers)

    if (index === currentQuestion.correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      handleQuestionChange(currentQuestionIndex + 1)
    } else {
      if (!existingAnswers) {
        setIsFinished(true)
        if (quizId) {
          await saveQuizAttempt(quizId, score, questions.length, answers)
        }
      } else {
        // In review mode, reaching the end just shows the summary
        setIsFinished(true)
      }
    }
  }

  const handleReset = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setIsFinished(false)
    setAnswers([])
  }

  if (!questions || questions.length === 0) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#0A0A0A] border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-xl font-semibold">
              {isFinished ? "Quiz Completed" : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
            </DialogTitle>
            {existingAnswers && onGenerateNew && !isFinished && (
               <Button onClick={onGenerateNew} variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white h-auto py-1">
                 New Quiz
               </Button>
            )}
          </div>
        </DialogHeader>

        <div className="mt-4">
          {isFinished ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-4xl font-bold text-blue-400">{Math.round((score / questions.length) * 100)}%</div>
              <p className="text-gray-400">You got {score} out of {questions.length} questions correct.</p>
              <div className="flex gap-3 justify-center mt-4">
                {!existingAnswers && <Button onClick={handleReset}>Try Again</Button>}
                {onGenerateNew && (
                  <Button onClick={onGenerateNew} variant="outline" className="bg-transparent text-white border-white/10 hover:bg-white/5 hover:text-white">
                    Generate New Quiz
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-lg font-medium leading-relaxed">{currentQuestion.question}</p>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  let buttonStyle = "bg-white/5 hover:bg-white/10 border-white/10"
                  if (selectedAnswer !== null) {
                    if (index === currentQuestion.correctAnswer) {
                      buttonStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                    } else if (index === selectedAnswer) {
                      buttonStyle = "bg-red-500/20 border-red-500/50 text-red-400"
                    } else {
                      buttonStyle = "opacity-50"
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={cn(
                        "w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-center justify-between group",
                        buttonStyle
                      )}
                    >
                      <span>{option}</span>
                      {selectedAnswer !== null && index === currentQuestion.correctAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                      {selectedAnswer !== null && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </button>
                  )
                })}
              </div>

              {showExplanation && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm text-blue-300">
                    <span className="font-semibold">Explanation:</span> {currentQuestion.explanation}
                  </p>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleNext}>
                      {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
