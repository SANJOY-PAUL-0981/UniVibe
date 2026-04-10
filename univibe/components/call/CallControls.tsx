"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff } from "lucide-react"
import { useCallStore } from "@/store/useCallStore"

type Mode = "waiting" | "connected" | "skipped" | "peer-left"

type Props = {
    mode: Mode
    onSkip?: () => void
    onDisconnect: () => void
    onNewCall?: () => void
    onCancel?: () => void
}

export default function CallControls({ mode, onSkip, onDisconnect, onNewCall, onCancel }: Props) {
    const { localStream } = useCallStore()
    const [micOn, setMicOn] = useState(true)
    const [camOn, setCamOn] = useState(true)

    const toggleMic = () => {
        localStream?.getAudioTracks().forEach(track => {
            track.enabled = !micOn
        })
        setMicOn(prev => !prev)
    }

    const toggleCam = () => {
        localStream?.getVideoTracks().forEach(track => {
            track.enabled = !camOn
        })
        setCamOn(prev => !prev)
    }

    return (
        <div className="flex items-center justify-center gap-3 p-4 border-t border-border/50">

            <Button
                variant="outline"
                size="icon"
                onClick={toggleMic}
            >
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>

            <Button
                variant="outline"
                size="icon"
                onClick={toggleCam}
            >
                {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>

            {mode === "waiting" && (
                <Button variant="destructive" onClick={onCancel}>
                    Cancel
                </Button>
            )}

            {mode === "connected" && (
                <>
                    <Button variant="secondary" onClick={onSkip}>
                        Skip
                    </Button>
                    <Button variant="destructive" onClick={onDisconnect}>
                        Disconnect
                    </Button>
                </>
            )}

            {mode === "skipped" && (
                <>
                    <Button variant="secondary" onClick={onNewCall}>
                        New Call
                    </Button>
                    <Button variant="destructive" onClick={onDisconnect}>
                        Disconnect
                    </Button>
                </>
            )}

            {mode === "peer-left" && (
                <>
                    <Button variant="secondary" onClick={onNewCall}>
                        Start Call
                    </Button>
                    <Button variant="destructive" onClick={onDisconnect}>
                        Disconnect
                    </Button>
                </>
            )}

        </div>
    )
}