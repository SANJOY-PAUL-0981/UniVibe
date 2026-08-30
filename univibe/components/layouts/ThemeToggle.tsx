"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTaptic } from "taptickit/react"
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const haptic = useTaptic();

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = activeTheme === "dark";

  const switchTheme = () => {
    setTheme(isDark ? "light" : "dark");
  }

  const toggleTheme = (event: any) => {
    haptic.trigger("heavy")
    // setTheme(isDark ? "light" : "dark");

    // new with view-transition implementation
    if (!document.startViewTransition) {
      //setTheme(isDark ? "light" : "dark");
      switchTheme()
      return
    }

    /*const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );*/

    const root = document.documentElement;
    root.classList.add("theme-transition");

    const transition = document.startViewTransition(switchTheme);
    transition.finished.finally(() => {
      root.classList.remove("theme-transition");
    });

    /*transition.ready.then(() => {
      requestAnimationFrame(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 600,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)'
          }
        )
      })
    })*/
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className={className ?? "fixed top-4 right-4 z-50 flex size-8 items-center justify-center rounded-full border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"}
        >
          {mounted && isDark ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {mounted
            ? isDark
              ? "Switch to light mode"
              : "Switch to dark mode"
            : "Toggle theme"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}