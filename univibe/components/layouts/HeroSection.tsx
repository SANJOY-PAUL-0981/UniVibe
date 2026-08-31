"use client";

import { GoDotFill } from "react-icons/go";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "next-themes";

const HeroSection = () => {
  const { ref, isVisible } = useAnimateOnScroll();
  const { ref: howItWorksRef, isVisible: isHowItWorksVisible } =
    useAnimateOnScroll();
  const { ref: rulesRef, isVisible: isRulesVisible } = useAnimateOnScroll();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full blur-2xl"
          style={{
            background: isDark
              ? "radial-gradient(circle, rgba(82,39,255,0.35) 0%, rgba(255,159,252,0.15) 42%, rgba(255,255,255,0) 72%)"
              : "radial-gradient(circle, rgba(69,69,232,0.75) 0%, rgba(181,192,255,0.50) 42%, rgba(255,255,255,0) 72%)",
          }}
        />
      </div>

      {/* Eat the Full screen up */}
      <div className="flex min-h-[calc(100svh-4rem)] md:min-h-[calc(100svh-6rem)] flex-col items-center justify-center px-4">
        <div
          className={`${isVisible ? "in-view is-visible" : ""} mx-auto flex w-full max-w-5xl flex-col items-center text-center reveal-zoom`}
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/65 px-5 py-1.5 text-sm font-semibold tracking-wide text-foreground/90 backdrop-blur reveal-zoom reveal-delay-1">
            <GoDotFill className="size-4 text-emerald-500" />
            <span>UniVibe</span>
          </div>

          <h1 className="max-w-4xl text-balance text-4xl font-bold leading-[1.04] tracking-tight text-foreground sm:text-5xl lg:text-7xl reveal-down reveal-delay-2">
            Where Universities Connects.
          </h1>

          <p className="mt-7 max-w-2xl text-pretty text-base font-medium text-foreground/80 sm:text-xl lg:text-2xl reveal reveal-delay-3">
            Connect with other universities and make new homies.
          </p>

          <Link href="/auth/signup">
            <Button
              size="lg"
              className="mt-10 h-12 rounded-full px-8 text-base font-extrabold tracking-tight reveal-pop reveal-delay-4 cursor-pointer sm:h-14 sm:px-9 sm:text-lg"
            >
              Create Your Account
            </Button>
          </Link>
        </div>
      </div>

      <div
        ref={howItWorksRef}
        id="howitworks"
        className={`${isHowItWorksVisible ? "in-view is-visible" : ""} scroll-mt-24 mx-auto mb-10 w-full max-w-5xl rounded-3xl border border-border/60 bg-card/55 px-6 py-8 shadow-lg backdrop-blur reveal-zoom sm:px-8 sm:py-10 lg:px-10`}
      >
        <h2 className="text-3xl font-bold sm:text-4xl reveal-down">
          How It Works?
        </h2>
        <ol className="list-decimal space-y-4 pl-6 pt-5 text-sm leading-7 text-foreground/85 sm:pl-8 sm:text-base">
          <li className="reveal reveal-delay-1">
            <strong>Meet New People:</strong> UniVibe is an anonymous random
            video calling platform built exclusively for university students
            across India, making it easy to meet and connect with someone new.
          </li>

          <li className="reveal reveal-delay-2">
            <strong>Fair Random Matching:</strong> When you start a random call,
            UniVibe pairs you with the person who has been waiting in the queue
            the longest. This keeps the matching process fair and gives everyone
            their turn.
          </li>

          <li className="reveal reveal-delay-3">
            <strong>Connect by College:</strong> With filtered calls, you can
            choose which college you want to connect with. For example, if a
            student from
            <strong> College A</strong> is looking for someone from{" "}
            <strong>College B</strong>, while a student from College B is
            looking for someone from College A, UniVibe recognizes the mutual
            preference and pairs them together.
          </li>

          <li className="reveal reveal-delay-4">
            <strong>Smart Fallback Matching:</strong> If your preferred match
            isn't available, UniVibe progressively broadens the search using the
            hierarchy <strong>College → Year → Field of Study → Random</strong>.
            Each fallback stage searches for up to <strong>20 seconds</strong>,
            giving you the best possible match before eventually opening the
            door to a random connection.
          </li>
        </ol>
      </div>

      <div
        ref={rulesRef}
        id="rules"
        className={`${isRulesVisible ? "in-view is-visible" : ""} scroll-mt-24 mx-auto mt-10 w-full max-w-5xl rounded-3xl border border-border/60 bg-card/55 px-6 py-8 shadow-lg backdrop-blur reveal-zoom sm:px-8 sm:py-10 lg:px-10`}
      >
        <h2 className="text-3xl font-bold sm:text-4xl reveal-down">Rules</h2>
        <ol className="list-decimal space-y-4 pl-6 pt-5 text-sm leading-7 text-foreground/85 sm:pl-8 sm:text-base">
          <li className="reveal reveal-delay-1">
            <strong>18+ Only:</strong> UniVibe is exclusively for users aged 18
            and above.
          </li>

          <li className="reveal reveal-delay-2">
            <strong>Respect Others:</strong> Keep every conversation respectful,
            friendly, and welcoming. Treat the person on the other side of the
            call the way you'd expect to be treated.
          </li>

          <li className="reveal reveal-delay-3">
            <strong>Keep It Safe:</strong> Nudity, hate speech, harassment,
            threats, and abusive behavior are strictly prohibited on UniVibe.
          </li>

          <li className="reveal reveal-delay-4">
            <strong>Violations Have Consequences:</strong> Anyone who violates
            these rules may be banned from the platform, with further action
            taken when necessary.
          </li>
        </ol>
      </div>
    </section>
  );
};

export default HeroSection;
