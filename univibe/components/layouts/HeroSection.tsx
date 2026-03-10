import { GoDotFill } from "react-icons/go"

import { Button } from "@/components/ui/button"

const HeroSection = () => {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-20 pt-14 sm:px-8 sm:pb-24 lg:px-12 lg:pt-20">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/65 px-5 py-1.5 text-sm font-semibold tracking-wide text-foreground/90 backdrop-blur">
          <GoDotFill className="size-4 text-emerald-500" />
          <span>17 323 ONLINE NOW</span>
        </div>

        <h1 className="max-w-4xl text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-7xl">
          Working towards your dreams is hard. Not reaching them is harder.
        </h1>

        <p className="mt-7 max-w-2xl text-pretty text-lg font-medium text-foreground/80 sm:text-2xl">
          Get work done with others from around the world.
        </p>

        <Button
          size="lg"
          className="mt-10 h-14 rounded-full px-9 text-lg font-extrabold tracking-tight text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/85"
        >
          SEE OTHERS LIVE
        </Button>
      </div>
    </section>
  )
}

export default HeroSection
