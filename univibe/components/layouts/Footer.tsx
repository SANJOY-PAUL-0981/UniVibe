"use client"

import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";



const Footer = () => {
    const { ref, isVisible } = useAnimateOnScroll();

    return (
        <footer
            ref={ref}
            id="contactus"
            className="relative isolate mt-20 px-4 py-10 sm:px-8 sm:py-12"
        >
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-0 h-56 w-2xl -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.16)_0%,rgba(147,197,253,0.10)_42%,rgba(255,255,255,0)_74%)] blur-3xl" />
            </div>

            <div className={`${isVisible ? "in-view" : ""} mx-auto w-full max-w-7xl rounded-3xl border border-border/70 bg-card/55 p-6 shadow-lg backdrop-blur sm:p-8`}>
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <div className="reveal-right flex flex-col gap-3">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={320}
                            height={60}
                            className="shrink-0 invert dark:invert-0"
                        />
                        <p className="max-w-md text-sm text-foreground/70 sm:text-base">
                            Your college group chat isn't the whole population. Go meet someone new.
                        </p>
                    </div>

                    <div className="reveal flex flex-col gap-3 text-ms sm:text-lg">
                        <p className="font-semibold text-foreground/90">Made by</p>
                        <p className="text-foreground/75">
                            <a
                                href="https://x.com/Sanj0yX"
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-primary underline decoration-primary/60 underline-offset-4 hover:decoration-primary"
                            >
                                @Sanj0yX
                            </a>{" "}
                            and{" "}
                            <a
                                href="https://x.com/skmahirashef04"
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-primary underline decoration-primary/60 underline-offset-4 hover:decoration-primary"
                            >
                                @skmahirashef04
                            </a>
                        </p>
                    </div>

                    <div className="reveal-left flex items-center gap-3">
                        <a
                            href="https://x.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-18 w-18 items-center justify-center rounded-full border border-border/70 bg-background/65 text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                            aria-label="X"
                        >
                            <FaXTwitter className="text-5xl" />
                        </a>
                        <a
                            href="https://www.instagram.com/univibe.chat?igsh=MjNib3J1ZWN5eGpv"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-18 w-18 items-center justify-center rounded-full border border-border/70 bg-background/65 text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                            aria-label="Instagram"
                        >
                            <FaInstagram className="text-5xl" />
                        </a>
                    </div>
                </div>

                <div className="reveal-delay-2 mt-8 border-t border-border/60 pt-5 text-xs text-foreground/60 sm:text-sm">
                    <p>UniVibe. When your college group chat just isn't cutting it.</p>
                </div>
            </div>

        </footer>
    )
}

export default Footer