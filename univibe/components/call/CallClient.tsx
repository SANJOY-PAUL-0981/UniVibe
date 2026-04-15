"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSocket } from "@/hooks/useSocket"
import { useWebRTC } from "@/hooks/useWebRTC"
import { useCallStore } from "@/store/useCallStore"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import VideoTile from "@/components/call/VideoTitle"
import CallControls from "@/components/call/CallControls"
import WaitingScreen from "@/components/call/WaitingScreen"
import { NoMatchScreen } from "@/components/call/NoMatchScreen"

type Mode = "waiting" | "connected"

type Props = {
    profileId: string
    roomId: string
    isInitiator: boolean
}

export default function CallClient({ profileId, roomId, isInitiator }: Props) {
    const router = useRouter()
    const socket = useSocket()
    const { localStream, remoteStream, filters, currentDomain, reset, setRemoteStream, setRoomId } = useCallStore()
    const [mode, setMode] = useState<Mode>("waiting")
    const [checking, setChecking] = useState(true)
    const [currentRoomId, setCurrentRoomId] = useState(roomId)
    const [currentIsInitiator, setCurrentIsInitiator] = useState(isInitiator)
    const [noMatch, setNoMatch] = useState(false)
    const [reMatchTimeLeft, setReMatchTimeLeft] = useState(120)
    const skipInProgressRef = useRef(false)
    const noMatchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const reMatchTimerRef = useRef<NodeJS.Timeout | null>(null)
    const listenerRegisteredRef = useRef(false)
    const [canSkip, setCanSkip] = useState(false)
    const [cooldown, setCooldown] = useState(5)
    const [actionLocked, setActionLocked] = useState(false)


    useWebRTC(socket, currentRoomId, currentIsInitiator)

    useEffect(() => {
        if (mode === "connected") {
            setCanSkip(false)
            setCooldown(5)

            const interval = setInterval(() => {
                setCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        setCanSkip(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => clearInterval(interval)
        }
    }, [mode])

    useEffect(() => {
        const fromConnecting = sessionStorage.getItem("fromConnecting")
        if (!fromConnecting) {
            router.push("/home")
            return
        }
        sessionStorage.removeItem("fromConnecting")
        setChecking(false)
    }, [])

    useEffect(() => {
        const handleBeforeUnload = () => {
            socket.disconnect()
        }
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [])

    useEffect(() => {
        console.log("remoteStream changed:", remoteStream)
        if (remoteStream && skipInProgressRef.current === false) {
            setMode("connected")
            if (noMatchTimeoutRef.current) clearTimeout(noMatchTimeoutRef.current)
            if (reMatchTimerRef.current) clearInterval(reMatchTimerRef.current)
        }
    }, [remoteStream])

    useEffect(() => {
        if (!socket) return
        if (listenerRegisteredRef.current) return

        socket.off("skipped")
        socket.off("peer_disconnected")
        socket.off("match_found")

        socket.on("skipped", () => {
            console.log("Skipped! Waiting for next match...")
            skipInProgressRef.current = true
            setRemoteStream(null)
            setMode("waiting")
            setReMatchTimeLeft(120)

            startReMatchTimer()

            socket.emit("join", {
                profileId,
                filters,
                currentDomain
            })
        })

        socket.on("peer_disconnected", () => {
            console.log("Peer disconnected! Waiting for next match...")
            skipInProgressRef.current = true
            setRemoteStream(null)
            setMode("waiting")
            setReMatchTimeLeft(120)

            startReMatchTimer()

            socket.emit("join", {
                profileId,
                filters,
                currentDomain
            })
        })

        socket.on("match_found", ({ roomId: newRoomId, isInitiator: newIsInitiator }: { roomId: string, isInitiator: boolean }) => {
            console.log("New match found! RoomId:", newRoomId, "IsInitiator:", newIsInitiator)
            skipInProgressRef.current = false
            setActionLocked(false)
            setCurrentRoomId(newRoomId)
            setCurrentIsInitiator(newIsInitiator)
            setRoomId(newRoomId)

            if (noMatchTimeoutRef.current) clearTimeout(noMatchTimeoutRef.current)
            if (reMatchTimerRef.current) clearInterval(reMatchTimerRef.current)
        })

        listenerRegisteredRef.current = true

        return () => {
            socket.off("skipped")
            socket.off("peer_disconnected")
            socket.off("match_found")
        }
    }, [socket])

    const startReMatchTimer = () => {
        if (reMatchTimerRef.current) clearInterval(reMatchTimerRef.current)

        noMatchTimeoutRef.current = setTimeout(() => {
            setNoMatch(true)
        }, 120000)

        setReMatchTimeLeft(120)
        reMatchTimerRef.current = setInterval(() => {
            setReMatchTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(reMatchTimerRef.current!)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const handleSkip = () => {
        if (actionLocked || !canSkip) return

        setActionLocked(true)
        socket.emit("skip", { roomId: currentRoomId })
    }

    const handleDisconnect = () => {
        if (noMatchTimeoutRef.current) clearTimeout(noMatchTimeoutRef.current)
        if (reMatchTimerRef.current) clearInterval(reMatchTimerRef.current)
        socket.disconnect()
        reset()
        router.push("/home")
    }

    if (checking) return null

    if (noMatch) {
        return <NoMatchScreen />
    }

    if (mode === "waiting") {
        return (
            <WaitingScreen
                message="Looking for next person..."
                timeLeft={reMatchTimeLeft}
                onCancel={handleDisconnect}
                showTimer={true}
            />
        )
    }

    return (
        <div className="h-screen w-full flex flex-col">
            <ResizablePanelGroup orientation="horizontal" className="flex-1">

                <ResizablePanel defaultSize={40} minSize={20}>
                    <div className="flex flex-col h-full">

                        <ResizablePanelGroup orientation="vertical" className="flex-1">

                            <ResizablePanel defaultSize={60} minSize={30}>
                                <VideoTile
                                    stream={remoteStream}
                                    label="Stranger"
                                    muted={false}
                                />
                            </ResizablePanel>

                            <ResizableHandle withHandle />

                            <ResizablePanel defaultSize={40} minSize={20}>
                                <VideoTile
                                    key={remoteStream?.id ?? "remote"}
                                    stream={localStream}
                                    label="You"
                                    muted={true}
                                />
                            </ResizablePanel>

                        </ResizablePanelGroup>

                        <CallControls
                            mode={mode}
                            onSkip={handleSkip}
                            onDisconnect={handleDisconnect}
                            canSkip={canSkip}
                            cooldown={cooldown}
                            actionLocked={actionLocked}
                        />

                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={60} minSize={30}>
                    <div className="h-full w-full flex flex-col border-l border-border/50">
                        <div className="p-4 border-b border-border/50">
                            <p className="text-sm font-medium">Chat</p>
                        </div>
                        <div className="flex-1" />
                        <div className="p-4 border-t border-border/50">
                            <p className="text-xs text-zinc-500 text-center">Chat coming soon...</p>
                        </div>
                    </div>
                </ResizablePanel>

            </ResizablePanelGroup>
        </div>
    )
}