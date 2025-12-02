"use client"

import { Edit, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChangeEvent, useState } from "react";
import { useAppContext } from "@/lib/contexts/appContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UploadAvatar() {
    const [inputRef, setInputRef] = useState<null | HTMLElement>(null)
    const { supabase, user, mergeState } = useAppContext()

    async function handleUploadAvatar(e: ChangeEvent<HTMLInputElement>) {
        if (!user) return
        if (!e.target.files?.[0]) return

        const avatarFile = e.target.files[0]
        const extension = avatarFile.name.split('.').reverse()[0]
        const cb = Date.now() // cachebuster query param to refetch the image in the user's browser right away

        const { data, error } = await supabase
            .storage
            .from('avatars')
            .upload(`${user.id}/profile.${extension}`, avatarFile, {
                upsert: true,
                metadata: { cb }
            })

        if (error) throw error

        if (data) {
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    avatar_img_name: data.path,
                    avatar_img_cb: cb
                }
            })

            if (updateError) throw updateError

            mergeState({
                user: {
                    ...user,
                    user_metadata: {
                        ...user.user_metadata,
                        avatar_img_name: data.path,
                        avatar_img_cb: cb
                    }
                }
            })
        }
    }

    return (
        <div className="relative group">
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40 shadow-xl ring-4 ring-white/5 transition-all duration-300 group-hover:ring-white/10">
                <AvatarImage
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/avatars/${user?.user_metadata?.avatar_img_name}?cb=${user?.user_metadata?.avatar_img_cb}&width=176&height=176`}
                    alt={`Profile picture for ${user?.user_metadata?.full_name}`}
                    className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <UserRound className="h-16 w-16 text-white/50" />
                </AvatarFallback>
            </Avatar>
            
            <input
                ref={setInputRef}
                className="hidden"
                type="file"
                onChange={handleUploadAvatar}
            />
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="absolute bottom-0 right-0 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-900/20 border-4 border-[#0A0A0A] transition-all duration-200 hover:scale-110 active:scale-95">
                        <Edit className="h-4 w-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-[#1A1A1A] border-white/10 text-gray-200 p-1" align="end">
                    <DropdownMenuItem onClick={() => inputRef?.click()} className="focus:bg-white/10 focus:text-white cursor-pointer rounded-sm">
                        Upload a photo...
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}