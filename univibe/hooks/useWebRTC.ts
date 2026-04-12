import { iceConfig } from "@/config/webrtc.config"
import { Socket } from "socket.io-client"
import { useRef, useEffect } from "react"
import { useCallStore } from "@/store/useCallStore"

export const useWebRTC = (socket: Socket, roomId: string | null, isInitiator: boolean = false) => {
    const { setLocalStream, setRemoteStream } = useCallStore()
    const pc = useRef<RTCPeerConnection | null>(null)

    const initConnection = async (isInitiator: boolean) => {
        try {
            const existingStream = useCallStore.getState().localStream
            let stream: MediaStream
            if (existingStream) {
                stream = existingStream
            } else {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                })
                setLocalStream(stream)
            }

            pc.current = new RTCPeerConnection(iceConfig)

            pc.current.onconnectionstatechange = () => {
                console.log("Connection state:", pc.current?.connectionState)
            }

            pc.current.oniceconnectionstatechange = () => {
                console.log("ICE connection state:", pc.current?.iceConnectionState)
            }

            stream.getTracks().forEach(track => {
                pc.current?.addTrack(track, stream)
            })

            pc.current.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log("ICE candidate:", event.candidate)
                    socket.emit("signal", {
                        roomId,
                        signal: { type: "ice-candidate", candidate: event.candidate }
                    })
                } else {
                    console.log("ICE gathering complete")
                }
            }

            pc.current.ontrack = (event) => {
                console.log("Remote track received:", event.track)
                if (event.streams && event.streams[0]) {
                    setRemoteStream(event.streams[0])
                } else {
                    const current = useCallStore.getState().remoteStream ?? new MediaStream()
                    current.addTrack(event.track)
                    setRemoteStream(current)
                }
            }

            /*pc.current.onnegotiationneeded = async () => {
                console.log("Negotiation needed, roomId:", roomId, "isInitiator:", isInitiator)
                if (!roomId) return
                if (!isInitiator) return
                const offer = await pc.current!.createOffer()
                await pc.current!.setLocalDescription(offer)
                console.log("Sending offer SDP:", offer.sdp)
                socket.emit("signal", {
                    roomId,
                    signal: { type: "offer", sdp: offer.sdp }
                })
            }*/

            // register signal listener AFTER pc is ready
            socket.off("signal")

            socket.on("signal", async ({ signal }) => {
                console.log("Signal received:", signal.type ?? "ice-candidate")
                console.log("pc.current:", pc.current)

                if (!pc.current) {
                    console.log("pc.current is null, ignoring signal")
                    return
                }

                if (signal.type === "offer") {
                    await pc.current.setRemoteDescription(
                        new RTCSessionDescription({ type: "offer", sdp: signal.sdp })
                    )
                    const answer = await pc.current.createAnswer()
                    await pc.current.setLocalDescription(answer)
                    console.log("Sending answer SDP:", answer.sdp)
                    socket.emit("signal", {
                        roomId,
                        signal: { type: "answer", sdp: answer.sdp }
                    })
                }

                if (signal.type === "answer") {
                    console.log("Answer SDP:", signal.sdp)
                    await pc.current.setRemoteDescription(
                        new RTCSessionDescription({ type: "answer", sdp: signal.sdp })
                    )
                }

                if (signal.type === "ice-candidate") {
                    await pc.current.addIceCandidate(
                        new RTCIceCandidate(signal.candidate)
                    )
                }
            })

            socket.off("ready")

            setTimeout(async () => {
                if (!pc.current || !isInitiator) return

                console.log("Fallback offer trigger")

                const offer = await pc.current.createOffer()
                await pc.current.setLocalDescription(offer)

                socket.emit("signal", {
                    roomId,
                    signal: { type: "offer", sdp: offer.sdp }
                })
            }, 5000)
            /*socket.on("ready", async () => {
                console.log("Ready event received, isInitiator:", isInitiator)
                if (!isInitiator || !pc.current) return

                const offer = await pc.current.createOffer()
                await pc.current.setLocalDescription(offer)
                console.log("Sending offer SDP:", offer.sdp)
                socket.emit("signal", {
                    roomId,
                    signal: { type: "offer", sdp: offer.sdp }
                })
            })*/

        } catch (err) {
            console.error(err)
        }
    }

    const closeConnection = () => {
        pc.current?.close()
        pc.current = null
        socket.off("ready")
    }

    useEffect(() => {
        if (!socket) return
        if (!roomId && isInitiator) return
        initConnection(isInitiator)
        return () => closeConnection()
    }, [roomId])
}