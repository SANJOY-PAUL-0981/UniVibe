import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const navItems = [
  { label: "Focus Room", href: "#" },
  { label: "How it works", href: "#" },
  { label: "Rules", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Contact Us", href: "#" },
];

const Header = () => {
  return (
    <header className="px-3 pt-3 md:px-6">
      <div className="mx-auto h-20 max-w-7xl px-3">
        <div className="flex h-full items-center gap-4 md:gap-6">
          <div className="flex items-center gap-1 text-3xl font-bold">
            <Image src="/logo.png" alt="Logo" width={40} height={28} className="shrink-0" />
            <div className="leading-none">
              <span className="text-chart-4">U</span>
              <span>ni</span>
              <span className="text-chart-4">V</span>
              <span>ibe</span>
            </div>
          </div>

          <nav className="hidden flex-1 justify-center md:flex">
            <ul className="flex h-12 items-center gap-1 rounded-full bg-muted/70 p-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={[
                      "inline-flex h-10 items-center rounded-full px-5 text-sm font-medium text-foreground/80 transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto shrink-0">
            <Button className="h-10 rounded-full px-6 text-sm font-semibold uppercase tracking-wide">
              Login
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
