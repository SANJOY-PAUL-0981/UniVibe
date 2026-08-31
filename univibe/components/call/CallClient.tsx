"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSocket } from "@/hooks/useSocket";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useCallStore } from "@/store/useCallStore";
import {
  useProfileStore,
  selectProfileStoreProfile,
} from "@/store/useProfileStore";
import { useChatStore } from "@/store/useChatStore";
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
  const [camOn, setCamOn] = useState(true);
  const [localAudioOn, setLocalAudioOn] = useState(true);
  const remoteCamOn = useCallStore((state) => state.remoteCamOn);
  const remoteAudioOn = useCallStore((state) => state.remoteAudioOn);
  const {
    addMessage,
    clearMessages,
    setActiveRoomId,
    unreadCount,
    incrementUnread,
    resetUnread,
  } = useChatStore();
  const setRemoteProfile = useCallStore((state) => state.setRemoteProfile);
  const remoteProfile = useCallStore((state) => state.remoteProfile);
  const profile = useProfileStore(selectProfileStoreProfile);
  const profileInitials = profile
    ? (profile.username || "")
        .split(/[/\s_-]+/)
        .map((w) => w[0] || "")
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  const { replaceTrack } = useWebRTC(socket, currentRoomId, currentIsInitiator);

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
    const fromConnecting = sessionStorage.getItem("fromConnecting");
    if (!fromConnecting) {
      router.push("/home");
      return;
    }
    sessionStorage.removeItem("fromConnecting");
    setChecking(false);
  }, []);

  useEffect(() => {
    setActiveRoomId(currentRoomId);
    clearMessages();
    resetUnread();
  }, [currentRoomId, clearMessages, resetUnread, setActiveRoomId]);

  useEffect(() => {
    if (isChatOpen) {
      resetUnread();
    }
  }, [isChatOpen, resetUnread]);


  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.disconnect();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    const handleNewMessage = (payload: {
      id: string;
      roomId: string;
      senderId: string;
      message: string;
      createdAt: number;
    }) => {
      if (payload.roomId !== currentRoomId) return;
      if (payload.senderId === profileId) return;

      addMessage(payload);

      if (!isChatOpen) {
        incrementUnread();
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [
    socket,
    currentRoomId,
    profileId,
    isChatOpen,
    addMessage,
    incrementUnread,
  ]);

  useEffect(() => {
    const handleMediaState = ({
      camOn,
      micOn,
    }: {
      camOn?: boolean;
      micOn?: boolean;
    }) => {
      if (typeof camOn === "boolean")
        useCallStore.getState().setRemoteCamOn(camOn);
      if (typeof micOn === "boolean")
        useCallStore.getState().setRemoteAudioOn(micOn);
    };

    socket.on("media_state", handleMediaState);

    return () => {
      socket.off("media_state", handleMediaState);
    };
  }, [socket]);

  useEffect(() => {
    const handleRateLimit = ({ message }: { message?: string }) => {
      toast.error(message ?? "Too many requests. Please wait and try again.");
    };

    socket.on("rate-limit", handleRateLimit);

    return () => {
      socket.off("rate-limit", handleRateLimit);
    };
  }, [socket]);

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
      setRemoteProfile(null);
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
      setRemoteProfile(null);
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
        stranger,
      }: {
        roomId: string;
        isInitiator: boolean;
        stranger?: {
          id?: string;
          username?: string;
          profilePicture?: string | null;
        } | null;
      }) => {
        skipInProgressRef.current = false;
        setActionLocked(false);
        setCurrentRoomId(newRoomId);
        setCurrentIsInitiator(newIsInitiator);
        setRoomId(newRoomId);
        setRemoteProfile(stranger ?? null);

        if (noMatchTimeoutRef.current) clearTimeout(noMatchTimeoutRef.current);
        if (reMatchTimerRef.current) clearInterval(reMatchTimerRef.current);
      },
    );

    socket.on("peer_skipping", () => {
      skipInProgressRef.current = true;
      setRemoteStream(null);
      setRemoteProfile(null);
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
    setRemoteProfile(null);
    setMode("waiting");
    setReMatchTimeLeft(60);
    startReMatchTimer();

    socket.emit("skip", { roomId: currentRoomId });
  };

  const handleDisconnect = () => {
    if (noMatchTimeoutRef.current) clearTimeout(noMatchTimeoutRef.current);
    if (reMatchTimerRef.current) clearInterval(reMatchTimerRef.current);
    socket.disconnect();
    clearMessages();
    resetUnread();
    setActiveRoomId(null);
    reset();
    router.push("/home");
  };

  const handleReport = async () => {
    try {
      const response = await fetch("/api/report", {
        method: "POST",
      });
      const data = await response.json().catch(() => null);

      if (!data?.success) {
        throw new Error(data?.message ?? "Failed to report user");
      }

      toast.success(data.message ?? "User reported successfully");
      handleDisconnect();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to report user";
      toast.error(message);
      throw error;
    }
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
    <div className="relative h-screen w-full overflow-hidden bg-muted-background text-foreground">
      <div className="absolute inset-0 bg-linear-to-b from-muted/30 to-transparent dark:from-muted/10" />

      <div className="relative flex h-full w-full">
        {/* Left side: Video and Controls */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <div className="relative flex-1 overflow-hidden w-full sm:w-[80%] sm:mx-auto">
            <div className="absolute inset-3 rounded-2xl sm:inset-0 sm:h-[85vh] sm:my-auto overflow-hidden sm:rounded-2xl border-2 border-border bg-secondary/80 shadow-3xl backdrop-blur-md">
              {/* Remote Stream */}
              <VideoTile
                stream={remoteStream}
                label={remoteProfile?.username ?? "Stranger"}
                muted={false}
                avatarUrl={remoteProfile?.profilePicture ?? null}
                avatarInitials={
                  remoteProfile
                    ? (remoteProfile.username || "")
                        .split(/[/\s_-]+/)
                        .map((w) => w[0] || "")
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : profileInitials
                }
                camOn={remoteCamOn}
                audioOn={remoteAudioOn}
              />
            </div>

            <div className="absolute right-3 bottom-16 z-20 h-24 w-36 overflow-hidden rounded-xl border-2 border-border bg-secondary/80 shadow-3xl backdrop-blur-md sm:right-8 sm:bottom-20 sm:h-40 sm:w-60 sm:rounded-2xl">
              {/**My Stream */}
              <VideoTile
                key={localStream?.id ?? "local"}
                stream={localStream}
                label={`${profile?.username ?? "You"} (You)`}
                muted={true}
                avatarUrl={profile?.profilePicture ?? null}
                avatarInitials={profileInitials}
                camOn={camOn}
                audioOn={localAudioOn}
                compact
              />
            </div>
          </div>

          <div className="relative z-20 border-t border-border bg-secondary/40 backdrop-blur-xl">
            <CallControls
              mode={mode}
              onSkip={handleSkip}
              onDisconnect={handleDisconnect}
              onOpenChat={() => setIsChatOpen(true)}
              onReport={handleReport}
              canSkip={canSkip}
              cooldown={cooldown}
              actionLocked={actionLocked}
              isChatOpen={isChatOpen}
              unreadCount={unreadCount}
              replaceTrack={replaceTrack}
              onMediaStateChange={(state: {
                camOn: boolean;
                micOn: boolean;
              }) => {
                // reflect local mic state immediately for local preview
                if (typeof state.micOn === "boolean")
                  setLocalAudioOn(state.micOn);
                socket.emit("media_state", {
                  roomId: currentRoomId,
                  camOn: state.camOn,
                  micOn: state.micOn,
                });
              }}
              camOn={camOn}
              setCamOn={setCamOn}
            />
          </div>
        </div>

        {/* Right side: Chat Panel */}
        {isChatOpen && (
          <div className="fixed inset-0 z-50 sm:static sm:inset-auto sm:z-auto sm:h-[92vh] sm:w-[380px] bg-background shadow-2xl sm:rounded-2xl sm:mt-auto border border-border">
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
