"use client";

import Link from "next/link";
import Image from "next/image";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { usePathname } from "next/navigation";
import { useProfileStore, selectProfileStoreUser } from "@/store/useProfileStore";

const navItems = [
  { label: "Home", href: "/home" },
  { label: "Profile", href: "/profile" },
  { label: "Room", href: "/room" },
];

type Props = {
  username: string;
  name: string;
  imageUrl?: string | null;
};

const AppNav = () => {
  const { ref, isVisible } = useAnimateOnScroll();
  const pathname = usePathname();
  const user = useProfileStore(selectProfileStoreUser);

  const username = user?.profile.username || "";
  const name = user?.name || "";
  const imageUrl = user?.profile.profilePicture || null;

  const initials = username
    .split(/[\s_-]+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header ref={ref} className="px-4 pt-4 md:px-8">
      <div
        className={`${isVisible ? "in-view" : ""} mx-auto h-24 max-w-7xl px-3`}
      >
        <div className="flex h-full items-center md:gap-8">
          {/* Logo — same as Header */}
          <div className="flex items-center gap-2 text-4xl font-bold reveal-right">
            <Image
              src="/logo.png"
              alt="Logo"
              width={250}
              height={46}
              className="shrink-0 invert dark:invert-0"
            />
          </div>

          {/* Navbar */}
          <nav className="hidden flex-1 justify-center md:flex reveal-down pr-48">
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

          {/* Avatar with initials */}
          <div className="ml-auto shrink-0 reveal-left">
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
        </div>
      </div>
    </header>
  );
};

export default AppNav;
