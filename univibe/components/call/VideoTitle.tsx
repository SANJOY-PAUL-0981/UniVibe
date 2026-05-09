"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type Props = {
    stream: MediaStream | null
    label: string
    muted?: boolean
    avatarUrl?: string | null
    avatarInitials?: string
}

export default function VideoTitle({ stream, label, muted = false, avatarUrl, avatarInitials }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [videoActive, setVideoActive] = useState(!!stream)

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream
            if (stream) {
                videoRef.current.play().catch(console.error)
                setVideoActive(true)
            } else {
                setVideoActive(false)
            }
        }
    }, [stream])

    return (
        <div className="relative h-full w-full bg-secondary rounded-2xl overflow-hidden">
            {videoActive && stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    muted={muted}
                    playsInline
                    className="h-full w-full object-cover object-center"
                />
            ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted/40">
                    <div className="flex flex-col items-center gap-2">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={label} className="h-24 w-24 rounded-full object-cover" />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                                <span className="text-2xl font-semibold text-foreground">
                                    {avatarInitials ??
                                        label
                                            .split(/[/\s_-]+/)
                                            .map((w: string) => w[0] || "")
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <span className="absolute left-6 top-3 text-sm font-medium text-foreground drop-shadow-sm">
                {label}
            </span>
        </div>
    )
}