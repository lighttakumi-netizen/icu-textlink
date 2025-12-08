"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { BookOpen, LogOut, User as UserIcon } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Since we haven't installed dropdown-menu yet, we'll use a simple conditional render or just buttons for now.
// Actually, I should install dropdown-menu if I want to use it.
// For now, let's keep it simple: Login button or "Sign Out" button.

import { User } from "@supabase/supabase-js"

interface HeaderProps {
    user: User | null
}

export function Header({ user }: HeaderProps) {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-14 items-center">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <BookOpen className="h-6 w-6" />
                    <span className="font-bold inline-block">ICU TextLink</span>
                </Link>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search could go here */}
                    </div>
                    <nav className="flex items-center space-x-2">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/textbooks">Find Textbooks</Link>
                                </Button>
                                <Button variant="default" size="sm" asChild>
                                    <Link href="/textbooks/new">Lend Textbook</Link>
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                                                <UserIcon className="h-4 w-4" />
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || "User"}</p>
                                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile">Profile</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/messages">Messages</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleSignOut}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Sign Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <Button asChild size="sm">
                                <Link href="/login">Sign In</Link>
                            </Button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}
