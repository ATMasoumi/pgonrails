"use client"

import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"

export default function SocialProof() {
  const testimonials = [
    {
      name: "Sara Jenkins",
      role: "Medical Student",
      text: "DocTree helps me study complex subjects faster. It's the clearest learning UI I've ever used.",
      avatar: "SJ"
    },
    {
      name: "Mike Chen",
      role: "Software Engineer",
      text: "I use it to map out new technologies I'm learning. The AI explanations are spot on.",
      avatar: "MC"
    },
    {
      name: "Elena Rodriguez",
      role: "History Teacher",
      text: "My students love the visual approach. It makes connecting historical events so much easier.",
      avatar: "ER"
    }
  ]

  return (
    <section className="container mx-auto px-4 py-20 bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-white mb-12"
        >
          Trusted by learners, students, and creators
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-[#111] rounded-2xl p-6 text-left border border-white/10"
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star, starIndex) => (
                  <motion.div
                    key={star}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + (starIndex * 0.1) }}
                  >
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </motion.div>
                ))}
              </div>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-900/50 text-blue-200 text-xs border border-blue-500/30">{t.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-sm text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
