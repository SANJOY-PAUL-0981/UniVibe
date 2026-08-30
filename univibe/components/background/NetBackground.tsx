"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import NET, { VantaEffect } from "vanta/dist/vanta.net.min";
import { useTheme } from "next-themes";

interface VantaBackgroundProps {
  color?: number;
  backgroundColor?: number;
}

export default function VantaBackground({ color, backgroundColor }: VantaBackgroundProps) {
  const vantaRef = useRef<HTMLDivElement | null>(null);
  const vantaEffect = useRef<VantaEffect | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!vantaRef.current) return;

    vantaEffect.current = NET({
      el: vantaRef.current,
      THREE,

      mouseControls: false,
      touchControls: false,
      gyroControls: false,

      minHeight: 200,
      minWidth: 200,

      scale: 1,
      scaleMobile: 1,

      color: color ?? (isDark ? 0x5227ff : 0x4545e8),
      backgroundColor: backgroundColor ?? (isDark ? 0x0c0724 : 0xffffff),

      points: 10,
      maxDistance: 22,
      spacing: 18,
    });

    return () => {
      vantaEffect.current?.destroy();
      vantaEffect.current = null;
    };
  }, [color, backgroundColor, isDark]);

  return (
    <div
      ref={vantaRef}
      className="fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
}