"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCallStore } from "@/store/useCallStore";
import { useEffect } from "react";
import { AlertCircle, Repeat } from "lucide-react";

export const NoMatchScreen = () => {
  const router = useRouter();
  const { reset } = useCallStore();

  useEffect(() => {
    reset();
  }, []);

  const handleTryAgain = () => {
    router.push("/home");
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-muted-background text-foreground">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-b from-muted/30 to-transparent dark:from-muted/10" />

      {/* Content Container */}
      <div className="relative flex h-full w-full flex-col items-center justify-center px-4">
        {/* Main Card */}
        <div className="flex flex-col items-center gap-6 rounded-3xl border-2 border-border bg-secondary/60 backdrop-blur-lg p-8 sm:p-12 max-w-md shadow-2xl">
          {/* Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>

          {/* Heading */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              No Match Found
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              We couldn't find anyone available at the moment. Try again in a few seconds!
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-border" />

          {/* Action Button */}
          <Button
            onClick={handleTryAgain}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            Try Again
            <Repeat className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
