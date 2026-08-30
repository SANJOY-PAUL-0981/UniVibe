"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { label: "How it works", href: "#howitworks" },
  { label: "Rules", href: "#rules" },
  { label: "Contact Us", href: "#contactus" },
];


const Header = () => {
  const { ref, isVisible } = useAnimateOnScroll();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);


  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.startsWith("#")) return;

    if (pathname !== "/") {
      event.preventDefault();
      router.push(`/${href}`);
      return;
    }

    event.preventDefault();
    const target = document.querySelector(href);
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header ref={ref} className="pt-4 relative z-50">
      <div
        className={`${isVisible ? "in-view" : ""} mx-auto h-16 md:h-24 max-w-7xl flex items-center justify-between px-4 md:px-6`}>
          <div className="flex items-center gap-2 font-bold reveal-right">
            <Image
              src="/logo.png"
              alt="Logo"
              width={250}
              height={46}
              className="shrink-0 dark:invert-0 invert w-[180px] md:w-[220px] h-auto"
            />
          </div>

          <nav className="hidden flex-1 justify-center md:flex reveal-down">
            <ul className="flex h-12 items-center gap-1 rounded-full bg-muted/50 p-1.5">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={(event) => handleNavClick(event, item.href)}
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
                className="h-12 rounded-full px-8 text-base font-semibold cursor-pointer hidden md:inline-flex"
              >
                Login
              </Button>
            </Link>
          </div>
          {/* Hamburger Icon - !Yummyyy */}
          <div className="md:hidden relative" ref={menuRef}>
            <div className="flex items-center space-x-2">
            <ThemeToggle className="flex size-8 items-center justify-center rounded-full border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground" />
            {/* The Cool Animation - Vibe Coded */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <span className={`block h-0.5 w-6 bg-foreground rounded-full transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 w-6 bg-foreground rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-foreground rounded-full transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
            </div>
            {/* Dropdown */}
            <div className={`absolute right-0 top-12 w-52 rounded-2xl bg-background/95 backdrop-blur-md border border-border shadow-xl transition-all duration-200 origin-top-right ${menuOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
              <div className="p-2 flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(event) => handleNavClick(event, item.href)}
                    className="flex items-center h-10 rounded-xl px-4 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-1 pt-1 border-t border-border">
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                    <Button size="sm" className="w-full rounded-xl text-sm font-semibold cursor-pointer">
                      Login
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
      </div>
    </header>
  );
};

export default Header;