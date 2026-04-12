import { io } from "socket.io-client"
import { useEffect } from "react"

// local
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
    autoConnect: false,
    reconnection: false
})

//ngrok
/*const socket = io(window.location.origin, {
    autoConnect: false,
    reconnection: false
})*/

export const useSocket = () => {
    useEffect(() => {
        socket.connect()
        return () => {
            
        }
    }, [])

    return socket
}