"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActionState } from "react"
import { signIn } from '@/app/auth/actions'
import SubmitButton from "./FormSubmitButton"

export default function SigninForm() {
    const [formState, formAction] = useActionState(signIn, {
        message: ''
    })

    return (
        <form action={formAction} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    name="email"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-purple-500/20 focus-visible:border-purple-500"
                />
            </div>
            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                </div>
                <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                    className="bg-white/5 border-white/10 text-white focus-visible:ring-purple-500/20 focus-visible:border-purple-500"
                />
            </div>
            <SubmitButton>Sign in</SubmitButton>
            {formState?.message && (
                <p className="text-sm text-red-400 text-center bg-red-900/20 p-2 rounded border border-red-900/50">{formState.message}</p>
            )}
        </form>
    )
}