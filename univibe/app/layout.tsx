import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";
import ThemeToggle from "@/components/layouts/ThemeToggle";

const fontSans = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniVibe",
  description: "Live Video-calls and chats with university students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", fontSans.variable, fontSans.className)}
      suppressHydrationWarning
    >
      <body
        className={`${fontMono.variable} antialiased`}
      >
        <Toaster
          position="top-right" />
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <div className="p-4 hidden md:inline-flex">
            <ThemeToggle />
          </div>
          {children}
        </NextThemesProvider>
      </body>
    </html>
  );
}
