import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, BookPlus } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))] py-12 gap-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                    Welcome to ICU TextLink
                </h1>
                <p className="text-muted-foreground w-full max-w-lg mx-auto">
                    What would you like to do today?
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                <Button
                    variant="outline"
                    className="h-48 flex flex-col items-center justify-center gap-4 text-lg hover:bg-slate-50 hover:border-slate-300 transition-all group"
                    asChild
                >
                    <Link href="/textbooks">
                        <div className="p-4 rounded-full bg-slate-100 group-hover:bg-slate-200 transition-colors">
                            <Search className="w-8 h-8 text-slate-700" />
                        </div>
                        <span>Find Textbooks</span>
                        <span className="text-xs text-muted-foreground font-normal">Browse available books</span>
                    </Link>
                </Button>

                <Button
                    variant="default"
                    className="h-48 flex flex-col items-center justify-center gap-4 text-lg shadow-md hover:shadow-lg transition-all group"
                    asChild
                >
                    <Link href="/textbooks/new">
                        <div className="p-4 rounded-full bg-white/20">
                            <BookPlus className="w-8 h-8" />
                        </div>
                        <span>Lend Textbooks</span>
                        <span className="text-xs opacity-80 font-normal">List your book for others</span>
                    </Link>
                </Button>
            </div>
        </div>
    )
}
