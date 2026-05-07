"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useCallStore } from "@/store/useCallStore";
import CallChat from "@/components/call/CallChat";
import VideoTile from "@/components/call/VideoTitle";
import CallControls from "@/components/call/CallControls";
import WaitingScreen from "@/components/call/WaitingScreen";
import { NoMatchScreen } from "@/components/call/NoMatchScreen";

type Mode = "waiting" | "connected";

type Props = {
  profileId: string;
  roomId: string;
  isInitiator: boolean;
};

export default function CallClient({ profileId, roomId, isInitiator }: Props) {
  const router = useRouter();
  const socket = useSocket();
  const {
    localStream,
    remoteStream,
    filters,
    currentDomain,
    reset,
    setRemoteStream,
    setRoomId,
  } = useCallStore();
  const [mode, setMode] = useState<Mode>("waiting");
  const [checking, setChecking] = useState(true);
  const [currentRoomId, setCurrentRoomId] = useState(roomId);
  const [currentIsInitiator, setCurrentIsInitiator] = useState(isInitiator);
  const [noMatch, setNoMatch] = useState(false);
  const [reMatchTimeLeft, setReMatchTimeLeft] = useState(60);
  const skipInProgressRef = useRef(false);
  const noMatchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reMatchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const listenerRegisteredRef = useRef(false);
  const [canSkip, setCanSkip] = useState(false);
  const [cooldown, setCooldown] = useState(5);
  const [actionLocked, setActionLocked] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useWebRTC(socket, currentRoomId, currentIsInitiator);

  useEffect(() => {
    if (mode === "connected") {
      setCanSkip(false);
      setCooldown(5);

      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanSkip(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [mode]);

  useEffect(() => {
      const fromConnecting = sessionStorage.getItem("fromConnecting")
      if (!fromConnecting) {
          router.push("/home")
          return
      }
      sessionStorage.removeItem("fromConnecting")
      setChecking(false)
  }, [])
//   useEffect(() => {
//     //Temporary code snippet
//     setChecking(false);
//     setMode("connected");
//   }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.disconnect();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (remoteStream && skipInProgressRef.current === false) {
      setMode("connected");
      if (noMatchTimeoutRef.current) clearTimeout(noMatchTimeoutRef.current);
      if (reMatchTimerRef.current) clearInterval(reMatchTimerRef.current);
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!socket) return;
    if (listenerRegisteredRef.current) return;

    socket.off("skipped");
    socket.off("peer_disconnected");
    socket.off("match_found");
    socket.off("peer_skipping");

    socket.on("skipped", () => {
      skipInProgressRef.current = true;
      setRemoteStream(null);
      setMode("waiting");
      setReMatchTimeLeft(60);

      startReMatchTimer();

      socket.emit("join", {
        profileId,
        filters,
        currentDomain,
      });
    });

    socket.on("peer_disconnected", () => {
      skipInProgressRef.current = true;
      setRemoteStream(null);
      setMode("waiting");
      setReMatchTimeLeft(60);

      startReMatchTimer();

      socket.emit("join", {
        profileId,
        filters,
        currentDomain,
      });
    });

    socket.on(
      "match_found",
      ({
        roomId: newRoomId,
        isInitiator: newIsInitiator,
      }: {
        roomId: string;
        isInitiator: boolean;
      }) => {
        skipInProgressRef.current = false;
        setActionLocked(false);
        setCurrentRoomId(newRoomId);
        setCurrentIsInitiator(newIsInitiator);
        setRoomId(newRoomId);

        if (noMatchTimeoutRef.current) clearTimeout(noMatchTimeoutRef.current);
        if (reMatchTimerRef.current) clearInterval(reMatchTimerRef.current);
      },
    );

    socket.on("peer_skipping", () => {
      skipInProgressRef.current = true;
      setRemoteStream(null);
      setMode("waiting");
      setReMatchTimeLeft(60);

      startReMatchTimer();
    });

    listenerRegisteredRef.current = true;

    return () => {
      socket.off("skipped");
      socket.off("peer_disconnected");
      socket.off("match_found");
      socket.off("peer_skipping");
    };
  }, [socket]);

  const startReMatchTimer = () => {
    if (reMatchTimerRef.current) clearInterval(reMatchTimerRef.current);

    noMatchTimeoutRef.current = setTimeout(() => {
      setNoMatch(true);
    }, 60000);

    setReMatchTimeLeft(60);
    reMatchTimerRef.current = setInterval(() => {
      setReMatchTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(reMatchTimerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSkip = () => {
    if (actionLocked || !canSkip) return;

    setActionLocked(true);

    skipInProgressRef.current = true;
    setRemoteStream(null);
    setMode("waiting");
    setReMatchTimeLeft(60);
    startReMatchTimer();

    socket.emit("skip", { roomId: currentRoomId });
  };

  const handleDisconnect = () => {
    if (noMatchTimeoutRef.current) clearTimeout(noMatchTimeoutRef.current);
    if (reMatchTimerRef.current) clearInterval(reMatchTimerRef.current);
    socket.disconnect();
    reset();
    router.push("/home");
  };

  if (checking) return null;

  if (noMatch) {
    return <NoMatchScreen />;
  }

  if (mode === "waiting") {
    return (
      <WaitingScreen
        message="Looking for next person..."
        timeLeft={reMatchTimeLeft}
        onCancel={handleDisconnect}
        showTimer={true}
      />
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-linear-to-b from-muted/30 to-transparent dark:from-muted/10" />

      <div className="relative flex h-full w-full">
        {/* Left side: Video and Controls */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <div className="relative flex-1 overflow-hidden w-[96%] mx-auto">
            <div className="absolute inset-0 h-[80vh] my-auto">
              <VideoTile stream={remoteStream} label="Stranger" muted={false} />
            </div>

            <div className="absolute right-10 bottom-24 z-20 h-36 w-52 overflow-hidden rounded-2xl border-2 border-border bg-secondary/80 shadow-3xl backdrop-blur-md sm:h-40 sm:w-60">
              <VideoTile
                key={remoteStream?.id ?? "remote"}
                stream={localStream}
                label="You"
                muted={true}
              />
            </div>

            <div className="absolute left-4 top-2 z-20 rounded-full border border-border bg-muted/60 px-2 py-1 text-xs text-foreground shadow-lg backdrop-blur-md">
              {currentIsInitiator ? "You started this room" : "In a call"}
            </div>
          </div>

          <div className="relative z-20 border-t border-border bg-secondary/40 backdrop-blur-xl">
            <CallControls
              mode={mode}
              onSkip={handleSkip}
              onDisconnect={handleDisconnect}
              onOpenChat={() => setIsChatOpen(true)}
              canSkip={canSkip}
              cooldown={cooldown}
              actionLocked={actionLocked}
              isChatOpen={isChatOpen}
            />
          </div>
        </div>

        {/* Right side: Chat Panel */}
        {isChatOpen && (
          <div className="h-[92vh] w-[380px] bg-background shadow-2xl rounded-2xl mt-auto border border-border">
            <CallChat
              socket={socket}
              roomId={currentRoomId}
              profileId={profileId}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
