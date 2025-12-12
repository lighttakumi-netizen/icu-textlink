import Link from "next/link"
import { type Textbook } from "@/app/textbooks/actions"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Need Badge component, let's just make a simple inline badge or create it.
// I will create a Badge component next, but for now I can inline it or skip it.
// Let's create a minimal Badge in a separate file later or assume it exists. 
// I will just use a span with tailwind classes for now to save tool calls, or create Badge component.
// Reusable Badge is better. I'll create it in a subsequent step or just use span.
// Using span for speed now.

export function TextbookCard({ textbook }: { textbook: Textbook }) {
    return (
        <Card className="flex flex-col h-full overflow-hidden">
            <div className="aspect-[3/4] w-full bg-slate-100 relative">
                {textbook.images && textbook.images[0] ? (
                    // In real app, use next/image
                    <img
                        src={textbook.images[0]}
                        alt={textbook.title}
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        No Image
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80">
                        {textbook.condition}
                    </span>
                </div>
            </div>
            <CardHeader className="p-4">
                <CardTitle className="line-clamp-2 text-lg">{textbook.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                    {textbook.course_id && <span className="font-semibold mr-1">{textbook.course_id}:</span>}
                    {textbook.course_name}
                </p>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1">
                <p className="text-sm line-clamp-3 text-slate-600">
                    {textbook.description}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                    <Link href={`/textbooks/${textbook.id}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
