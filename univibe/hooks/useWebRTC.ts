import { iceConfig } from "@/config/webrtc.config"
import { Socket } from "socket.io-client"
import { useRef, useEffect } from "react"
import { useCallStore } from "@/store/useCallStore"

export const useWebRTC = (socket: Socket, roomId: string | null, isInitiator: boolean = false) => {
    const { setLocalStream, setRemoteStream } = useCallStore()
    const pc = useRef<RTCPeerConnection | null>(null)

    const initConnection = async (isInitiator: boolean) => {
        try {
            closeConnection()
            const existingStream = useCallStore.getState().localStream
            let stream: MediaStream
            if (existingStream) {
                stream = existingStream
            } else {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: false,
                    audio: true
                })
                setLocalStream(stream)
            }

            pc.current = new RTCPeerConnection(iceConfig)

            stream.getTracks().forEach(track => {
                pc.current?.addTrack(track, stream)
            })

            pc.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("signal", {
                        roomId,
                        signal: { type: "ice-candidate", candidate: event.candidate }
                    })
                } else {
                    console.log("ICE gathering complete")
                }
            }

            pc.current.ontrack = (event) => {
                if (event.streams && event.streams[0]) {
                    setRemoteStream(event.streams[0])
                } else {
                    const current = useCallStore.getState().remoteStream ?? new MediaStream()
                    current.addTrack(event.track)
                    setRemoteStream(current)
                }
            }

            socket.off("signal")

            socket.on("signal", async ({ signal }) => {
                if (!pc.current) {
                    return
                }

                try {
                    if (signal.type === "offer") {
                        if (pc.current.signalingState !== "stable") {
                            return
                        }
                        await pc.current.setRemoteDescription(
                            new RTCSessionDescription({ type: "offer", sdp: signal.sdp })
                        )
                        const answer = await pc.current.createAnswer()
                        await pc.current.setLocalDescription(answer)
                        socket.emit("signal", {
                            roomId,
                            signal: { type: "answer", sdp: answer.sdp }
                        })
                    }

                    if (signal.type === "answer") {
                        if (pc.current.signalingState !== "have-local-offer") {
                            return
                        }
                        await pc.current.setRemoteDescription(
                            new RTCSessionDescription({ type: "answer", sdp: signal.sdp })
                        )
                    }

                    if (signal.type === "ice-candidate") {
                        try {
                            await pc.current.addIceCandidate(
                                new RTCIceCandidate(signal.candidate)
                            )
                        } catch (err) {
                            console.error("ICE candidate error:", err)
                        }
                    }
                } catch (err) {
                    console.error("Signal handling error:", err)
                }
            })

            socket.off("ready")

            socket.on("ready", async () => {
                if (!isInitiator || !pc.current) return

                const offer = await pc.current.createOffer()
                await pc.current.setLocalDescription(offer)

                socket.emit("signal", {
                    roomId,
                    signal: { type: "offer", sdp: offer.sdp }
                })
            })
            socket.emit("client_ready", { roomId })

        } catch (err) {
            console.error(err)
            closeConnection()
        }
    }

    const closeConnection = () => {
        if (pc.current) {
            pc.current.close()
            pc.current = null
        }
        socket.off("ready")
        socket.off("signal")
    }

    useEffect(() => {
        if (!socket) return
        if (!roomId) return

        initConnection(isInitiator)

        return () => closeConnection()
    }, [roomId])
}