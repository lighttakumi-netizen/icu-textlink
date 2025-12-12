'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage, getMessages } from '@/app/chat/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send } from "lucide-react"

type Message = {
    id: string
    content: string
    created_at: string
    sender_id: string
    sender: {
        full_name: string
    }
}

export function ChatBox({ transactionId, currentUserId }: { transactionId: string, currentUserId: string }) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Fetch initial messages
    useEffect(() => {
        getMessages(transactionId).then((data: any) => {
            setMessages(data)
            setIsLoading(false)
            scrollToBottom()
        })

        // Realtime Subscription
        const channel = supabase
            .channel(`chat:${transactionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `transaction_id=eq.${transactionId}`
                },
                async (payload) => {
                    // When new message arrives, fetch sender details (simple way) or optimistically add
                    // Since payload doesn't have sender name relation, we re-fetch nicely or just append if self
                    const newMsg = payload.new as any

                    // Avoid duplicate if we optimistically added self-message
                    setMessages(prev => {
                        if (prev.find(m => m.id === newMsg.id)) return prev
                        // We need sender info. For now, pushing a placeholder if not self, or re-fetching
                        // Re-fetching strictly the new one would be better but simple re-fetch all is easiest for consistency
                        getMessages(transactionId).then(data => {
                            setMessages(data as any)
                            scrollToBottom()
                        })
                        return prev
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [transactionId, supabase])

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: 'smooth' })
            }
        }, 100)
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || isSending) return

        const content = newMessage.trim()
        setNewMessage('') // Clear input immediately

        // Optimistic Update
        const optimisticMsg: Message = {
            id: 'temp-' + Date.now(),
            content: content,
            created_at: new Date().toISOString(),
            sender_id: currentUserId,
            sender: { full_name: 'You' } // Placeholder
        }

        setMessages(prev => [...prev, optimisticMsg])
        scrollToBottom()

        // Send to backend
        const res = await sendMessage(transactionId, content)

        if (!res.success) {
            // Revert on failure
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
            setNewMessage(content)
            alert('Failed to send message')
        } else {
            // Success: Realtime subscription will likely bring the "real" message back.
            // We should handle deduping in the subscription or just let the key/id update ideally.
            // But strict Supabase realtime might echo it back.
            // For now, simpler to just keep the optimistic one until refresh or let realtime dedup logic handle it.
        }
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-3 border-b bg-slate-50 font-medium text-slate-700">
                Chat History
            </div>

            <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : messages.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm py-4">No messages yet. Say hi!</p>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => {
                            const isMe = msg.sender_id === currentUserId
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${isMe ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                                        }`}>
                                        <div className="font-bold text-xs mb-0.5 opacity-80">
                                            {isMe ? 'You' : msg.sender?.full_name}
                                        </div>
                                        {msg.content}
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={scrollRef} />
                    </div>
                )}
            </ScrollArea>

            <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
                <Input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                />
                <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    )
}
