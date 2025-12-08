"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        if (!email.endsWith("@icu.ac.jp")) {
            setMessage({ type: "error", text: "Please use your @icu.ac.jp email address." })
            setIsLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                throw error
            }

            setMessage({ type: "success", text: "Check your email for the login link!" })
        } catch (error: any) {
            setMessage({ type: "error", text: error.message || "An error occurred during login." })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">ICU TextLink</CardTitle>
                    <CardDescription>
                        Enter your university email to sign in or create an account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m250000a@icu.ac.jp"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        {message && (
                            <div
                                className={`flex items-center gap-2 rounded-md p-3 text-sm ${message.type === "success"
                                        ? "bg-green-50 text-green-700"
                                        : "bg-red-50 text-red-700"
                                    }`}
                            >
                                {message.type === "success" ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )}
                                {message.text}
                            </div>
                        )}
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Sending Link..." : "Send Login Link"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="text-center text-xs text-slate-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </CardFooter>
            </Card>
        </div>
    )
}
