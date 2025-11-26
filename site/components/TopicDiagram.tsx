"use client"

import { useCallback, useMemo, useState } from 'react'
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, Node, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import { TopicNode } from './TopicNode'
import { generateTopicContent, deleteTopic } from '@/app/documents/actions'
import { useRouter } from 'next/navigation'

const nodeWidth = 220
const nodeHeight = 80

interface Document {
  id: string
  query: string
  content: string | null
  created_at: string
  parent_id: string | null
  user_id: string
  is_read?: boolean
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
  rootId: string
}

export function TopicDiagram({ documents, rootId }: TopicDiagramProps) {
  const router = useRouter()
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())

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
          onToggleCollapse: () => toggleCollapse(doc.id),
          onDelete: async (id: string) => {
            if (confirm('Are you sure you want to delete this topic and all its subtopics?')) {
              await deleteTopic(id)
              router.refresh()
            }
          },
          onGenerate: async (id: string, type: 'subtopic' | 'explanation') => {
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
            stroke: doc.is_read ? '#22c55e' : '#94a3b8',
            strokeWidth: 2 
          },
        })
      }
    })

    return getLayoutedElements(nodes, edges)
  }, [documents, router, collapsedIds, toggleCollapse])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes when documents change (e.g. after refresh) or collapsed state changes
  useMemo(() => {
     const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges)
     setNodes(layoutedNodes)
     setEdges(layoutedEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  const nodeTypes = useMemo(() => ({ topicNode: TopicNode }), [])

  return (
    <div className="h-full w-full bg-slate-50 relative">
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
      >
        <Background color="#cbd5e1" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
