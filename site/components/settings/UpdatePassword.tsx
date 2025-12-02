"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useMergeState } from "@/lib/hooks/useMergeState"
import { useAppContext } from "@/lib/contexts/appContext";
import { toast } from "sonner";

const DEFAULT_STATE = {
    nonceLoading: false,
    passwordLoading: false,
    newPassword: "",
    confirmPassword: "",
    nonce: ""
}

const REQUIRE_REAUTHENTICATION = process.env.NEXT_PUBLIC_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION === "true"

export default REQUIRE_REAUTHENTICATION ? UpdatePasswordWithOtp : UpdatePasswordSimple

function UpdatePasswordWithOtp() {
    const { supabase, user } = useAppContext()
    const [state, mergeState] = useMergeState(DEFAULT_STATE)

    async function getNonce() {
        mergeState({ nonceLoading: true })

        const { error } = await supabase.auth.reauthenticate()

        mergeState({ nonceLoading: false })

        if (error) {
            toast("Error", {
                description: error.message
            })

            return
        } 
        
        toast("Code sent", {
            description: "Please check your email for your one-time passcode."
        })
    }

    async function updatePassword() {
        mergeState({ passwordLoading: true })

        const { error } = await supabase.auth.updateUser({
            password: state.newPassword,
            nonce: state.nonce
        })

        mergeState(DEFAULT_STATE)

        if (error) {
            toast("Error", {
                description: error.message
            })

            return
        }

        toast("Success!", {
            description: "Your password has been successfully updated."
        })
    }

    const canGetOtp = user && state.newPassword.length >= 8 && state.newPassword === state.confirmPassword
    const canSubmit = user && state.newPassword.length >= 8 && state.newPassword === state.confirmPassword && state.nonce.length === 6

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label className="text-gray-200">New password</Label>
                <Input
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                    type="password"
                    placeholder="Input your new password..."
                    value={state.newPassword}
                    onChange={e => mergeState({ newPassword: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label className="text-gray-200">Confirm new password</Label>
                <Input
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                    type="password"
                    placeholder="Confirm your new password..."
                    value={state.confirmPassword}
                    onChange={e => mergeState({ confirmPassword: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label className="text-gray-200">One-time passcode</Label>
                <InputOTP
                    maxLength={6}
                    value={state.nonce}
                    onChange={nonce => mergeState({ nonce })}
                    onKeyUp={e => {
                        if (e.key === "Enter" && canSubmit) {
                            updatePassword()
                        }
                    }}
                >
                    <InputOTPGroup>
                        <InputOTPSlot index={0} className="bg-white/5 border-white/10 text-white" />
                        <InputOTPSlot index={1} className="bg-white/5 border-white/10 text-white" />
                        <InputOTPSlot index={2} className="bg-white/5 border-white/10 text-white" />
                        <InputOTPSlot index={3} className="bg-white/5 border-white/10 text-white" />
                        <InputOTPSlot index={4} className="bg-white/5 border-white/10 text-white" />
                        <InputOTPSlot index={5} className="bg-white/5 border-white/10 text-white" />
                    </InputOTPGroup>
                </InputOTP>
            </div>
            <p className="text-sm text-gray-400">To change your password, you will have to provide a one-time passcode sent to your email address.</p>
            <div className="flex space-x-2">
                <Button
                    variant={canGetOtp ? "default" : "outline"}
                    className={`w-23 ${canGetOtp ? "bg-white text-black hover:bg-gray-200" : "bg-transparent border-white/20 text-gray-400 hover:bg-white/5 hover:text-gray-300"}`}
                    aria-disabled={!canGetOtp || state.nonceLoading}
                    disabled={!canGetOtp || state.nonceLoading}
                    onClick={getNonce}
                >
                    {state.nonceLoading ? <Loader2 className="animate-spin" /> : "Get OTP"}
                </Button>
                <Button
                    variant={canSubmit ? "default" : "outline"}
                    className={`w-38 ${canSubmit ? "bg-white text-black hover:bg-gray-200" : "bg-transparent border-white/20 text-gray-400 hover:bg-white/5 hover:text-gray-300"}`}
                    aria-disabled={!canSubmit || state.passwordLoading}
                    disabled={!canSubmit || state.passwordLoading}
                    onClick={updatePassword}
                >
                    {state.passwordLoading ? <Loader2 className="animate-spin" /> : "Change password"}
                </Button>
            </div>
        </div>
    )
}

function UpdatePasswordSimple() {
    const { supabase, user } = useAppContext()
    const [state, mergeState] = useMergeState(DEFAULT_STATE)

    async function updatePassword() {
        mergeState({ passwordLoading: true })

        const { error } = await supabase.auth.updateUser({
            password: state.newPassword,
        })

        mergeState(DEFAULT_STATE)

        if (error) {
            toast("Error", {
                description: error.message
            })

            return
        }

        toast("Success!", {
            description: "Your password has been successfully updated."
        })
    }

    const canSubmit = user && state.newPassword.length >= 8 && state.newPassword === state.confirmPassword

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label className="text-gray-200">New password</Label>
                <Input
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                    type="password"
                    placeholder="Input your new password..."
                    value={state.newPassword}
                    onChange={e => mergeState({ newPassword: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label className="text-gray-200">Confirm new password</Label>
                <Input
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                    type="password"
                    placeholder="Confirm your new password..."
                    value={state.confirmPassword}
                    onChange={e => mergeState({ confirmPassword: e.target.value })}
                />
            </div>
            <Button
                variant={canSubmit ? "default" : "outline"}
                className={`w-38 ${canSubmit ? "bg-white text-black hover:bg-gray-200" : "bg-transparent border-white/20 text-gray-400 hover:bg-white/5 hover:text-gray-300"}`}
                aria-disabled={!canSubmit || state.passwordLoading}
                disabled={!canSubmit || state.passwordLoading}
                onClick={updatePassword}
            >
                {state.passwordLoading ? <Loader2 className="animate-spin" /> : "Change password"}
            </Button>
        </div>
    )
}