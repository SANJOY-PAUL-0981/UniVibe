"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff } from "lucide-react"
import { useCallStore } from "@/store/useCallStore"

type Mode = "waiting" | "connected"

type Props = {
    mode: Mode
    onSkip: () => void
    onDisconnect: () => void
    canSkip: boolean
    cooldown: number
    actionLocked: boolean
}

export default function CallControls({ mode, onSkip, onDisconnect, canSkip, cooldown, actionLocked }: Props) {
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

            {mode === "connected" && (
                <>
                    <Button
                        variant="secondary"
                        onClick={onSkip}
                        disabled={!canSkip || actionLocked}>
                        {!canSkip ? `Skip (${cooldown})` : "Skip"}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onDisconnect}
                        disabled={!canSkip || actionLocked}>
                        {!canSkip ? `Exit (${cooldown})` : "Exit"}
                    </Button>
                </>
            )}

        </div>
    )
}