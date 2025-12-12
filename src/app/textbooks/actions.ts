'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type Textbook = {
    id: string
    title: string
    course_name: string
    course_id: string | null
    condition: string
    description: string | null
    images: string[] | null
    owner_id: string
    is_available: boolean
    created_at: string
    profiles?: {
        full_name: string | null
    }
}

export async function getTextbooks(query?: string) {
    const supabase = createClient()

    let queryBuilder = supabase
        .from('textbooks')
        .select(`
      *,
      profiles (
        full_name
      )
    `)
        .eq('is_available', true)
        .order('created_at', { ascending: false })

    if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,course_name.ilike.%${query}%,course_id.ilike.%${query}%`)
    }

    const { data, error } = await queryBuilder

    if (error) {
        console.error('Error fetching textbooks:', error)
        return []
    }

    return data as Textbook[]
}

export async function createTextbook(formData: FormData) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const title = formData.get('title') as string
    const course_name = formData.get('course_name') as string
    const course_id = formData.get('course_id') as string
    const condition = formData.get('condition') as string
    const description = formData.get('description') as string

    // Image upload logic would go here. For now, we'll placeholder it.
    // const imageFile = formData.get('image') as File

    if (!title || !course_name || !condition) {
        return { error: 'Please fill in all required fields.' }
    }

    const { error } = await supabase
        .from('textbooks')
        .insert({
            title,
            course_name,
            course_id: course_id || null,
            condition,
            description,
            owner_id: user.id,
            images: [], // Placeholder
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/textbooks')
    redirect('/textbooks')
}

export async function getTextbook(id: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('textbooks')
        .select(`
            *,
            profiles (
                full_name,
                email
            )
        `)
        .eq('id', id)
        .single()

    if (error) {
        return null
    }

    return data as Textbook
}

export async function requestTextbook(id: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if not owner
    const textbook = await getTextbook(id)
    if (!textbook) return { error: "Textbook not found" }
    if (textbook.owner_id === user.id) return { error: "You cannot borrow your own book." }

    // Create transaction
    const { error } = await supabase
        .from('transactions')
        .insert({
            book_id: id,
            borrower_id: user.id,
            lender_id: textbook.owner_id,
            status: 'pending',
            start_date: new Date().toISOString().split('T')[0], // Today, YYYY-MM-DD
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 days
            amount: 0,
            fee_amount: 0
        })

    if (error) {
        console.error("Error creating transaction:", error)
        return { error: error.message }
    }

    revalidatePath(`/textbooks/${id}`)
    revalidatePath('/dashboard')
    return { success: true, message: "Request sent successfully" }
}

export async function getUserTransactions() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    console.log("Fetching transactions for user:", user.id)

    const { data, error } = await supabase
        .from('transactions')
        .select(`
            id,
            status,
            created_at,
            lender_id,
            borrower_id,
            book:textbooks (
                id,
                title,
                image_url,
                course_id
            ),
            borrower:profiles!transactions_borrower_id_fkey (
                id,
                full_name,
                email
            ),
            lender:profiles!transactions_lender_id_fkey (
                id,
                full_name,
                email
            )
        `)
        .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching transactions:", error)
        return []
    }

    console.log("Transactions found:", data?.length)
    return data
}

export async function updateTransactionStatus(id: string, status: 'approved' | 'rejected' | 'returned') {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    // Verify ownership/permission (simple check: must be lender to approve/reject)
    // For 'returned', borrower might also be able to trigger, but let's stick to lender for now for simplicity.

    // First fetch the transaction to verify role
    const { data: transaction } = await supabase
        .from('transactions')
        .select('lender_id')
        .eq('id', id)
        .single()

    if (!transaction || transaction.lender_id !== user.id) {
        return { error: "You are not authorized to update this transaction." }
    }

    const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function submitReview(transactionId: string, targetId: string, rating: number, comment: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    // Verify transaction is completed/returned
    const { data: transaction } = await supabase
        .from('transactions')
        .select('status')
        .eq('id', transactionId)
        .single()

    if (!transaction || !['returned', 'completed'].includes(transaction.status)) {
        return { error: "Transaction must be completed to leave a review." }
    }

    const { error } = await supabase
        .from('reviews')
        .insert({
            transaction_id: transactionId,
            reviewer_id: user.id,
            target_id: targetId,
            rating,
            comment
        })

    if (error) return { error: error.message }

    // Optionally update transaction status to fully 'completed' if it was just 'returned'
    if (transaction.status === 'returned') {
        await supabase
            .from('transactions')
            .update({ status: 'completed' })
            .eq('id', transactionId)
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function getMyTextbooks() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('textbooks')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching my textbooks:', error)
        return []
    }

    return data as Textbook[]
}

export async function updateTextbook(id: string, formData: FormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    const title = formData.get('title') as string
    const course_name = formData.get('course_name') as string
    const course_id = formData.get('course_id') as string
    const condition = formData.get('condition') as string
    const description = formData.get('description') as string
    const is_available = formData.get('is_available') === 'on'

    if (!title || !course_name || !condition) {
        return { error: 'Please fill in all required fields.' }
    }

    // Verify ownership
    const { data: existing } = await supabase
        .from('textbooks')
        .select('owner_id')
        .eq('id', id)
        .single()

    if (!existing || existing.owner_id !== user.id) {
        return { error: "You are not authorized to update this textbook." }
    }

    const { error } = await supabase
        .from('textbooks')
        .update({
            title,
            course_name,
            course_id: course_id || null,
            condition,
            description,
            is_available
        })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    revalidatePath(`/textbooks/${id}`)
    return { success: true, message: "Textbook updated successfully" }
}

export async function deleteTextbook(id: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Not authenticated" }

    // Verify ownership
    const { data: existing } = await supabase
        .from('textbooks')
        .select('owner_id')
        .eq('id', id)
        .single()

    if (!existing || existing.owner_id !== user.id) {
        return { error: "You are not authorized to delete this textbook." }
    }

    const { error } = await supabase
        .from('textbooks')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    revalidatePath('/textbooks') // Remove from public list
    return { success: true, message: "Textbook deleted successfully" }
}
