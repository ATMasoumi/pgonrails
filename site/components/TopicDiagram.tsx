"use client"

import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, Node, Edge, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import { TopicNode } from './TopicNode'
import { NoteSidePanel } from './NoteSidePanel'
import { ResourcesSidePanel } from './ResourcesSidePanel'
import { SummarySidePanel } from './SummarySidePanel'
import { QuizSidePanel, QuizQuestion } from './QuizSidePanel'
import { FlashcardSidePanel, Flashcard } from './FlashcardSidePanel'
import { ResourceData } from './ResourcesModal'
import { generateTopicContent, deleteTopic, generateQuiz, getLatestQuiz, generateFlashcards, getFlashcards, updateNodePosition, generatePodcast } from '@/app/documents/actions'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useTokenLimit } from '@/lib/hooks/use-token-limit'

const nodeWidth = 280
const nodeHeight = 100

const nodeTypes = { topicNode: TopicNode }

interface Document {
  id: string
  query: string
  content: string | null
  created_at: string
  parent_id: string | null
  user_id: string
  is_read?: boolean
  quizzes?: { id: string }[]
  podcasts?: { id: string }[]
  flashcards?: { id: string }[]
  resources?: { id: string }[]
  note?: string | null
  summary?: string | null
  position_x?: number
  position_y?: number
}

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  dagreGraph.setGraph({ rankdir: 'LR', ranksep: 150, nodesep: 50 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    if (node.data.hasPosition) {
      return node
    }

    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

interface TopicDiagramProps {
  documents: Document[]
  rootId?: string
  readOnly?: boolean
}

export function TopicDiagram({ documents, rootId, readOnly = false }: TopicDiagramProps) {
  const router = useRouter()
  const { handleTokenLimitError } = useTokenLimit()
  const [generatingNodes, setGeneratingNodes] = useState<Record<string, { type: 'subtopic' | 'explanation', startedAt: number }>>({})
  const [generatingPodcasts, setGeneratingPodcasts] = useState<Record<string, number>>({})
  
  // Track when each node was first seen (for animation)
  const nodeFirstSeenAt = useRef<Map<string, number>>(new Map())
  
  // Update seen nodes when documents change
  useEffect(() => {
    if (!documents) return
    
    const now = Date.now()
    let hasNewNodes = false
    
    documents.forEach(doc => {
      if (!nodeFirstSeenAt.current.has(doc.id)) {
        nodeFirstSeenAt.current.set(doc.id, now)
        hasNewNodes = true
      }
    })
    
    if (hasNewNodes) {
      console.log('TopicDiagram: New nodes detected, triggering re-render')
      // Force a re-render to pick up new isNew values
      router.refresh()
    }
  }, [documents, router])

  // Load generating state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('generatingNodes')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Check for timeouts (e.g. 5 minutes)
        const now = Date.now()
        const filtered = Object.entries(parsed).reduce((acc, [id, data]) => {
            // Handle legacy format (string) or new format (object)
            if (typeof data === 'string') {
                 // Legacy format, assume it's old and discard or keep with new timestamp?
                 // Let's discard legacy to be safe or give it a fresh timestamp
                 // acc[id] = { type: data as 'subtopic' | 'explanation', startedAt: now }
                 // Actually, if it's legacy, it might be stuck. Let's discard.
            } else if (typeof data === 'object' && data !== null && 'type' in data && 'startedAt' in data) {
                 const typedData = data as { type: 'subtopic' | 'explanation', startedAt: number }
                 if (now - typedData.startedAt < 5 * 60 * 1000) {
                     acc[id] = typedData
                 }
            }
            return acc
        }, {} as Record<string, { type: 'subtopic' | 'explanation', startedAt: number }>)
        setGeneratingNodes(filtered)
        
        // If we have pending generations, refresh to check if they are done
        if (Object.keys(filtered).length > 0) {
            router.refresh()
        }
      } catch (e) {
        console.error('Failed to parse generatingNodes from localStorage', e)
      }
    }

    const savedPodcasts = localStorage.getItem('generatingPodcasts')
    if (savedPodcasts) {
      try {
        const parsed = JSON.parse(savedPodcasts)
        // Check for timeouts (e.g. 5 minutes)
        const now = Date.now()
        const filtered = Object.entries(parsed).reduce((acc, [id, ts]) => {
            if (typeof ts === 'number' && now - ts < 5 * 60 * 1000) {
                acc[id] = ts
            }
            return acc
        }, {} as Record<string, number>)
        setGeneratingPodcasts(filtered)
      } catch (e) {
        console.error('Failed to parse generatingPodcasts from localStorage', e)
      }
    }
  }, [])

  // Polling fallback: If there are pending generations, poll every 2 seconds
  useEffect(() => {
    const hasPendingGenerations = Object.keys(generatingNodes).length > 0 || Object.keys(generatingPodcasts).length > 0
    
    if (!hasPendingGenerations) return
    
    console.log('TopicDiagram: Starting polling for pending generations')
    
    const pollInterval = setInterval(() => {
      console.log('TopicDiagram: Polling refresh...')
      router.refresh()
    }, 2000)
    
    return () => {
      console.log('TopicDiagram: Stopping polling')
      clearInterval(pollInterval)
    }
  }, [generatingNodes, generatingPodcasts, router])

  // Clean up generatingNodes based on actual document state
  useEffect(() => {
    // Debug logging
    if (Object.keys(generatingNodes).length > 0) {
        console.log('TopicDiagram: Checking updates for generating nodes:', generatingNodes)
        documents.forEach(doc => {
            if (generatingNodes[doc.id]) {
                console.log(`TopicDiagram: Doc ${doc.id} state:`, {
                    hasContent: !!doc.content,
                    contentLength: doc.content?.length,
                    hasChildren: documents.some(d => d.parent_id === doc.id)
                })
            }
        })
    }

    if (documents.length > 0) {
        setGeneratingNodes(prev => {
            const next = { ...prev }
            let changed = false
            
            documents.forEach(doc => {
                if (next[doc.id]?.type === 'explanation' && doc.content) {
                    console.log(`TopicDiagram: Cleaning up explanation for ${doc.id} - Content found`)
                    delete next[doc.id]
                    changed = true
                }

                if (next[doc.id]?.type === 'subtopic') {
                    const hasChildren = documents.some(d => d.parent_id === doc.id)
                    if (hasChildren) {
                        console.log(`TopicDiagram: Cleaning up subtopic for ${doc.id} - Children found`)
                        delete next[doc.id]
                        changed = true
                    }
                }
            })
            
            return changed ? next : prev
        })

        setGeneratingPodcasts(prev => {
            const next = { ...prev }
            let changed = false
            
            documents.forEach(doc => {
                if (next[doc.id] && doc.podcasts && doc.podcasts.length > 0) {
                    delete next[doc.id]
                    changed = true
                }
            })
            
            return changed ? next : prev
        })
    }
  }, [documents])

  // Save generating state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('generatingNodes', JSON.stringify(generatingNodes))
  }, [generatingNodes])

  useEffect(() => {
    localStorage.setItem('generatingPodcasts', JSON.stringify(generatingPodcasts))
  }, [generatingPodcasts])

  useEffect(() => {
    const channel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
        },
        (payload) => {
          console.log('Received realtime update:', payload)
          // Refresh immediately and again after a delay to ensure data is loaded
          router.refresh()
          setTimeout(() => {
            router.refresh()
          }, 500)
          setTimeout(() => {
            router.refresh()
          }, 1500)
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    const podcastChannel = supabase
      .channel('podcasts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'podcasts',
        },
        (payload) => {
          router.refresh()
          const docId = payload.new.document_id
          setGeneratingPodcasts(prev => {
            if (prev[docId]) {
              const next = { ...prev }
              delete next[docId]
              return next
            }
            return prev
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(podcastChannel)
    }
  }, [router])

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())
  const [notePanelState, setNotePanelState] = useState<{
    isOpen: boolean
    documentId: string
    initialNote: string | null
    title: string
  }>({
    isOpen: false,
    documentId: '',
    initialNote: '',
    title: ''
  })

  const [resourcesPanelState, setResourcesPanelState] = useState<{
    isOpen: boolean
    title: string
    resources: ResourceData | null
  }>({
    isOpen: false,
    title: '',
    resources: null
  })

  const [summaryPanelState, setSummaryPanelState] = useState<{
    isOpen: boolean
    title: string
    summary: string | null
    documentId: string
  }>({
    isOpen: false,
    title: '',
    summary: null,
    documentId: ''
  })

  const [quizPanelState, setQuizPanelState] = useState<{
    isOpen: boolean
    title: string
    documentId: string
    content: string | null
    questions: QuizQuestion[]
    quizId: string | null
    existingAnswers?: number[]
    isGenerating: boolean
  }>({
    isOpen: false,
    title: '',
    documentId: '',
    content: null,
    questions: [],
    quizId: null,
    existingAnswers: undefined,
    isGenerating: false
  })

  const [flashcardPanelState, setFlashcardPanelState] = useState<{
    isOpen: boolean
    title: string
    documentId: string
    content: string | null
    cards: Flashcard[]
    masteredIndices: number[]
    isGenerating: boolean
  }>({
    isOpen: false,
    title: '',
    documentId: '',
    content: null,
    cards: [],
    masteredIndices: [],
    isGenerating: false
  })

  const handleGenerationError = useCallback((error: unknown) => {
    console.error(error)
    if (!handleTokenLimitError(error)) {
      toast.error("An error occurred. Please try again.")
    }
  }, [handleTokenLimitError])

  const handleOpenNote = useCallback((id: string) => {
    const doc = documents.find(d => d.id === id)
    if (doc) {
      setNotePanelState({
        isOpen: true,
        documentId: id,
        initialNote: doc.note || '',
        title: doc.query
      })
    }
  }, [documents])

  const handleOpenResources = useCallback((title: string, resources: ResourceData) => {
    setResourcesPanelState({
      isOpen: true,
      title,
      resources
    })
  }, [])

  const handleOpenSummary = useCallback((title: string, summary: string, documentId: string) => {
    setSummaryPanelState({
      isOpen: true,
      title,
      summary,
      documentId
    })
  }, [])

  const handleOpenQuiz = useCallback(async (id: string) => {
    const doc = documents.find(d => d.id === id)
    if (!doc || !doc.content) return

    // Set loading state but DON'T open panel yet
    setQuizPanelState({
      isOpen: false,
      title: doc.query,
      documentId: id,
      content: doc.content,
      questions: [],
      quizId: null,
      existingAnswers: undefined,
      isGenerating: true
    })

    try {
      // Check for existing quiz first
      const existing = await getLatestQuiz(id)
      if (existing && existing.quiz) {
        setQuizPanelState(prev => ({
          ...prev,
          isOpen: true,
          questions: existing.quiz.questions,
          quizId: existing.quiz.id,
          existingAnswers: existing.attempt?.answers,
          isGenerating: false
        }))
        return
      }

      // Generate new quiz if none exists
      const result = await generateQuiz(id, doc.content)
      if (result.success && result.quiz) {
        setQuizPanelState(prev => ({
          ...prev,
          isOpen: true,
          questions: result.quiz.questions,
          quizId: result.quizId,
          isGenerating: false
        }))
        // Refresh to update the button state
        router.refresh()
      } else {
        setQuizPanelState(prev => ({ ...prev, isGenerating: false }))
      }
    } catch (error) {
      handleGenerationError(error)
      setQuizPanelState(prev => ({ ...prev, isGenerating: false }))
    }
  }, [documents, router, handleGenerationError])

  const handleGenerateNewQuiz = useCallback(async () => {
    const { documentId, content } = quizPanelState
    if (!documentId || !content) return

    setQuizPanelState(prev => ({ ...prev, isGenerating: true, questions: [], existingAnswers: undefined }))

    try {
      const result = await generateQuiz(documentId, content)
      if (result.success && result.quiz) {
        setQuizPanelState(prev => ({
          ...prev,
          questions: result.quiz.questions,
          quizId: result.quizId,
          isGenerating: false
        }))
        // Refresh to update the button state
        router.refresh()
      } else {
        setQuizPanelState(prev => ({ ...prev, isGenerating: false }))
      }
    } catch (error) {
      handleGenerationError(error)
      setQuizPanelState(prev => ({ ...prev, isGenerating: false }))
    }
  }, [quizPanelState, router, handleGenerationError])

  const handleOpenFlashcards = useCallback(async (id: string) => {
    const doc = documents.find(d => d.id === id)
    if (!doc || !doc.content) return

    // If we already have the data for this document, just open it
    if (flashcardPanelState.documentId === id && flashcardPanelState.cards.length > 0) {
      setFlashcardPanelState(prev => ({ ...prev, isOpen: true }))
      return
    }

    // Set loading state but DON'T open panel yet
    setFlashcardPanelState({
      isOpen: false,
      title: doc.query,
      documentId: id,
      content: doc.content,
      cards: [],
      masteredIndices: [],
      isGenerating: true
    })

    try {
      // Check for existing flashcards first
      const existing = await getFlashcards(id)
      if (existing && existing.cards && existing.cards.length > 0) {
        // Open panel with existing cards and mastered state
        setFlashcardPanelState(prev => ({
          ...prev,
          isOpen: true,
          cards: existing.cards,
          masteredIndices: existing.mastered_indices || [],
          isGenerating: false
        }))
        return
      }

      // Generate new flashcards if none exist
      const result = await generateFlashcards(id, doc.content)
      if (result.success && result.flashcards) {
        // Open panel after flashcards are generated
        setFlashcardPanelState(prev => ({
          ...prev,
          isOpen: true,
          cards: result.flashcards.cards,
          masteredIndices: [],
          isGenerating: false
        }))
        // Refresh to update the button state
        router.refresh()
      } else {
        setFlashcardPanelState(prev => ({ ...prev, isGenerating: false }))
      }
    } catch (error) {
      handleGenerationError(error)
      setFlashcardPanelState(prev => ({ ...prev, isGenerating: false }))
    }
  }, [documents, router, handleGenerationError])

  const handleGenerateNewFlashcards = useCallback(async () => {
    const { documentId, content } = flashcardPanelState
    if (!documentId || !content) return

    setFlashcardPanelState(prev => ({ ...prev, isGenerating: true, cards: [] }))

    try {
      // Force regenerate new flashcards
      const result = await generateFlashcards(documentId, content, true)
      if (result.success && result.flashcards) {
        setFlashcardPanelState(prev => ({
          ...prev,
          cards: result.flashcards.cards,
          isGenerating: false
        }))
        // Refresh to update the button state
        router.refresh()
      } else {
        setFlashcardPanelState(prev => ({ ...prev, isGenerating: false }))
      }
    } catch (error) {
      handleGenerationError(error)
      setFlashcardPanelState(prev => ({ ...prev, isGenerating: false }))
    }
  }, [flashcardPanelState, router, handleGenerationError])

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])
  
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []

    // Create a root node if there are no documents or just to center things
    // But for now, let's treat top-level documents (no parent_id) as roots
    
    // If no documents, maybe show a placeholder or just empty
    if (!documents || documents.length === 0) return { nodes: [], edges: [] }

    // Create a map for faster lookup
    const docMap = new Map(documents.map(d => [d.id, d]))

    // Helper to check if a node should be visible
    // A node is visible if none of its ancestors are collapsed
    const isVisible = (doc: Document) => {
      let current = doc
      while (current.parent_id) {
        if (collapsedIds.has(current.parent_id)) return false
        current = docMap.get(current.parent_id)!
        if (!current) break 
      }
      return true
    }

    // Helper to check if a node has children
    const hasChildren = (id: string) => documents.some((d: Document) => d.parent_id === id)

    // Sort documents to ensure deterministic order for dagre
    // Although we sort in the query, let's be safe and sort by ID here too if needed
    // But the query sort should be enough.
    
    documents.forEach((doc) => {
      if (!isVisible(doc)) return

      const hasPosition = doc.position_x !== null && doc.position_x !== undefined && doc.position_y !== null && doc.position_y !== undefined

      nodes.push({
        id: doc.id,
        type: 'topicNode',
        data: { 
          id: doc.id,
          rootId,
          label: doc.query, 
          content: doc.content,
          createdAt: doc.created_at,
          // Check if node was first seen within the last 2 seconds
          isNew: (() => {
            const firstSeen = nodeFirstSeenAt.current.get(doc.id)
            const isRecent = firstSeen ? (Date.now() - firstSeen < 2000) : false
            if (isRecent && firstSeen) console.log(`Node ${doc.id} isNew=true (firstSeen ${Date.now() - firstSeen}ms ago)`)
            return isRecent
          })(),
          hasChildren: hasChildren(doc.id),
          isCollapsed: collapsedIds.has(doc.id),
          hasQuiz: doc.quizzes && doc.quizzes.length > 0,
          hasPodcast: doc.podcasts && doc.podcasts.length > 0,
          hasFlashcards: doc.flashcards && doc.flashcards.length > 0,
          hasResources: doc.resources && doc.resources.length > 0,
          hasNote: !!doc.note && doc.note.trim().length > 0 && doc.note !== '<p></p>',
          hasSummary: !!doc.summary,
          isGeneratingQuiz: quizPanelState.isGenerating && quizPanelState.documentId === doc.id,
          isGeneratingFlashcards: flashcardPanelState.isGenerating && flashcardPanelState.documentId === doc.id,
          isGeneratingSubtopics: generatingNodes[doc.id]?.type === 'subtopic',
          isGeneratingExplanation: generatingNodes[doc.id]?.type === 'explanation',
          isGeneratingPodcast: !!generatingPodcasts[doc.id],
          readOnly,
          hasPosition,
          onOpenNote: handleOpenNote,
          onOpenQuiz: handleOpenQuiz,
          onOpenFlashcards: handleOpenFlashcards,
          onOpenResources: handleOpenResources,
          onOpenSummary: (title: string, summary: string) => handleOpenSummary(title, summary, doc.id),
          onToggleCollapse: () => toggleCollapse(doc.id),
          onDelete: async (id: string) => {
            if (readOnly) return
            if (confirm('Are you sure you want to delete this topic and all its subtopics?')) {
              await deleteTopic(id)
              router.refresh()
            }
          },
          onGeneratePodcast: async (id: string) => {
             if (readOnly) return
             setGeneratingPodcasts(prev => ({
                ...prev,
                [id]: Date.now()
             }))
             try {
                await generatePodcast(id)
             } catch (e) {
                handleGenerationError(e)
                setGeneratingPodcasts(prev => {
                    const next = { ...prev }
                    delete next[id]
                    return next
                })
             }
          },
          onGenerate: async (id: string, type: 'subtopic' | 'explanation') => {
            if (readOnly) return
            
            setGeneratingNodes(prev => ({ ...prev, [id]: { type, startedAt: Date.now() } }))
            
            try {
               await generateTopicContent(id, type)
            } catch (e) {
              handleGenerationError(e)
              setGeneratingNodes(prev => {
                  const next = { ...prev }
                  delete next[id]
                  return next
              })
            }
          }
        },
        position: hasPosition ? { x: doc.position_x!, y: doc.position_y! } : { x: 0, y: 0 }
      })

      const parent = documents.find((d: Document) => d.id === doc.parent_id)
      if (doc.parent_id && parent && isVisible(parent)) {
        edges.push({
          id: `${doc.parent_id}-${doc.id}`,
          source: doc.parent_id,
          target: doc.id,
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: doc.is_read ? '#22c55e' : '#334155',
            strokeWidth: 2 
          },
        })
      }
    })

    return getLayoutedElements(nodes, edges)
  }, [documents, router, collapsedIds, toggleCollapse, rootId, readOnly, handleOpenNote, handleOpenQuiz, handleOpenFlashcards, handleOpenResources, handleOpenSummary, quizPanelState.isGenerating, quizPanelState.documentId, flashcardPanelState.isGenerating, flashcardPanelState.documentId, generatingNodes, generatingPodcasts])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes when documents change (e.g. after refresh) or collapsed state changes
  useEffect(() => {
     const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges)
     setNodes(layoutedNodes)
     setEdges(layoutedEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (!readOnly) {
        updateNodePosition(node.id, node.position.x, node.position.y)
      }
    },
    [readOnly],
  )

  return (
    <div className="h-full w-full bg-[#020202] relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#1e1b4b,transparent)] pointer-events-none opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_80%_60%,#172554,transparent)] pointer-events-none opacity-30" />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.01}
        maxZoom={4}
        attributionPosition="bottom-right"
        colorMode="dark"
      >
        <Background 
          color="#94a3b8" 
          gap={24} 
          size={1} 
          variant={BackgroundVariant.Dots} 
          className="opacity-10"
        />
        <Controls className="bg-[#0A0A0A] border-white/10 fill-white text-white" />
      </ReactFlow>

      <NoteSidePanel
        isOpen={notePanelState.isOpen}
        onClose={() => setNotePanelState(prev => ({ ...prev, isOpen: false }))}
        documentId={notePanelState.documentId}
        initialNote={notePanelState.initialNote}
        title={notePanelState.title}
      />

      <ResourcesSidePanel
        isOpen={resourcesPanelState.isOpen}
        onClose={() => setResourcesPanelState(prev => ({ ...prev, isOpen: false }))}
        title={resourcesPanelState.title}
        resources={resourcesPanelState.resources}
      />

      <SummarySidePanel
        isOpen={summaryPanelState.isOpen}
        onClose={() => setSummaryPanelState(prev => ({ ...prev, isOpen: false }))}
        title={summaryPanelState.title}
        summary={summaryPanelState.summary}
        documentId={summaryPanelState.documentId}
      />

      <QuizSidePanel
        isOpen={quizPanelState.isOpen}
        onClose={() => setQuizPanelState(prev => ({ ...prev, isOpen: false }))}
        title={quizPanelState.title}
        questions={quizPanelState.questions}
        quizId={quizPanelState.quizId}
        existingAnswers={quizPanelState.existingAnswers}
        onGenerateNew={handleGenerateNewQuiz}
        isGenerating={quizPanelState.isGenerating}
      />

      <FlashcardSidePanel
        isOpen={flashcardPanelState.isOpen}
        onClose={() => setFlashcardPanelState(prev => ({ ...prev, isOpen: false }))}
        title={flashcardPanelState.title}
        cards={flashcardPanelState.cards}
        documentId={flashcardPanelState.documentId}
        initialMasteredIndices={flashcardPanelState.masteredIndices}
        onGenerateNew={handleGenerateNewFlashcards}
        onMasteredChange={(indices) => setFlashcardPanelState(prev => ({ ...prev, masteredIndices: indices }))}
        isGenerating={flashcardPanelState.isGenerating}
      />
    </div>
  )
}
