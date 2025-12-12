import { createClient } from '@/utils/supabase/server'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // 1. Get current profile to check if account exists
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_account_id')
            .eq('id', user.id)
            .single()

        let accountId = profile?.stripe_account_id

        // 2. If no account, create one
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            })
            accountId = account.id

            // Save to DB
            await supabase
                .from('profiles')
                .update({ stripe_account_id: accountId })
                .eq('id', user.id)
        }

        // 3. Create Account Link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard`, // Return if session expires
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?stripe=connected`, // Return after success
            type: 'account_onboarding',
        })

        return NextResponse.json({ url: accountLink.url })
    } catch (error: any) {
        console.error("Stripe Connect Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
