import { io } from "socket.io-client"
import { useEffect } from "react"

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
    autoConnect: false,
    reconnection: false
})

export const useSocket = () => {
    useEffect(() => {
        socket.connect()
        return () => {
            socket.disconnect()
        }
    }, [])

    return socket
}