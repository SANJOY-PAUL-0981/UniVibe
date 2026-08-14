"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { label: "How it works", href: "#howitworks" },
  { label: "Rules", href: "#rules" },
  { label: "Contact Us", href: "#contactus" },
];


const Header = () => {
  const { ref, isVisible } = useAnimateOnScroll();
  const pathname = usePathname();
  const router = useRouter();

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
    <header ref={ref} className="pt-4">
      <div
        className={`${isVisible ? "in-view" : ""} mx-auto h-24 max-w-7xl flex justify-around`}>
        <div className="flex h-full items-center gap-5 md:gap-8">
          <div className="flex items-center gap-2 text-4xl font-bold reveal-right pr-40">
            <Image
              src="/logo.png"
              alt="Logo"
              width={250}
              height={46}
              className="shrink-0 dark:invert-0 invert"
            />
          </div>

          <nav className="hidden flex-1 justify-center md:flex reveal-down pr-60">
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
