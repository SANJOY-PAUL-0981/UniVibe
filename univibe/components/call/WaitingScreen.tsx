"use client"

import { useCallStore } from "@/store/useCallStore"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import VideoTile from "@/components/call/VideoTitle"

type Props = {
    message: string
    timeLeft: number
    onCancel: () => void
}

export default function WaitingScreen({ message, onCancel, timeLeft }: Props) {
    const { localStream } = useCallStore()

    return (
        <div className="h-screen w-full flex flex-col">
            <ResizablePanelGroup orientation="horizontal" className="flex-1">

                <ResizablePanel defaultSize={30} minSize={20}>
                    <div className="flex flex-col h-full">

                        <ResizablePanelGroup orientation="vertical" className="flex-1">

                            {/* Top: Remote */}
                            <ResizablePanel defaultSize={40} minSize={20}>
                                <div className="relative h-full w-full bg-zinc-900 flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                                    <p className="text-sm text-zinc-400">{message}</p>
                                    <p className="text-xs text-zinc-500">{timeLeft}s</p>
                                    <span className="absolute top-3 left-3 text-xs text-zinc-500 font-medium">
                                        Stranger
                                    </span>
                                </div>
                            </ResizablePanel>

                            <ResizableHandle withHandle />

                            {/* Bottom: Local*/}
                            <ResizablePanel defaultSize={40} minSize={20}>
                                <VideoTile
                                    stream={localStream}
                                    label="You"
                                    muted={true}
                                />
                            </ResizablePanel>

                        </ResizablePanelGroup>

                        {/* Controls */}
                        <div className="flex items-center justify-center p-4 border-t border-border/50">
                            <Button variant="destructive" onClick={onCancel}>
                                Cancel
                            </Button>
                        </div>

                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Chat (import component after creating) */}
                <ResizablePanel defaultSize={70} minSize={30}>
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