"use client"

import { useEffect, useRef } from "react"

type Props = {
    stream: MediaStream | null
    label: string
    muted?: boolean
}

export default function VideoTitle({ stream, label, muted = false }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream
            if (stream) {
                videoRef.current.play().catch(console.error)
            }
        }
    }, [stream])

    return (
        <div className="relative h-full w-full bg-secondary">
            {stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    muted={muted}
                    playsInline
                    className="h-full w-full object-contain"
                />
            ) : (
                <div className="h-full w-full flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">No video</p>
                </div>
            )}
            <span className="absolute top-3 left-3 text-xs text-muted-foreground font-medium">
                {label}
            </span>
        </div>
    )
}