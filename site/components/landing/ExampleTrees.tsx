"use client"

import { ArrowRight, Code, Film, Brain, Leaf, BookOpen, Globe, Zap, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"

interface PublicTree {
  id: string
  query: string
  content: string | null
}

interface ExampleTreesProps {
  trees?: PublicTree[]
}

export default function ExampleTrees({ trees = [] }: ExampleTreesProps) {
  const icons = [Code, Film, Brain, Leaf, BookOpen, Globe, Zap, Database]
  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-fuchsia-500 to-pink-500",
    "from-amber-400 to-orange-500",
    "from-green-400 to-emerald-500",
    "from-purple-500 to-indigo-500",
    "from-red-500 to-orange-500",
    "from-teal-400 to-blue-500",
    "from-pink-500 to-rose-500"
  ]

  const displayTrees = trees.map((tree, index) => ({
    id: tree.id,
    title: tree.query || "Untitled Tree",
    description: tree.content ? (tree.content.substring(0, 100) + "...") : "No description available.",
    icon: icons[index % icons.length],
    gradient: gradients[index % gradients.length]
  }))

  if (displayTrees.length === 0) {
    return null
  }

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Explore Public Trees</h2>
            <p className="text-gray-400 text-lg">See what the community is building with DocTree.</p>
          </div>
          <Link href="/hall">
            <Button variant="link" className="text-gray-400 hover:text-white p-0 h-auto font-normal group">
              View all public trees <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayTrees.map((example, index) => (
            <Link href={`/share/${example.id}`} key={index} className="block h-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group h-full bg-[#0A0A0A] rounded-3xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col"
              >
                <div className={`w-full aspect-[16/10] rounded-2xl bg-gradient-to-br ${example.gradient} mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <example.icon className="w-12 h-12 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{example.title}</h3>
                <p className="text-gray-400 leading-relaxed line-clamp-3">{example.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
