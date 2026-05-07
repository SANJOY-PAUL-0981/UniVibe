"use client"

import { useEffect, useRef, useState } from "react"
import type { Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChatStore, type ChatMessage } from "@/store/useChatStore"
import { X } from "lucide-react"

type Props = {
	socket: Socket
	roomId: string
	profileId: string
	onClose: () => void
}

export default function CallChat({ socket, roomId, profileId, onClose }: Props) {
	const [message, setMessage] = useState("")
	const messagesEndRef = useRef<HTMLDivElement | null>(null)

	const { messages, addMessage, clearMessages, setActiveRoomId } = useChatStore()

	useEffect(() => {
		setActiveRoomId(roomId)
		clearMessages()

		const handleNewMessage = (payload: ChatMessage) => {
			addMessage(payload)
		}

		socket.on("newMessage", handleNewMessage)

		return () => {
			socket.off("newMessage", handleNewMessage)
			clearMessages()
			setActiveRoomId(null)
		}
	}, [socket, roomId, addMessage, clearMessages, setActiveRoomId])

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [messages])

	const handleSendMessage = () => {
		const trimmedMessage = message.trim()

		if (!trimmedMessage) return

		const outgoingMessage: ChatMessage = {
			id: crypto.randomUUID(),
			roomId,
			senderId: profileId,
			message: trimmedMessage,
			createdAt: Date.now(),
		}

		addMessage(outgoingMessage)
		socket.emit("sendMessage", {
			roomId,
			message: trimmedMessage,
			senderId: profileId,
		})

		setMessage("")
	}

	return (
		<div className="flex h-full w-full flex-col bg-background">
			<div className="flex items-center justify-between border-b border-border/50 p-4">
				<div>
					<p className="text-sm font-medium">Chat</p>
					<p className="text-xs text-muted-foreground">Room {roomId}</p>
				</div>
				<Button
					variant="outline"
					size="icon"
					onClick={onClose}
					aria-label="Close chat"
					className="shrink-0 border-border/60 bg-background text-foreground shadow-sm"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>

			<div className="flex-1 space-y-3 overflow-y-auto p-4">
				{messages.map((chatMessage) => {
					const isOwnMessage = chatMessage.senderId === profileId

					return (
						<div
							key={chatMessage.id}
							className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
									isOwnMessage
										? "bg-primary text-primary-foreground"
										: "bg-muted text-foreground"
								}`}
							>
								{chatMessage.message}
							</div>
						</div>
					)
				})}
				<div ref={messagesEndRef} />
			</div>

			<div className="flex gap-2 border-t border-border/50 p-4">
				<Input
					value={message}
					onChange={(event) => setMessage(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							handleSendMessage()
						}
					}}
					placeholder="Type a message..."
				/>
				<Button onClick={handleSendMessage}>Send</Button>
			</div>
		</div>
	)
}

