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
          <span>UniVibe</span>
        </div>

        <h1 className="max-w-4xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-7xl reveal-down reveal-delay-2">
          Where Universities Connects.
        </h1>

        <p className="mt-7 max-w-2xl text-pretty text-lg font-medium text-foreground/80 sm:text-2xl reveal reveal-delay-3">
          Connetc with other universities and make new homies.
        </p>
        <Link
          href="/auth/signup">
          <Button
            size="lg"
            className="mt-10 h-14 rounded-full px-9 text-lg font-extrabold tracking-tight reveal-pop reveal-delay-4 cursor-pointer"
          >
            Create Your Account
          </Button>
        </Link>
      </div>

      <div className="px-36">
        <h2 className="text-5xl font-bold">How It Works?</h2>
        <ol className="pl-10 list-decimal">
          <li>UniVibe is a anonymous random video calling platform for University students in India.</li>
          <li>In random call when a user starts a call then he/she gets paired with the person in the waiting queue for the longest.</li>
          <li>In filtered call, suppose a user calling with filtered college. Suppose user1 is from clg-A and searching someone form clg-B and user2 is from clg-B and searching for someone from clg-A. Then user1 & user2 will be paired.</li>
          <li>We have fallback for filtered calls. We have a call hierarchy College → Year → Field Of Study → Random. Suppose someone searching with college and no match found then search will fallback to college and every fallback search will happen for 20sec until no users found.</li>
        </ol>
      </div>

      <div className="px-36">
        <h2 className="text-5xl font-bold">Rules</h2>
        <ol className="pl-10 list-decimal">
          <li>You must be 18+</li>
          <li>Be respectful</li>
          <li>No Nudity, Hate Speech, Harasment.</li>
          <li>Violators will be banned and further actions will be taken.</li>
        </ol>
      </div>
    </section>
  );
};

export default HeroSection;
