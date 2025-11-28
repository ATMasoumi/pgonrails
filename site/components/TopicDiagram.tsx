"use client"

import { useCallback, useMemo, useState, useEffect } from 'react'
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, Node, Edge, BackgroundVariant } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import { TopicNode } from './TopicNode'
import { NoteSidePanel } from './NoteSidePanel'
import { ResourcesSidePanel } from './ResourcesSidePanel'
import { SummarySidePanel } from './SummarySidePanel'
import { ResourceData } from './ResourcesModal'
import { generateTopicContent, deleteTopic } from '@/app/documents/actions'
import { useRouter } from 'next/navigation'

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


      nodes.push({
        id: doc.id,
        type: 'topicNode',
        data: { 
          id: doc.id,
          rootId,
          label: doc.query, 
          content: doc.content,
          createdAt: doc.created_at,
          hasChildren: hasChildren(doc.id),
          isCollapsed: collapsedIds.has(doc.id),
          hasQuiz: doc.quizzes && doc.quizzes.length > 0,
          hasPodcast: doc.podcasts && doc.podcasts.length > 0,
          hasFlashcards: doc.flashcards && doc.flashcards.length > 0,
          hasResources: doc.resources && doc.resources.length > 0,
          hasNote: !!doc.note && doc.note.trim().length > 0 && doc.note !== '<p></p>',
          hasSummary: !!doc.summary,
          readOnly,
          onOpenNote: handleOpenNote,
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
          onGenerate: async (id: string, type: 'subtopic' | 'explanation') => {
            if (readOnly) return
            // Optimistic update or just loading state
            // We need to pass a state setter or use a global store for better UX
            // For now, we'll just trigger the action and refresh
            try {
               // Find node and set loading
               // This is tricky without local state management for nodes
               // But we can just rely on the router refresh for now
               await generateTopicContent(id, type)
               router.refresh()
            } catch (e) {
              console.error(e)
            }
          }
        },
        position: { x: 0, y: 0 } // Calculated by dagre
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
  }, [documents, router, collapsedIds, toggleCollapse, rootId, readOnly, handleOpenNote, handleOpenResources, handleOpenSummary])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes when documents change (e.g. after refresh) or collapsed state changes
  useEffect(() => {
     const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges)
     setNodes(layoutedNodes)
     setEdges(layoutedEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

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
    </div>
  )
}
