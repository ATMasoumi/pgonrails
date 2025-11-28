"use client"

import { ArrowLeft, ArrowRight, Cog, Filter, LogOut, MoreHorizontal, BookOpen, UserRound } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"
import { signout } from "@/app/auth/actions"
import { useAppContext } from "@/lib/contexts/appContext"
import { usePathname, useRouter } from "next/navigation"
import { Badge } from "./ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Props = {
    boardTitle?: string
    onEditBoard?: () => void
    onFilterClick?: () => void
    filterCount?: number
}

export default function Navbar({ boardTitle, onEditBoard, onFilterClick, filterCount }: Props) {
    const { user } = useAppContext()
    const pathname = usePathname()
    const router = useRouter()

    const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/")
    const isBoard = pathname.startsWith("/boards/")
    const isPricing = pathname === "/pricing"
    const [dropdownOpen, setDropdownOpen] = useState(false)
    
    if (isDashboard) {
        return (
            <header className="border-b border-white/10 bg-[#020202]/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
                    <Link prefetch={false} href="/" className="flex items-center space-x-2">
                        <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                        <span className="text-xl sm:text-2xl font-bold text-white">DocTree</span>
                    </Link>
                    <div className="flex-1 flex justify-end mr-4">
                        <Link prefetch={false} href="/pricing" className="text-sm font-medium text-gray-300 hover:text-white">
                            Pricing
                        </Link>
                    </div>
                    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <Avatar className={`w-8 h-8 cursor-pointer transition-shadow hover:ring-2 hover:ring-blue-500 ${dropdownOpen ? "ring-2 ring-blue-500" : ""}`}>
                                <AvatarImage
                                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/avatars/${user?.user_metadata?.avatar_img_name}?cb=${user?.user_metadata?.avatar_img_cb}&width=32&height=32`}
                                    alt={`Profile picture for ${user?.user_metadata?.full_name}`}
                                />
                                <AvatarFallback>
                                    <div className="w-8 h-8 rounded-full flex justify-center items-center space-x-2 sm:space-x-4 bg-blue-500/20">
                                        <UserRound className="h-5 w-5 text-blue-400 stroke-[2.5]" />
                                    </div>
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[calc(100vw_-_32px)] max-w-100 bg-[#0A0A0A] border-white/10 text-gray-200" align="end">
                            <DropdownMenuLabel className="flex items-center gap-3">
                                <Avatar className="w-7 h-7">
                                    <AvatarImage
                                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/avatars/${user?.user_metadata?.avatar_img_name}?cb=${user?.user_metadata?.avatar_img_cb}&width=28&height=28`}
                                        alt={`Profile picture for ${user?.user_metadata?.full_name}`}
                                    />
                                    <AvatarFallback>
                                        <div className="w-7 h-7 rounded-full flex justify-center items-center space-x-2 sm:space-x-4 bg-blue-500/20 cursor-pointer">
                                            <UserRound className="h-4 w-4 text-blue-400 stroke-[2.5]" />
                                        </div>
                                    </AvatarFallback>
                                </Avatar>
                                {user?.user_metadata?.full_name || user?.email}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem onClick={() => router.push("/settings")} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                <Cog className="ml-1.5 mr-2.5" />
                                Manage account
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={signout} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                <LogOut className="ml-1.5 mr-2.5" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
        )
    }

    if (isBoard) {
        return (
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                            <Link
                                prefetch={false}
                                href="/dashboard"
                                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 flex-shrink-0"
                            >
                                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                <span className="hidden sm:inline">Back to dashboard</span>
                                <span className="sm:hidden">Back</span>
                            </Link>
                            <div className="h-4 sm:h-6 w-px bg-gray-300 hidden sm:block" />
                            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                                <BookOpen className="text-blue-600" />
                                <div className="items-center space-x-1 sm:space-x-2 min-w-0">
                                    <span className="text-lg font-bold text-gray-900 truncate">
                                        {boardTitle}
                                    </span>
                                    {onEditBoard && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 flex-shrink-0 p-0"
                                            onClick={onEditBoard}
                                        >
                                            <MoreHorizontal />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center flex-shrink-0 space-x-2 sm:space-x-4">
                            {onFilterClick && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`text-xs sm:text-sm ${filterCount ? "bg-blue-100 border-blue-200" : ""}`}
                                    onClick={onFilterClick}
                                >
                                    <Filter className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Filter</span>
                                    {filterCount && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs ml-1 sm:ml-2 bg-blue-100 border-blue-200"
                                        >
                                            {filterCount}
                                        </Badge>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        )
    }

    return (
        <header className={`border-b sticky top-0 z-50 backdrop-blur-sm ${isPricing ? "bg-[#0A0A0A]/80 border-white/10" : "bg-white/80 border-gray-200"}`}>
            <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
                <Link prefetch={false} href="/" className="flex items-center space-x-2">
                    <BookOpen className={`h-6 w-6 sm:h-8 sm:w-8 ${isPricing ? "text-blue-500" : "text-blue-600"}`} />
                    <span className={`text-xl sm:text-2xl font-bold ${isPricing ? "text-white" : "text-gray-900"}`}>DocTree</span>
                </Link>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <Link prefetch={false} href="/pricing" className={`text-sm font-medium mr-4 ${isPricing ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`}>
                        Pricing
                    </Link>
                    {user && (
                        <div className="flex items-center space-x-4 md:space-x-8">
                            <Link prefetch={false} href="/dashboard">
                                <Button size="sm" className={`text-xs sm:text-sm cursor-pointer ${isPricing ? "bg-white text-black hover:bg-gray-200" : ""}`}>
                                    Dashboard <ArrowRight />
                                </Button>
                            </Link>
                            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className={`w-8 h-8 cursor-pointer transition-shadow hover:ring-2 ${isPricing ? "hover:ring-blue-500" : "hover:ring-blue-600"} ${dropdownOpen ? (isPricing ? "ring-2 ring-blue-500" : "ring-2 ring-blue-600") : ""}`}>
                                        <AvatarImage
                                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/avatars/${user?.user_metadata?.avatar_img_name}?cb=${user?.user_metadata?.avatar_img_cb}&width=32&height=32`}
                                            alt={`Profile picture for ${user?.user_metadata?.full_name}`}
                                        />
                                        <AvatarFallback>
                                            <div className={`w-8 h-8 rounded-full flex justify-center items-center ${isPricing ? "bg-blue-500/20" : "bg-blue-100"}`}>
                                                <UserRound className={`h-5 w-5 stroke-[2.5] ${isPricing ? "text-blue-400" : "text-blue-600"}`} />
                                            </div>
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className={`w-[calc(100vw_-_32px)] max-w-100 ${isPricing ? "bg-[#0A0A0A] border-white/10 text-gray-200" : ""}`} align="end">
                                    <DropdownMenuLabel className="flex items-center gap-3">
                                        <Avatar className="w-7 h-7">
                                            <AvatarImage
                                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/avatars/${user?.user_metadata?.avatar_img_name}?cb=${user?.user_metadata?.avatar_img_cb}&width=28&height=28`}
                                                alt={`Profile picture for ${user?.user_metadata?.full_name}`}
                                            />
                                            <AvatarFallback>
                                                <div className={`w-7 h-7 rounded-full flex justify-center items-center space-x-2 sm:space-x-4 cursor-pointer ${isPricing ? "bg-blue-500/20" : "bg-blue-100"}`}>
                                                    <UserRound className={`h-4 w-4 stroke-[2.5] ${isPricing ? "text-blue-400" : "text-blue-600"}`} />
                                                </div>
                                            </AvatarFallback>
                                        </Avatar>
                                        {user?.user_metadata?.full_name || user?.email}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className={isPricing ? "bg-white/10" : ""} />
                                    <DropdownMenuItem onClick={() => router.push("/settings")} className={isPricing ? "focus:bg-white/10 focus:text-white cursor-pointer" : ""}>
                                        <Cog className="ml-1.5 mr-2.5" />
                                        Manage account
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={signout} className={isPricing ? "focus:bg-white/10 focus:text-white cursor-pointer" : ""}>
                                        <LogOut className="ml-1.5 mr-2.5" />
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                    {!user && (
                        <div className="space-x-2">
                            <Link prefetch={false} href="/signin">
                                <Button size="sm" variant="outline" className={`text-xs sm:text-sm ${isPricing ? "bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white" : ""}`}>
                                    Sign In
                                </Button>
                            </Link>
                            <Link prefetch={false} href="/signup">
                                <Button size="sm" className={`text-xs sm:text-sm ${isPricing ? "bg-white text-black hover:bg-gray-200" : ""}`}>
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}