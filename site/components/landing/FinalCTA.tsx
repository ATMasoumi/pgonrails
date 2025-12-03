"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function FinalCTA() {
  const router = useRouter()

  const handleStartLearning = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/signin')
    }
  }

  return (
    <section className="container mx-auto px-4 py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden group"
      >
        {/* Grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
          <div className="flex-1 text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 text-yellow-200/90 mb-8 border border-yellow-500/20 bg-yellow-500/10 px-4 py-1.5 rounded-full text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span className="tracking-wide uppercase text-xs font-bold">The Ultimate Goal</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight"
            >
              Improve Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Learning Experience</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-400 mb-10 leading-relaxed max-w-xl"
            >
              Stop getting lost in information overload. Our structured, AI-driven approach helps you retain more information in less time.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Button onClick={handleStartLearning} size="lg" className="bg-white text-black hover:bg-gray-200 rounded-full px-8 h-14 font-bold text-base shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.4)] transition-all duration-300">
                Start Learning Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-6 bg-white/5 p-4 pr-8 rounded-full border border-white/10 backdrop-blur-sm"
          >
             <div className="flex items-center -space-x-4">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop", 
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                ].map((src, i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0A0A0A] bg-gray-800 overflow-hidden relative z-0 hover:z-10 transition-all hover:scale-110">
                    <Avatar className="w-full h-full">
                        <AvatarImage src={src} alt="User" />
                        <AvatarFallback className="bg-gray-700 text-gray-300 text-xs">U{i+1}</AvatarFallback>
                    </Avatar>
                  </div>
                ))}
             </div>
             <div className="flex flex-col">
                <div className="text-xl font-bold text-white leading-none">Join</div>
                <div className="text-xs text-gray-400 font-medium mt-1">Early Adopters</div>
             </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
