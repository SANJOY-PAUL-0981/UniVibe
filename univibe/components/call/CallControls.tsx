"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquareText,
  Mic,
  MicOff,
  Video,
  VideoOff,
  SquareArrowRightExit,
  SkipForward,
} from "lucide-react";
import { useCallStore } from "@/store/useCallStore";

type Mode = "waiting" | "connected";

type Props = {
  mode: Mode;
  onSkip: () => void;
  onDisconnect: () => void;
  onOpenChat: () => void;
  canSkip: boolean;
  cooldown: number;
  actionLocked: boolean;
  isChatOpen: boolean;
  unreadCount: number;
  replaceTrack: (
    kind: "audio" | "video",
    newTrack: MediaStreamTrack | null,
  ) => Promise<void> | void;
  onMediaStateChange: (state: { camOn: boolean; micOn: boolean }) => void;
  camOn: boolean;
  setCamOn: (val: boolean) => void;
};

export default function CallControls({
  mode,
  onSkip,
  onDisconnect,
  onOpenChat,
  canSkip,
  cooldown,
  actionLocked,
  isChatOpen,
  unreadCount,
  replaceTrack,
  onMediaStateChange,
  camOn,
  setCamOn,
}: Props) {
  const { localStream, setLocalStream } = useCallStore();
  const [micOn, setMicOn] = useState(true);

  const toggleMic = async () => {
    const nextMic = !micOn;
    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = nextMic;
    });
    setMicOn(nextMic);
    try {
      onMediaStateChange({ camOn, micOn: nextMic });
    } catch {
      // ignore
    }
  };

  const toggleCam = async () => {
    const videoTracks = localStream?.getVideoTracks() ?? [];
    const audioTracks = localStream?.getAudioTracks() ?? [];

    localStream?.getVideoTracks().forEach((track) => {
      track.stop();
    });

    await replaceTrack("video", null);

    if (camOn) {
      setLocalStream(new MediaStream(audioTracks));
      setCamOn(false);
      try {
        onMediaStateChange({ camOn: false, micOn });
      } catch {}
      return;
    }

    try {
      const acquired = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      const newTrack = acquired.getVideoTracks()[0];
      const newStream = new MediaStream([...audioTracks, newTrack]);
      setLocalStream(newStream);
      await replaceTrack("video", newTrack);
      setCamOn(true);
      try {
        onMediaStateChange({ camOn: true, micOn });
      } catch {}
    } catch (err) {
      console.error("Camera re-acquire failed:", err);
      // Restore the previous preview if reacquire fails.
      const restoredVideoTrack = videoTracks[0] ?? null;
      if (restoredVideoTrack) {
        restoredVideoTrack.enabled = true;
        setLocalStream(new MediaStream([...audioTracks, restoredVideoTrack]));
        await replaceTrack("video", restoredVideoTrack);
        setCamOn(true);
        try {
          onMediaStateChange({ camOn: true, micOn });
        } catch {}
      } else {
        setLocalStream(new MediaStream(audioTracks));
        setCamOn(false);
        try {
          onMediaStateChange({ camOn: false, micOn });
        } catch {}
      }
    }
  };

  return (
    <div className="flex items-center gap-3 border-t border-border/50 px-4 py-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={toggleMic}>
          {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-red-600" />}
        </Button>

        <Button variant="outline" size="icon" onClick={toggleCam}>
          {camOn ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4 text-red-600" />
          )}
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center gap-2">
        {mode === "connected" && (
          <>
            <Button
              variant="secondary"
              onClick={onSkip}
              disabled={!canSkip || actionLocked}
            >
              <span>{!canSkip ? `Skip (${cooldown})` : "Skip"}</span>
              <span>
                <SkipForward />
              </span>
            </Button>
            <Button
              variant="destructive"
              onClick={onDisconnect}
              disabled={!canSkip || actionLocked}
            >
              <span>{!canSkip ? `Exit (${cooldown})` : "Exit"}</span>
              <span>
                <SquareArrowRightExit />
              </span>
            </Button>
          </>
        )}
      </div>

      {!isChatOpen && (
        <div className="ml-auto flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenChat}
            aria-label="Open chat"
            className="relative"
          >
            <MessageSquareText className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
