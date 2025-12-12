"use client"

import Link from "next/link"
import { useState } from "react"
import { useFormStatus } from "react-dom"
import { login, signup } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2 } from "lucide-react"

function LoginButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing In..." : "Log In"}
        </Button>
    )
}

function SignupButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating Account..." : "Sign Up"}
        </Button>
    )
}

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    async function handleLogin(formData: FormData) {
        setError(null)
        setSuccess(null)

        // Client-side quick checks could go here

        const res = await login(formData)
        if (res?.error) {
            setError(res.error)
        }
        // If login is successful, the server action redirects, so we don't need to do anything.
    }

    async function handleSignup(formData: FormData) {
        setError(null)
        setSuccess(null)

        const res = await signup(formData)

        if (res?.error) {
            setError(res.error)
        } else if (res && 'success' in res && res.success) {
            // Success case
            setSuccess(res.message)
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                        Welcome to ICU TextLink
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Please sign in to continue
                    </p>
                </div>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="login">Log In</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    {/* ERROR / SUCCESS MESSAGES */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4" />
                            {success}
                        </div>
                    )}

                    {/* LOGIN FORM */}
                    <TabsContent value="login">
                        <Card>
                            <CardHeader>
                                <CardTitle>Log In</CardTitle>
                                <CardDescription>
                                    Enter your credentials to access your account.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form action={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" placeholder="you@icu.ac.jp" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Link href="#" className="text-xs text-blue-600 float-right hover:underline">Forgot password?</Link>
                                        <Label htmlFor="password">Password</Label>
                                        <Input id="password" name="password" type="password" required />
                                    </div>
                                    <LoginButton />
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SIGNUP FORM */}
                    <TabsContent value="signup">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create Account</CardTitle>
                                <CardDescription>
                                    Join the community. valid @icu.ac.jp email required.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={handleSignup} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">First Name</Label>
                                            <Input id="first_name" name="first_name" placeholder="Taro" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">Last Name</Label>
                                            <Input id="last_name" name="last_name" placeholder="Yamada" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email (@icu.ac.jp)</Label>
                                        <Input id="signup-email" name="email" type="email" placeholder="c123456x@icu.ac.jp" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <Input
                                            id="signup-password"
                                            name="password"
                                            type="password"
                                            required
                                            minLength={8}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            At least 8 characters, letters and numbers.
                                        </p>
                                    </div>
                                    <SignupButton />
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
