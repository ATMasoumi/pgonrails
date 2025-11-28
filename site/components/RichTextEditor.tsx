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
import { Button } from '@/components/ui/button'
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  Heading1, Heading2, List, ListOrdered, 
  CheckSquare, Quote, Code, 
  Paperclip, Loader2, Trash2, Maximize2, Mic, Square
} from 'lucide-react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const ImageComponent = ({ node, deleteNode }: any) => {
  const [showModal, setShowModal] = useState(false)
  
  return (
    <NodeViewWrapper className="inline-block w-[48%] m-[1%] align-top">
      <div className="group relative rounded-xl border-2 border-gray-600 overflow-hidden">
        <img 
          src={node.attrs.src} 
          alt={node.attrs.alt}
          className="w-full h-auto"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button 
            size="icon" 
            variant="destructive" 
            className="h-8 w-8"
            onClick={() => deleteNode()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="secondary"
            className="h-8 w-8"
            onClick={() => setShowModal(true)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-5xl w-full p-0 bg-transparent border-none shadow-none">
          <img 
            src={node.attrs.src} 
            alt={node.attrs.alt}
            className="w-full h-auto rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </NodeViewWrapper>
  )
}

const AudioComponent = ({ node, deleteNode }: any) => {
  return (
    <NodeViewWrapper className="block w-full my-2">
      <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
        <audio controls src={node.attrs.src} className="w-full h-10" />
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 text-gray-400 hover:text-red-400 shrink-0"
          onClick={() => deleteNode()}
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

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
}

export function RichTextEditor({ content, onChange, editable = true }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TaskList,
      AudioExtension,
      TaskItem.configure({
        nested: true,
      }),
      Image.extend({
        addNodeView() {
          return ReactNodeViewRenderer(ImageComponent)
        },
      }).configure({
        inline: true,
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
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-2 prose-p:leading-relaxed prose-li:my-0 prose-li:leading-tight prose-ul:my-0 prose-ol:my-0 prose-headings:my-4 [&_li>p]:my-0',
      },
    },
  })

  if (!editor) {
    return null
  }

  const uploadFile = async (file: File) => {
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
        editor.chain().focus().insertContent([
          { type: 'image', attrs: { src: publicUrl } },
          { type: 'text', text: ' ' }
        ]).run()
      } else if (type === 'audio') {
        editor.chain().focus().insertContent([
          { type: 'audio', attrs: { src: publicUrl } },
          { type: 'paragraph' }
        ]).run()
      } else {
        editor.chain().focus().setLink({ href: publicUrl }).insertContent(file.name).unsetLink().insertContent(' ').run()
      }
      
      toast.success(`Uploaded ${file.name}`)
    } catch (error) {
      console.error(error)
      toast.error(`Failed to upload ${file.name}`)
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
    if (files.length === 0) return

    setIsUploading(true)
    try {
      for (const file of files) {
        await uploadFile(file)
      }
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
    <div className="flex flex-col h-full">
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 shrink-0">
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
            isActive={isRecording}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isUploading}
          >
            {isRecording ? (
              <Square className="h-4 w-4 text-red-500 fill-current animate-pulse" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </ToolbarButton>

          <ToolbarButton
            isActive={false}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
          </ToolbarButton>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileSelect}
          />
        </div>
      )}
      <EditorContent 
        editor={editor} 
        className="flex-1 overflow-y-auto" 
      />
    </div>
  )
}
