"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MicOff } from "lucide-react";

type Props = {
  stream: MediaStream | null;
  label: string;
  muted?: boolean;
  avatarUrl?: string | null;
  avatarInitials?: string;
  camOn?: boolean;
  audioOn?: boolean;
  compact?: boolean;
};

export default function VideoTitle({
  stream,
  label,
  muted = false,
  avatarUrl,
  avatarInitials,
  camOn = true,
  audioOn = true,
  compact = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasLiveVideoTrack =
    stream?.getVideoTracks().some((track) => track.readyState === "live" && track.enabled) ??
    false;
  const videoActive = camOn && !!stream && hasLiveVideoTrack;

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = videoActive ? stream : null;
    if (videoActive) {
      videoRef.current.play().catch(console.error);
    } else {
      videoRef.current.pause();
    }
  }, [stream, videoActive]);

  const avatarSizeClass = compact ? "h-12 w-12" : "h-24 w-24";
  const avatarTextClass = compact ? "text-lg" : "text-2xl";
  const audioIconClass = compact ? "h-3 w-3" : "h-4 w-4";
  const labelClass = compact ? "absolute left-3 top-2 text-xs" : "absolute left-6 top-3 text-sm";

  return (
    <div className="relative h-full w-full bg-secondary rounded-2xl overflow-hidden">
      {/* Audio-off indicator */}
      {!audioOn && (
        <div className="absolute right-3 top-3 z-30 rounded-full bg-destructive/80 p-1">
          <MicOff className={`${audioIconClass} text-destructive-foreground`} />
        </div>
      )}
      {/* Keep the video mounted, but hide it when there is no live camera feed */}
      <video
        ref={videoRef}
        autoPlay
        muted={muted}
        playsInline
        className={`h-full w-full object-cover object-center scale-x-[-1] ${!videoActive ? "invisible" : ""}`}
      />

      {/* Avatar overlay — shown on top when cam is off */}
      {!videoActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
          <div className="flex flex-col items-center gap-2">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={label}
                className={`${avatarSizeClass} rounded-full object-cover`}
              />
            ) : (
              <div className={`${avatarSizeClass} rounded-full bg-muted-foreground/10 flex items-center justify-center`}>
                <span className={`${avatarTextClass} font-semibold text-foreground`}>
                  {avatarInitials ??
                    label
                      .split(/[/\s_-]+/)
                      .map((w: string) => w[0] || "")
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <span className={`${labelClass} font-medium text-foreground drop-shadow-sm`}>
        {label}
      </span>
    </div>
  );
}
