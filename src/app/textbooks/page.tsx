import Link from "next/link"
import { getTextbooks } from "./actions"
import { TextbookCard } from "@/components/TextbookCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function TextbooksPage({
    searchParams,
}: {
    searchParams: { query?: string }
}) {
    const query = searchParams.query
    const textbooks = await getTextbooks(query)

    return (
        <div className="container py-8 space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Textbooks</h1>
                    <p className="text-muted-foreground">
                        Find and borrow textbooks from other students.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/textbooks/new">
                        <Plus className="mr-2 h-4 w-4" />
                        List a Textbook
                    </Link>
                </Button>
            </div>

            <div className="flex items-center space-x-2 max-w-sm">
                <form action="/textbooks" method="GET" className="flex items-center space-x-2 w-full">
                    <Input
                        type="search"
                        placeholder="Search by title or course..."
                        name="query"
                        defaultValue={query}
                    />
                    <Button type="submit" size="icon" variant="secondary">
                        <Search className="h-4 w-4" />
                        <span className="sr-only">Search</span>
                    </Button>
                </form>
            </div>

            {textbooks.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">No textbooks found.</p>
                    {query && (
                        <Button variant="link" asChild className="mt-2">
                            <Link href="/textbooks">Clear Search</Link>
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {textbooks.map((textbook) => (
                        <TextbookCard key={textbook.id} textbook={textbook} />
                    ))}
                </div>
            )}
        </div>
    )
}
