"use client";

import { useCallStore } from "@/store/useCallStore";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import VideoTile from "@/components/call/VideoTitle";

type Props = {
  message: string;
  timeLeft: number;
  onCancel: () => void;
  showTimer?: boolean;
};

export default function WaitingScreen({
  message,
  onCancel,
  timeLeft,
  showTimer = true,
}: Props) {
  const { localStream, setLocalStream } = useCallStore();

  const handleCancel = () => {
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    onCancel();
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-muted-background text-foreground">
      <div className="absolute inset-0 bg-linear-to-b from-muted/30 to-transparent dark:from-muted/10" />

      <div className="relative flex h-full w-full flex-col items-center justify-center">
        {/* Stranger Video - Waiting State */}
        <div className="absolute inset-0 h-[75vh] my-auto mx-auto w-[75%] overflow-hidden rounded-2xl border-2 border-border bg-secondary/80 shadow-3xl backdrop-blur-md flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-foreground">{message}</p>
          {showTimer && (
            <p className="text-sm text-muted-foreground">{timeLeft}s</p>
          )}
          <span className="absolute top-4 left-4 text-sm text-muted-foreground font-semibold">
            Stranger
          </span>
        </div>

        {/* Local Video - Bottom Right */}
        <div className="absolute right-10 bottom-24 z-20 h-36 w-52 overflow-hidden rounded-2xl border-2 border-border bg-secondary/80 shadow-3xl backdrop-blur-md sm:h-40 sm:w-60">
          <VideoTile
            stream={localStream}
            label="You"
            muted={true}
            camOn={!!localStream}
          />
        </div>

        {/* Cancel Button */}
        <div className="absolute bottom-6 z-20 flex items-center justify-center gap-3">
          <Button
            variant="destructive"
            onClick={handleCancel}
            className="h-10 px-6"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
