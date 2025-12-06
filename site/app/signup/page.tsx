"use client"

import Link from 'next/link'
import Image from 'next/image'
import { motion } from "framer-motion"
import SignupForm from "@/components/forms/SignupForm"
import { ArrowLeft } from 'lucide-react'

export default function Signup() {
    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 relative z-10"
            >
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Create an account</h1>
                    <p className="text-gray-400">Join DocTree and start learning visually</p>
                </div>

                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl">
                    <SignupForm />
                    
                    <div className="mt-6 text-center">
                        <div className="text-sm text-gray-400">
                            Already have an account?{" "}
                            <Link href="/signin" className="text-white hover:underline font-medium">
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}