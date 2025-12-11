'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(transactionId: string, content: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }
    if (!content.trim()) return { error: "Message cannot be empty" }

    // Check participation (RLS handles security, but good to have explicit check or try/catch)
    const { error } = await supabase
        .from('messages')
        .insert({
            transaction_id: transactionId,
            sender_id: user.id,
            content: content.trim()
        })

    if (error) {
        console.error("Error sending message:", error)
        return { error: error.message }
    }

    return { success: true }
}

export async function getMessages(transactionId: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('messages')
        .select(`
            id,
            content,
            created_at,
            sender_id,
            sender:profiles!messages_sender_id_fkey (
                full_name,
                avatar_url
            )
        `)
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error("Error fetching messages:", error)
        return []
    }

    return data
}
