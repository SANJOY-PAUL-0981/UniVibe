"use client"

import { useRef, useState } from "react"
import { Play, Pause } from "lucide-react"

export default function Bgm404() {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    const toggleMusic = () => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            audioRef.current.play()
            setIsPlaying(true)
        }
    }

    return (
        <div>
            <audio ref={audioRef} loop>
                <source src="/scuba-cat-404-bgm.mp3" type="audio/mpeg" />
            </audio>

            <button onClick={toggleMusic} className="cursor-pointer">
                {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" /> }
            </button>
        </div>
    )
}