import { iceConfig } from "@/config/webrtc.config";
import { Socket } from "socket.io-client";
import { useRef, useEffect } from "react";
import { useCallStore } from "@/store/useCallStore";

export const useWebRTC = (
  socket: Socket,
  roomId: string | null,
  isInitiator: boolean = false,
) => {
  const { setLocalStream, setRemoteStream, setRemoteCamOn, setRemoteAudioOn } = useCallStore();
  const pc = useRef<RTCPeerConnection | null>(null);
  const audioSenderRef = useRef<RTCRtpSender | null>(null);
  const videoSenderRef = useRef<RTCRtpSender | null>(null);

  const initConnection = async (isInitiator: boolean) => {
    try {
      closeConnection();
      const existingStream = useCallStore.getState().localStream;
      let stream: MediaStream;
      if (existingStream) {
        stream = existingStream;
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
      }

      pc.current = new RTCPeerConnection(iceConfig);

      stream.getTracks().forEach((track) => {
        const sender = pc.current?.addTrack(track, stream) ?? null;
        if (track.kind === "audio") {
          audioSenderRef.current = sender;
        }
        if (track.kind === "video") {
          videoSenderRef.current = sender;
        }
      });

      pc.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("signal", {
            roomId,
            signal: { type: "ice-candidate", candidate: event.candidate },
          });
        } else {
          console.log("ICE gathering complete");
        }
      };

      pc.current.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        } else {
          const current =
            useCallStore.getState().remoteStream ?? new MediaStream();
          current.addTrack(event.track);
          setRemoteStream(current);
        }

        if (event.track.kind === "video") {
          setRemoteCamOn(true);

          event.track.onmute = () => setRemoteCamOn(false);
          event.track.onunmute = () => setRemoteCamOn(true);
          event.track.onended = () => setRemoteCamOn(false);
        }

        if (event.track.kind === "audio") {
          setRemoteAudioOn(true);

          event.track.onmute = () => setRemoteAudioOn(false);
          event.track.onunmute = () => setRemoteAudioOn(true);
          event.track.onended = () => setRemoteAudioOn(false);
        }
      };

      socket.off("signal");

      socket.on("signal", async ({ signal }) => {
        if (!pc.current) {
          return;
        }

        try {
          if (signal.type === "offer") {
            if (pc.current.signalingState !== "stable") {
              return;
            }
            await pc.current.setRemoteDescription(
              new RTCSessionDescription({ type: "offer", sdp: signal.sdp }),
            );
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            socket.emit("signal", {
              roomId,
              signal: { type: "answer", sdp: answer.sdp },
            });
          }

          if (signal.type === "answer") {
            if (pc.current.signalingState !== "have-local-offer") {
              return;
            }
            await pc.current.setRemoteDescription(
              new RTCSessionDescription({ type: "answer", sdp: signal.sdp }),
            );
          }

          if (signal.type === "ice-candidate") {
            try {
              await pc.current.addIceCandidate(
                new RTCIceCandidate(signal.candidate),
              );
            } catch (err) {
              console.error("ICE candidate error:", err);
            }
          }
        } catch (err) {
          console.error("Signal handling error:", err);
        }
      });

      socket.off("ready");

      socket.on("ready", async () => {
        if (!isInitiator || !pc.current) return;

        const offer = await pc.current.createOffer();
        await pc.current.setLocalDescription(offer);

        socket.emit("signal", {
          roomId,
          signal: { type: "offer", sdp: offer.sdp },
        });
      });
      socket.emit("client_ready", { roomId });
    } catch (err) {
      console.error(err);
      closeConnection();
    }
  };

  const closeConnection = (stopStream = false) => {
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    audioSenderRef.current = null;
    videoSenderRef.current = null;
    if (stopStream) {
      const { localStream } = useCallStore.getState();
      localStream?.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setRemoteCamOn(false);
    setRemoteAudioOn(false);
    socket.off("ready");
    socket.off("signal");
  };

  useEffect(() => {
    if (!socket) return;
    if (!roomId) return;

    initConnection(isInitiator);

    return () => closeConnection(true);
  }, [roomId]);

  const replaceTrack = async (
    kind: "audio" | "video",
    newTrack: MediaStreamTrack | null,
  ) => {
    if (!pc.current) return;

    const senderRef = kind === "audio" ? audioSenderRef : videoSenderRef;
    const stream = useCallStore.getState().localStream;

    if (senderRef.current) {
      await senderRef.current.replaceTrack(newTrack);
      return;
    }

    if (newTrack && stream) {
      const sender = pc.current.addTrack(newTrack, stream);
      senderRef.current = sender;
    }
  };

  return { replaceTrack };
};
