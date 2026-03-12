import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Nunito } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
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
    <html lang="en" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} antialiased`}
      >
        <Toaster
        position="top-right" />
        <NextThemesProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </NextThemesProvider>
      </body>
    </html>
  );
}
