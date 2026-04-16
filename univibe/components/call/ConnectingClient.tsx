"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSocket } from "@/hooks/useSocket"
import { useWebRTC } from "@/hooks/useWebRTC"
import { useCallStore } from "@/store/useCallStore"
import WaitingScreen from "@/components/call/WaitingScreen"
import { NoMatchScreen } from "@/components/call/NoMatchScreen"

type Filters = {
    filterByGender: boolean
    filterGenderData: string
    filterByCollege: boolean
    filterCollegeData: string
    filterByFieldOfStudy: boolean
    filterFieldOfStudyData: string
    filterByYear: boolean
    filterYearData: string
}

type Props = {
    profileId: string,
    currentDomain: number,
    filters: Filters
}

export default function ConnectingClient({ profileId, filters, currentDomain }: Props) {
    const router = useRouter()
    const socket = useSocket()
    const { setRoomId, setCallStatus, setFilters } = useCallStore()
    const [message, setMessage] = useState("Looking for someone...")
    const [noMatch, setNoMatch] = useState(false)
    const [checking, setChecking] = useState(true)
    const [timeLeft, setTimeLeft] = useState(60)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const noMatchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useWebRTC(socket, null)

    useEffect(() => {
        const fromHome = sessionStorage.getItem("fromHome")
        if (!fromHome) {
            router.push("/home")
            return
        }
        sessionStorage.removeItem("fromHome")
        setChecking(false)
    }, [])

    useEffect(() => {
        const handleBeforeUnload = () => {
            socket.disconnect()
        }
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [])

    const startTimer = (seconds: number) => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setTimeLeft(seconds)
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    useEffect(() => {
        setFilters({
            filterByGender: filters.filterByGender,
            filterGenderData: filters.filterGenderData,
            filterByCollege: filters.filterByCollege,
            filterCollegeData: filters.filterCollegeData,
            filterByFieldOfStudy: filters.filterByFieldOfStudy,
            filterFieldOfStudyData: filters.filterFieldOfStudyData,
            filterByYear: filters.filterByYear,
            filterYearData: filters.filterYearData,
        }, currentDomain)
    }, [])

    useEffect(() => {
        const isRandom = !filters.filterByCollege && !filters.filterByYear && !filters.filterByFieldOfStudy
        startTimer(isRandom ? 60 : 20)
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    useEffect(() => {
        noMatchTimeoutRef.current = setTimeout(() => {
            setNoMatch(true)
            setCallStatus("ended")
        }, 60000)

        return () => {
            if (noMatchTimeoutRef.current) clearTimeout(noMatchTimeoutRef.current)
        }
    }, [])

    useEffect(() => {
        if (!socket) return;

        socket.off("waiting")
        socket.off("searching_domain")
        socket.off("match_found")
        socket.off("no_match_found")
        socket.off("error")

        const parsedYearData = filters.filterYearData && filters.filterYearData.trim() !== ""
            ? parseInt(filters.filterYearData)
            : null

        socket.emit("join", {
            profileId,
            filters: {
                filterByGender: filters.filterByGender,
                filterGenderData: filters.filterGenderData,
                filterByCollege: filters.filterByCollege,
                filterCollegeData: filters.filterCollegeData,
                filterByFieldOfStudy: filters.filterByFieldOfStudy,
                filterFieldOfStudyData: filters.filterFieldOfStudyData,
                filterByYear: filters.filterByYear,
                filterYearData: parsedYearData,
            },
            currentDomain
        })

        socket.on("waiting", ({ message }: { message: string }) => {
            setCallStatus("waiting")
        })

        socket.on("searching_domain", ({ domain, duration }: { domain: number, duration: number }) => {
            console.log("searching_domain fired:", domain)
            const domainMessages: Record<number, string> = {
                0: "Looking for someone in college...",
                1: "Looking for someone in year...",
                2: "Looking for someone with field of study...",
                3: "Looking for anyone..."
            }

            startTimer(duration)
            setMessage(domainMessages[domain] ?? "Looking for someone...")
        })

        socket.on("match_found", ({ roomId, isInitiator }: { roomId: string, isInitiator: boolean }) => {
            if (noMatchTimeoutRef.current) clearTimeout(noMatchTimeoutRef.current)

            setRoomId(roomId)
            setCallStatus("connected")
            sessionStorage.setItem("fromConnecting", "true")

            router.replace(`/call/${roomId}?isInitiator=${isInitiator}`)
        })

        socket.on("no_match_found", () => {
            setNoMatch(true)
            setCallStatus("ended")
        })

        socket.on("error", ({ message }: { message: string }) => {
            setMessage(message)
        })

        return () => {
            socket.off("waiting")
            socket.off("searching_domain")
            socket.off("match_found")
            socket.off("no_match_found")
            socket.off("error")
        }
    }, [socket])

    const handleCancel = () => {
        socket.disconnect()
        router.push("/home")
    }

    if (checking) return null
    if (noMatch) return <NoMatchScreen />

    return (
        <WaitingScreen
            message={message}
            timeLeft={timeLeft}
            onCancel={handleCancel}
            showTimer={true}
        />
    )
}