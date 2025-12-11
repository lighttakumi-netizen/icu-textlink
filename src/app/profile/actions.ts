'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const fullName = formData.get('full_name') as string

    if (!fullName) {
        return { error: "Name is required" }
    }

    const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    // Also update auth metadata for faster access in some places
    await supabase.auth.updateUser({
        data: { full_name: fullName }
    })

    revalidatePath('/profile')
    revalidatePath('/dashboard')

    return { success: true, message: "Profile updated successfully" }
}

export async function getProfile() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) return null
    return data
}
