"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = activeTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="fixed top-4 right-4 z-50 flex size-8 items-center justify-center rounded-full border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
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