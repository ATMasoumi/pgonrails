"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ResendConfirmation() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleResend = async () => {
    setLoading(true)
    setMessage('')
    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })
    
    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Confirmation email sent! Redirecting...')
      setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      }, 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans flex items-center justify-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
        </div>

        <div className="w-full max-w-md p-8 relative z-10">
            <div className="mb-8 text-center">
                <Link href="/signin" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
                <h1 className="text-3xl font-bold mb-2">Resend Confirmation</h1>
                <p className="text-gray-400">Enter your email to receive a new confirmation link</p>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl">
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                        />
                    </div>
                    <Button 
                        onClick={handleResend} 
                        disabled={loading}
                        className="w-full bg-white text-black hover:bg-gray-200"
                    >
                        {loading ? 'Sending...' : 'Resend Email'}
                    </Button>
                    {message && (
                        <p className={`text-sm text-center p-2 rounded border ${message.includes('Error') ? 'text-red-400 bg-red-900/20 border-red-900/50' : 'text-green-400 bg-green-900/20 border-green-900/50'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}
