import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthCodeError({
    searchParams,
}: {
    searchParams: { error?: string }
}) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-4xl font-bold">Authentication Error</h1>
            <p className="text-muted-foreground">
                There was a problem signing you in. The link may have expired or is invalid.
            </p>
            {searchParams.error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
                    Error details: {searchParams.error}
                </div>
            )}
            <Button asChild>
                <Link href="/login">Return to Login</Link>
            </Button>
        </div>
    )
}
