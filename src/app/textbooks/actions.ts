'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type Textbook = {
    id: string
    title: string
    course_name: string
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
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,course_name.ilike.%${query}%`)
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
            start_date: new Date().toISOString(), // Mock dates for now
            end_date: new Date().toISOString(),
            amount: 0,
            fee_amount: 0
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/textbooks/${id}`)
    return { success: true }
}
