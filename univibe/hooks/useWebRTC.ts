import { iceConfig } from "@/config/webrtc.config"
import { Socket } from "socket.io-client"
import { useRef, useEffect } from "react"
import { useCallStore } from "@/store/useCallStore"

export const useWebRTC = (socket: Socket, roomId: string | null) => {
    const { setLocalStream, setRemoteStream } = useCallStore()
    const pc = useRef<RTCPeerConnection | null>(null)

    const initConnection = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })
            setLocalStream(stream)

            pc.current = new RTCPeerConnection(iceConfig)

            stream.getTracks().forEach(track => {
                pc.current?.addTrack(track, stream)
            })

            pc.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("signal", {
                        roomId,
                        signal: { candidate: event.candidate }
                    })
                }
            }

            pc.current.ontrack = (event) => {
                const remoteStream = new MediaStream()
                remoteStream.addTrack(event.track)
                setRemoteStream(remoteStream)
            }

            pc.current.onnegotiationneeded = async () => {
                if (!roomId) return
                const offer = await pc.current!.createOffer()
                await pc.current!.setLocalDescription(offer)
                socket.emit("signal", {
                    roomId,
                    signal: { type: "offer", sdp: pc.current!.localDescription }
                })
            }
        } catch (err) {
            console.error(err)
        }
    }

    const closeConnection = () => {
        pc.current?.close()
        pc.current = null
        socket.off("signal")
    }

    useEffect(() => {
        initConnection()

        socket.on("signal", async ({ signal }) => {
            if (signal.type === "offer") {
                await pc.current?.setRemoteDescription(
                    new RTCSessionDescription({ type: "offer", sdp: signal.sdp })
                )

                const answer = await pc.current?.createAnswer()
                await pc.current?.setLocalDescription(answer)
                socket.emit("signal", {
                    roomId,
                    signal: { type: "answer", sdp: pc.current?.localDescription }
                })
            }

            if (signal.type === "answer") {
                await pc.current?.setRemoteDescription(
                    new RTCSessionDescription({ type: "answer", sdp: signal.sdp })
                )
            }

            if (signal.type === "ice-candidate") {
                await pc.current?.addIceCandidate(signal.candidate)
            }
        })

        return () => closeConnection()
    }, [socket, roomId])
}