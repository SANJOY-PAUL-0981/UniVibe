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
}: Props) {
  const { localStream } = useCallStore();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const toggleMic = () => {
    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !micOn;
    });
    setMicOn((prev) => !prev);
  };

  const toggleCam = () => {
    localStream?.getVideoTracks().forEach((track) => {
      track.enabled = !camOn;
    });
    setCamOn((prev) => !prev);
  };

  return (
    <div className="flex items-center gap-3 border-t border-border/50 px-4 py-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={toggleMic}>
          {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>

        <Button variant="outline" size="icon" onClick={toggleCam}>
          {camOn ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
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
