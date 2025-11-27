"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useAppContext } from "@/lib/contexts/appContext"

export default function LandingNavbar() {
  const { user } = useAppContext()

  return (
    <motion.nav 
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl rounded-full bg-[#111]/80 backdrop-blur-md shadow-2xl border border-white/10 py-3 px-6 z-50 flex items-center justify-between"
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2">
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          <BookOpen className="w-6 h-6 text-white" />
        </motion.div>
        <span className="text-xl font-bold tracking-tight text-white">DocTree</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
        <Link href="#product" className="hover:text-white transition-colors">Product</Link>
        <Link href="#features" className="hover:text-white transition-colors">Features</Link>
        <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        <Link href="#resources" className="hover:text-white transition-colors">Resources</Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <Link href="/dashboard">
            <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6 shadow-lg hover:shadow-white/20 transition-all font-semibold flex items-center gap-2">
              Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/signin">
              <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/5 font-medium rounded-full px-5">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6 shadow-lg hover:shadow-white/20 transition-all font-semibold">
                Generate a Tree
              </Button>
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  )
}
