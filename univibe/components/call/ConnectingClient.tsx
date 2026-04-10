"use client"

import { useEffect, useState } from "react"
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
    const { setRoomId, setCallStatus } = useCallStore()
    const [message, setMessage] = useState("Looking for someone...")
    const [noMatch, setNoMatch] = useState(false)
    const [checking, setChecking] = useState(true)
    const [timeLeft, setTimeLeft] = useState(60)

    useWebRTC(socket, null)

    // redirect home on refresh
    useEffect(() => {
        const fromHome = sessionStorage.getItem("fromHome")
        if (!fromHome) {
            router.push("/home")
            return
        }
        sessionStorage.removeItem("fromHome")
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
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [timeLeft]) // restart when timeLeft resets

    useEffect(() => {
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
                filterYearData: filters.filterYearData ? parseInt(filters.filterYearData) : null,
            },
            currentDomain
        })

        socket.on("waiting", ({ message }: { message: string }) => {
            setCallStatus("waiting")
            setMessage(message)
        })

        socket.on("searching_domain", ({ domain }: { domain: number }) => {
            console.log("searching_domain fired:", domain)
            const domainMessages: Record<number, string> = {
                0: "Looking for someone from your college...",
                1: "Looking for someone in your year...",
                2: "Looking for someone in your field...",
                3: "Looking for anyone..."
            }
            const domainTimers: Record<number, number> = {
                0: 20,
                1: 10,
                2: 10,
                3: 40
            }
            setMessage(domainMessages[domain] ?? "Looking for someone...")
            setTimeLeft(domainTimers[domain] ?? 60)
        })

        socket.on("match_found", ({ roomId }: { roomId: string }) => {
            setRoomId(roomId)
            setCallStatus("connected")

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

            router.replace(`/call/${roomId}?${params.toString()}`)
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
        />
    )
}