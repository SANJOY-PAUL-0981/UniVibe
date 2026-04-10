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
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    return (
        <div className="relative h-full w-full bg-zinc-900">
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
                    <p className="text-xs text-zinc-500">No video</p>
                </div>
            )}
            <span className="absolute top-3 left-3 text-xs text-zinc-500 font-medium">
                {label}
            </span>
        </div>
    )
}