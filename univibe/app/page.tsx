"use client"
import Header from "@/components/layouts/Header";
import HeroSection from "@/components/layouts/HeroSection";
import Footer from "@/components/layouts/Footer";
import GradientWaves from "@/components/background/GradientWaves";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";


export default function Home() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="overflow-hidden">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-screen">
        <GradientWaves
          horizonColor={isDark ? "#5227FF" : "#000047"}
          waveColor={isDark ? "#FF9FFC" : "#4545E8"}
          crestColor={isDark ? "#FFFFFF" : "#B5C0FF"}
          speed={0.1}
          amplitude={3}
          waveScale={0.6}
          waveRatio={1}
          swell={50}
          turbulence={10}
          tilt={isMobile? 1.4: 1.6}
          zoom={1}
          height={5.5}
          fogDepth={11}
          detail="high"
          brightness={isDark ? 1 : 1.2}
          opacity={isDark ? 1.5 : 4}
          parallaxStrength={0.25}
          grain
          grainIntensity={isDark ? 0.05 : 0.04}
          mouseInteraction={false}
        />
      </div>
      <Header />
      <HeroSection />
      <Footer />
    </div>
  );
}
