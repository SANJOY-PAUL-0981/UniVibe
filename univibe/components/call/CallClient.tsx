"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSocket } from "@/hooks/useSocket"
import { useWebRTC } from "@/hooks/useWebRTC"
import { useCallStore } from "@/store/useCallStore"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import VideoTile from "@/components/call/VideoTitle"
import CallControls from "@/components/call/CallControls"

type Mode = "waiting" | "connected" | "skipped" | "peer-left"

type Props = {
    profileId: string
    roomId: string
    isInitiator: boolean
}

export default function CallClient({ profileId, roomId, isInitiator }: Props) {
    const router = useRouter()
    const socket = useSocket()
    const { localStream, remoteStream, filters, currentDomain, reset, setRemoteStream } = useCallStore()
    const [mode, setMode] = useState<Mode>("waiting")
    const [checking, setChecking] = useState(true)

    useWebRTC(socket, roomId, isInitiator)

    // redirect home on refresh
    useEffect(() => {
        const fromConnecting = sessionStorage.getItem("fromConnecting")
        if (!fromConnecting) {
            router.push("/home")
            return
        }
        sessionStorage.removeItem("fromConnecting")
        setChecking(false)
    }, [])

    // cleanup on page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            socket.disconnect()
        }
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [])

    useEffect(() => {
        console.log("remoteStream changed:", remoteStream)
        if (remoteStream) {
            setMode("connected")
        }
    }, [remoteStream])

    useEffect(() => {
        socket.on("skipped", () => {
            setRemoteStream(null)
            setMode("skipped")
        })

        socket.on("peer_disconnected", () => {
            setRemoteStream(null)
            setMode("peer-left")
        })

        return () => {
            socket.off("skipped")
            socket.off("peer_disconnected")
        }
    }, [socket])

    const buildConnectingParams = () => {
        const params = new URLSearchParams()
        params.set("currentDomain", String(currentDomain))
        params.set("filterByGender", String(filters.filterByGender))
        params.set("filterGenderData", filters.filterGenderData)
        params.set("filterByCollege", String(filters.filterByCollege))
        params.set("filterCollegeData", filters.filterCollegeData)
        params.set("filterByFieldOfStudy", String(filters.filterByFieldOfStudy))
        params.set("filterFieldOfStudyData", filters.filterFieldOfStudyData)
        params.set("filterByYear", String(filters.filterByYear))
        params.set("filterYearData", filters.filterYearData)
        return params.toString()
    }

    const handleSkip = () => {
        socket.emit("skip", { roomId })
    }

    const handleNewCall = () => {
        const params = buildConnectingParams()
        router.push(`/call/connecting?${params}`)
    }

    const handleDisconnect = () => {
        socket.disconnect()
        reset()
        router.push("/home")
    }

    if (checking) return null


    return (
        <div className="h-screen w-full flex flex-col">
            <ResizablePanelGroup orientation="horizontal" className="flex-1">

                {/* Left — Videos + Controls */}
                <ResizablePanel defaultSize={40} minSize={20}>
                    <div className="flex flex-col h-full">

                        {/* Videos */}
                        <ResizablePanelGroup orientation="vertical" className="flex-1">

                            {/* Top — Remote video */}
                            <ResizablePanel defaultSize={60} minSize={30}>
                                <VideoTile
                                    stream={remoteStream}
                                    label="Stranger"
                                    muted={false}
                                />
                            </ResizablePanel>

                            <ResizableHandle withHandle />

                            {/* Bottom — Local video */}
                            <ResizablePanel defaultSize={40} minSize={20}>
                                <VideoTile
                                    key={remoteStream?.id ?? "remote"}
                                    stream={localStream}
                                    label="You"
                                    muted={true}
                                />
                            </ResizablePanel>

                        </ResizablePanelGroup>

                        {/* Controls */}
                        <CallControls
                            mode={mode}
                            onSkip={handleSkip}
                            onNewCall={handleNewCall}
                            onDisconnect={handleDisconnect}
                            onCancel={handleDisconnect}
                        />

                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Right — Chat shell */}
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