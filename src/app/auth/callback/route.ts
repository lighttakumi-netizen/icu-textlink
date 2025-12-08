import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    console.log("Auth callback triggered")
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'
    console.log("Code present:", !!code)

    // Debug: Check cookies
    const cookieHeader = request.headers.get('cookie') ?? ''
    console.log("Cookies received:", cookieHeader)

    if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error("Auth Exchange Error:", error)
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
        }

        if (!error) {
            console.log("Auth Exchange Success, redirecting to", next)
            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no x-forwarded-host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    } else {
        console.error("No code found in params")
    }

    // return the user to an error page with instructions
    console.log("Redirecting to auth-code-error")
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
