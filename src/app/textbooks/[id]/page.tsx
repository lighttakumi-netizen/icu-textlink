import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getTextbook, requestTextbook } from "../actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Library } from "lucide-react"
import { RequestButton } from "@/components/RequestButton"

export default async function TextbookDetailsPage({ params }: { params: { id: string } }) {
    const textbook = await getTextbook(params.id)

    if (!textbook) {
        notFound()
    }

    async function handleRequest() {
        "use server"
        await requestTextbook(params.id)
        redirect('/dashboard') // Or stay here and show success
    }

    return (
        <div className="container py-10 max-w-4xl">
            <Button asChild variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
                <Link href="/textbooks" className="flex items-center gap-2 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Textbooks
                </Link>
            </Button>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Image Placeholder */}
                <div className="aspect-[3/4] bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                    {textbook.images && textbook.images.length > 0 ? (
                        <img src={textbook.images[0]} alt={textbook.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Library className="h-16 w-16 opacity-20" />
                            <span>No Image</span>
                        </div>
                    )}
                </div>

                {/* Right: Details */}
                <div className="space-y-6">
                    <div>
                        <Badge variant={textbook.is_available ? "default" : "secondary"} className="mb-4">
                            {textbook.is_available ? "Available" : "Unavailable"}
                        </Badge>
                        <h1 className="text-3xl font-bold font-heading">{textbook.title}</h1>
                        <p className="text-xl text-muted-foreground mt-2">{textbook.course_name}</p>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Lender</p>
                            <p className="text-sm text-muted-foreground">{textbook.profiles?.full_name || "Unknown User"}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold block text-primary">Condition</span>
                                <span className="text-muted-foreground">{textbook.condition}</span>
                            </div>
                            <div>
                                <span className="font-semibold block text-primary">Price</span>
                                <span className="text-muted-foreground">¥1,500 / term (Fixed)</span>
                            </div>
                        </div>

                        <div>
                            <span className="font-semibold block text-sm mb-1 text-primary">Description</span>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {textbook.description || "No description provided."}
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t">
                        <RequestButton textbookId={textbook.id} />
                        <p className="text-xs text-center text-muted-foreground mt-4">
                            By clicking Request, you agree to our Terms of Service.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
