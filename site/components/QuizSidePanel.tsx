"use client"

import { useState, useEffect } from 'react'
import { X, Brain, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, XCircle, Trophy, Target, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { saveQuizAttempt } from '@/app/documents/actions'
import { cn } from '@/lib/utils'

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizSidePanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  questions: QuizQuestion[]
  quizId: string | null
  existingAnswers?: number[]
  onGenerateNew?: () => void
  isGenerating?: boolean
}

export function QuizSidePanel({ 
  isOpen, 
  onClose, 
  title, 
  questions, 
  quizId, 
  existingAnswers, 
  onGenerateNew,
  isGenerating 
}: QuizSidePanelProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [isReviewMode, setIsReviewMode] = useState(false)

  // Reset and initialize state when panel opens or questions change
  useEffect(() => {
    if (isOpen && questions.length > 0) {
      setCurrentQuestionIndex(0)
      setIsFinished(false)
      
      if (existingAnswers && existingAnswers.length > 0) {
        setAnswers(existingAnswers)
        setSelectedAnswer(existingAnswers[0])
        setShowExplanation(true)
        setIsReviewMode(true)
        
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
        setIsReviewMode(false)
      }
    }
  }, [isOpen, existingAnswers, questions])

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null || isReviewMode) return
    setSelectedAnswer(index)
    setShowExplanation(true)
    
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = index
    setAnswers(newAnswers)

    if (index === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1)
    }
  }

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1
      setCurrentQuestionIndex(newIndex)
      if (isReviewMode && existingAnswers) {
        setSelectedAnswer(existingAnswers[newIndex])
        setShowExplanation(true)
      } else {
        setSelectedAnswer(null)
        setShowExplanation(false)
      }
    } else {
      setIsFinished(true)
      if (!isReviewMode && quizId) {
        await saveQuizAttempt(quizId, score, questions.length, answers)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1
      setCurrentQuestionIndex(newIndex)
      if (isReviewMode && existingAnswers) {
        setSelectedAnswer(existingAnswers[newIndex])
      } else {
        setSelectedAnswer(answers[newIndex] ?? null)
      }
      setShowExplanation(true)
    }
  }

  const handleReset = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setIsFinished(false)
    setAnswers([])
    setIsReviewMode(false)
  }

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionIndex(index)
    if (isReviewMode && existingAnswers) {
      setSelectedAnswer(existingAnswers[index])
      setShowExplanation(true)
    } else if (answers[index] !== undefined) {
      setSelectedAnswer(answers[index])
      setShowExplanation(true)
    } else {
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-400'
    if (percentage >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const scorePercentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0

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
          "fixed top-0 right-0 h-full w-full sm:w-[700px] bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/10 to-blue-900/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20 shrink-0">
              <Brain className="h-5 w-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
              <p className="text-xs text-gray-400">
                {isGenerating ? 'Generating quiz...' : `${questions.length} questions`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onGenerateNew && !isGenerating && (
              <Button 
                onClick={onGenerateNew} 
                variant="ghost" 
                size="sm" 
                className="text-xs text-gray-400 hover:text-white"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                New Quiz
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
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <p>Generating comprehensive quiz...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <Brain className="w-12 h-12 opacity-50" />
              <p>No quiz available</p>
            </div>
          ) : isFinished ? (
            /* Results View */
            <div className="p-6 space-y-6">
              <div className="text-center py-8 space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <Trophy className={cn("w-12 h-12", getScoreColor(scorePercentage))} />
                </div>
                <div className={cn("text-5xl font-bold", getScoreColor(scorePercentage))}>
                  {scorePercentage}%
                </div>
                <p className="text-gray-400">
                  You got <span className="text-white font-semibold">{score}</span> out of <span className="text-white font-semibold">{questions.length}</span> questions correct
                </p>
                
                {/* Performance breakdown */}
                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Performance Breakdown</h3>
                  <div className="flex justify-center gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-400">{score}</div>
                      <div className="text-xs text-gray-500">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{questions.length - score}</div>
                      <div className="text-xs text-gray-500">Incorrect</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                {!isReviewMode && (
                  <Button onClick={handleReset} variant="outline" className="bg-transparent border-white/10 hover:bg-white/5">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
                {onGenerateNew && (
                  <Button onClick={onGenerateNew} className="bg-purple-600 hover:bg-purple-700">
                    <Brain className="w-4 h-4 mr-2" />
                    Generate New Quiz
                  </Button>
                )}
              </div>

              {/* Question Review Grid */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Review Questions</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, i) => {
                    const answered = answers[i] !== undefined || (existingAnswers && existingAnswers[i] !== undefined)
                    const correct = answered && (answers[i] ?? existingAnswers?.[i]) === q.correctAnswer
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setIsFinished(false)
                          handleQuestionJump(i)
                        }}
                        className={cn(
                          "p-2 rounded-lg border text-sm font-medium transition-all",
                          correct 
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                            : "bg-red-500/20 border-red-500/50 text-red-400"
                        )}
                      >
                        {i + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Question View */
            <div className="p-6 space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <span className="text-gray-400">Score: {score}/{currentQuestionIndex + (selectedAnswer !== null ? 1 : 0)}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Navigation Pills */}
              <div className="flex gap-1.5 flex-wrap">
                {questions.map((q, i) => {
                  const answered = answers[i] !== undefined || (existingAnswers && existingAnswers[i] !== undefined)
                  const correct = answered && (answers[i] ?? existingAnswers?.[i]) === q.correctAnswer
                  const isCurrent = i === currentQuestionIndex
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handleQuestionJump(i)}
                      className={cn(
                        "w-8 h-8 rounded-full text-xs font-medium transition-all",
                        isCurrent && "ring-2 ring-purple-500",
                        !answered && !isCurrent && "bg-white/5 text-gray-500 hover:bg-white/10",
                        answered && correct && "bg-emerald-500/20 text-emerald-400",
                        answered && !correct && "bg-red-500/20 text-red-400"
                      )}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </div>

              {/* Question */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                  <p className="text-lg font-medium text-white leading-relaxed">
                    {currentQuestion?.question}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion?.options.map((option, index) => {
                  let buttonStyle = "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300"
                  const isSelected = selectedAnswer === index
                  const isCorrect = index === currentQuestion.correctAnswer
                  
                  if (selectedAnswer !== null) {
                    if (isCorrect) {
                      buttonStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                    } else if (isSelected) {
                      buttonStyle = "bg-red-500/20 border-red-500/50 text-red-300"
                    } else {
                      buttonStyle = "bg-white/5 border-white/5 text-gray-500"
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group",
                        buttonStyle
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border",
                          selectedAnswer === null 
                            ? "border-white/20 text-gray-400 group-hover:border-purple-500 group-hover:text-purple-400"
                            : isCorrect 
                              ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                              : isSelected 
                                ? "border-red-500/50 text-red-400 bg-red-500/10"
                                : "border-white/10 text-gray-600"
                        )}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {selectedAnswer !== null && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {selectedAnswer !== null && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {showExplanation && currentQuestion && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm text-blue-300 leading-relaxed">
                    <span className="font-semibold text-blue-200">💡 Explanation:</span>{' '}
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {!isGenerating && questions.length > 0 && !isFinished && (
          <div className="p-4 border-t border-white/10 flex justify-between items-center bg-[#050505]">
            <Button 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            {selectedAnswer !== null && (
              <Button 
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  <>
                    Finish Quiz
                    <Trophy className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
