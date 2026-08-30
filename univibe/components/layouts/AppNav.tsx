"use client";

import Link from "next/link";
import Image from "next/image";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { usePathname } from "next/navigation";
import { useProfileStore, selectProfileStoreUser } from "@/store/useProfileStore";
import { useState, useEffect, useRef } from "react";

const navItems = [
  { label: "Home", href: "/home" },
  { label: "Profile", href: "/profile" },
  { label: "Room", href: "/room" },
];

const AppNav = () => {
  const { ref, isVisible } = useAnimateOnScroll();
  const pathname = usePathname();
  const user = useProfileStore(selectProfileStoreUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const username = user?.profile.username || "";
  const name = user?.name || "";
  const imageUrl = user?.profile.profilePicture || null;

  const initials = username
    .split(/[\s_-]+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header ref={ref} className="pt-4 relative z-50">
      <div
        className={`${isVisible ? "in-view" : ""} mx-auto h-16 md:h-24 max-w-7xl flex items-center justify-between px-4 md:px-6`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold reveal-right">
          <Image
            src="/logo.png"
            alt="Logo"
            width={250}
            height={46}
            className="shrink-0 invert dark:invert-0 w-[180px] md:w-[220px] h-auto"
          />
        </div>

        {/* Desktop Navbar */}
        <nav className="hidden md:flex flex-1 justify-center reveal-down">
          <ul className="flex h-12 items-center gap-1 rounded-full bg-muted/50 p-1.5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={[
                      "inline-flex h-10 items-center rounded-full px-6 text-base font-medium transition-colors",
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Desktop Profile Avatar */}
        <div className="hidden md:block shrink-0 reveal-left">
          <Link href="/profile">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-chart-4 text-sm font-bold text-white ring-2 ring-border transition-all hover:ring-chart-4">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={`${name} profile image`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                initials
              )}
            </div>
          </Link>
        </div>

        {/* Mobile controls: Avatar + Hamburger */}
        <div className="md:hidden flex items-center gap-3 reveal-left">
          <Link href="/profile">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-chart-4 text-xs font-bold text-white ring-1 ring-border transition-all hover:ring-chart-4">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={`${name} profile image`}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                initials
              )}
            </div>
          </Link>

          <div className="relative" ref={menuRef}>
            {/* Hamburger Button */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span className={`block h-0.5 w-6 bg-foreground rounded-full transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 w-6 bg-foreground rounded-full transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-foreground rounded-full transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>

            {/* Mobile Dropdown */}
            <div className={`absolute right-0 top-12 w-52 rounded-2xl bg-background/95 backdrop-blur-md border border-border shadow-xl transition-all duration-200 origin-top-right ${menuOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
              <div className="p-2 flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={[
                        "flex items-center h-10 rounded-xl px-4 text-sm font-medium transition-colors",
                        active
                          ? "bg-muted text-foreground"
                          : "text-foreground/80 hover:bg-muted hover:text-foreground",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default AppNav;
