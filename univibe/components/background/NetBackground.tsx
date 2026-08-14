"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import NET, { VantaEffect } from "vanta/dist/vanta.net.min";

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement | null>(null);
  const vantaEffect = useRef<VantaEffect | null>(null);

  useEffect(() => {
    if (!vantaRef.current) return;

    vantaEffect.current = NET({
      el: vantaRef.current,
      THREE,

      mouseControls: true,
      touchControls: true,
      gyroControls: false,

      minHeight: 200,
      minWidth: 200,

      scale: 1,
      scaleMobile: 1,


      color: 0x8b5cf6,

      points: 10,
      maxDistance: 22,
      spacing: 18,
    });

    return () => {
      vantaEffect.current?.destroy();
      vantaEffect.current = null;
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
}