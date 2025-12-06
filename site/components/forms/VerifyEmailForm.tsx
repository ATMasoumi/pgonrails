"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionState } from "react"
import { verifyEmail } from '@/app/auth/actions'
import SubmitButton from "@/components/forms/FormSubmitButton"
import { useSearchParams } from "next/navigation"

export default function VerifyEmailForm() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''
    
    const [formState, formAction] = useActionState(verifyEmail, {
        message: '',
    })

    return (
        <form action={formAction} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    defaultValue={email}
                    required
                    readOnly={!!email}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="code" className="text-gray-300">Verification Code</Label>
                <Input
                    id="code"
                    type="text"
                    name="code"
                    placeholder="123456"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 tracking-widest text-center text-lg"
                    maxLength={6}
                />
            </div>
            <SubmitButton>Verify Email</SubmitButton>
            {formState?.message && (
                <p className="text-sm text-red-400 text-center bg-red-900/20 p-2 rounded border border-red-900/50">{formState.message}</p>
            )}
        </form>
    )
}
