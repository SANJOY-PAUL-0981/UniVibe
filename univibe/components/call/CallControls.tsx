"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Flag,
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
  onReport: () => Promise<void>;
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
  onReport,
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
  const { localStream, setLocalStream, remoteProfile } = useCallStore();
  const [micOn, setMicOn] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reporting, setReporting] = useState(false);

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

  const handleReport = async () => {
    if (reporting) return;

    setReporting(true);
    try {
      await onReport();
      setReportOpen(false);
    } finally {
      setReporting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 border-t border-border/50 px-10 py-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="lg" onClick={toggleMic} >
          {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-red-600" />}
        </Button>

        <Button variant="outline" size="lg" onClick={toggleCam}>
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
              className="hover:bg-[#adc6f8] dark:hover:bg-[#2b3762] cursor-pointer"
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
              className="cursor-pointer"
            >
              <span>{!canSkip ? `Exit (${cooldown})` : "Exit"}</span>
              <span>
                <SquareArrowRightExit />
              </span>
            </Button>

            <AlertDialog open={reportOpen} onOpenChange={setReportOpen}>
              <Button
                variant="outline"
                onClick={() => setReportOpen(true)}
                disabled={actionLocked}
                className="border-destructive/30 text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive dark:border-destructive/50 dark:text-destructive dark:hover:border-destructive/60 dark:hover:bg-destructive/20 dark:hover:text-destructive cursor-pointer"
              >
                <span>Report</span>
                <span>
                  <Flag />
                </span>
              </Button>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Report {remoteProfile?.username}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will send a report for the current call and end the
                    session. Repeated reports can lead to a temporary ban.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel
                    disabled={reporting}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReport}
                    disabled={reporting}
                  >
                    {reporting ? "Reporting..." : "Report user"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>

      {!isChatOpen && (
        <div className="ml-auto flex items-center">
          <Button
            variant="outline"
            size="lg"
            onClick={onOpenChat}
            aria-label="Open chat"
            className="relative cursor-pointer hover:text-secondary-foreground dark:hover:text-[#2b3762]/80"
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
