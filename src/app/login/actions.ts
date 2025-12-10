'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

type ActionResponse =
    | { error: string; success?: never; message?: never }
    | { success: true; message: string; error?: never }

export async function login(formData: FormData) {
    const supabase = createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Simple validation
    if (!email || !password) {
        return { error: "Email and password are required" }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error("Login error:", error.message)
        return { error: error.message }
    }

    return redirect('/dashboard')
}


export async function signup(formData: FormData): Promise<ActionResponse | void> {
    const supabase = createClient()
    const origin = headers().get('origin')
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string

    // 1. Email Domain Validation
    if (!email.endsWith('@icu.ac.jp')) {
        return { error: 'Start with your @icu.ac.jp email address.' }
    }

    // 2. Password Strength Validation (8+ chars, alphanumeric)
    const hasLetters = /[a-zA-Z]/.test(password)
    const hasNumbers = /[0-9]/.test(password)
    const isLongEnough = password.length >= 8

    if (!isLongEnough || !hasLetters || !hasNumbers) {
        return { error: 'Password must be at least 8 characters and contain both letters and numbers.' }
    }

    // 3. Name validation
    if (!firstName || !lastName) {
        return { error: "Name is required." }
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                full_name: `${firstName} ${lastName}`,
                first_name: firstName,
                last_name: lastName,
            }
        },
    })

    if (error) {
        console.error("Signup error:", error.message)
        return { error: error.message }
    }

    // If email confirmation is disabled, we get a session immediately.
    if (data.session) {
        return redirect('/dashboard')
    }

    // Redirect to verification page
    return redirect(`/auth/verify?email=${encodeURIComponent(email)}`)
}

export async function verifyEmail(formData: FormData) {
    const supabase = createClient()
    const email = formData.get('email') as string
    const code = formData.get('code') as string

    if (!email || !code) {
        return { error: "Email and code are required." }
    }

    const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup'
    })

    if (error) {
        console.error("Verify OTP error:", error.message)
        return { error: error.message }
    }

    return redirect('/dashboard')
}
