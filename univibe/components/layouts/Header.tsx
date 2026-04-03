"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";

const navItems = [
  { label: "Focus Room", href: "#" },
  { label: "How it works", href: "#" },
  { label: "Rules", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Contact Us", href: "#" },
];


const Header = () => {
  const { ref, isVisible } = useAnimateOnScroll();
  return (
    <header ref={ref} className="px-4 pt-4 md:px-8">
      <div
        className={`${isVisible ? "in-view" : ""} mx-auto h-24 max-w-7xl px-3`}
      >
        <div className="flex h-full items-center gap-5 md:gap-8">
          <div className="flex items-center gap-2 text-4xl font-bold reveal-right">
            <Image
              src="/logo.png"
              alt="Logo"
              width={250}
              height={46}
              className="shrink-0 dark:invert-0 invert"
            />
          </div>

          <nav className="hidden flex-1 justify-center md:flex reveal-down">
            <ul className="flex h-12 items-center gap-1 rounded-full bg-muted/50 p-1.5">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={[
                      "inline-flex h-10 items-center rounded-full px-6 text-base font-medium text-foreground/80 transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto shrink-0 reveal-left">
            <Link href="/auth/login">
              <Button
                size="lg"
                className="h-12 rounded-full px-8 text-base font-semibold cursor-pointer"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
