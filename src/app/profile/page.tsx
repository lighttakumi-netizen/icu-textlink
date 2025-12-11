import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getProfile } from "./actions"
import ProfileForm from "@/components/ProfileForm"

export default async function Page() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const profile = await getProfile()

    return <ProfileForm user={user} profile={profile} />
}
