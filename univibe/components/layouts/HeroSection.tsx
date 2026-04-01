"use client";

import { GoDotFill } from "react-icons/go";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HeroSection = () => {
  const { ref, isVisible } = useAnimateOnScroll();
  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden px-4 pb-20 pt-14 sm:px-8 sm:pb-24 lg:px-12 lg:pt-20"
    >
      <div
        className={`${isVisible ? "in-view is-visible" : ""} mx-auto flex max-w-4xl flex-col items-center text-center reveal-zoom`}
      >
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/65 px-5 py-1.5 text-sm font-semibold tracking-wide text-foreground/90 backdrop-blur reveal-zoom reveal-delay-1">
          <GoDotFill className="size-4 text-emerald-500" />
          <span>17 323 ONLINE NOW</span>
        </div>

        <h1 className="max-w-4xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-7xl reveal-down reveal-delay-2">
          Working towards your dreams is hard. Not reaching them is harder.
        </h1>

        <p className="mt-7 max-w-2xl text-pretty text-lg font-medium text-foreground/80 sm:text-2xl reveal reveal-delay-3">
          Get work done with others from around the world.
        </p>
        <Link
        href="/auth/signup">
        <Button
          size="lg"
          className="mt-10 h-14 rounded-full px-9 text-lg font-extrabold tracking-tight reveal-pop reveal-delay-4"
        >
          Sign Up
        </Button>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
