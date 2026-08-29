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

const siteUrl = "https://univibee.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "UniVibe - Where Universities Connects.",
    template: "%s | UniVibe",
  },

  description:
    "Meet fellow university students anonymously through random 1-on-1 video calls. Filter by college, year, or field of study. Built exclusively for university students.",

  /* //This one is sketchui's verification token change it with univibe's own when needed
  verification: {
    google: "kUKSMU6xUgjz5M3Nko0oE7vM13axrASTSIG__iETTko",
  },
  */

  keywords: [
    "university video chat",
    "anonymous video call",
    "student video chat",
    "random video call students",
    "college anonymous chat",
    "meet university students",
    "student social platform",
    "anonymous student chat",
    "univibe",
    "random vc",
    "anonymous vc",
    "random university vc",
    "anonymous university vc",
  ],

  authors: [{ name: "UniVibe", url: siteUrl }],
  creator: "UniVibe",
  publisher: "UniVibe",

  alternates: {
    canonical: siteUrl,
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "UniVibe - Where Universities Connects.",
    description:
      "Meet fellow university students anonymously through random 1-on-1 video calls. Filter by college, year, or field of study. Built exclusively for university students.",
    siteName: "UniVibe",
    images: [
      {
        url: "https://univibe.vercel.app/og-img.png",
        width: 1200,
        height: 630,
        alt: "UniVibe - Where Universities Connects.",
      },
    ]
  },

  twitter: {
    card: "summary_large_image",
    title: "UniVibe - Where Universities Connects.",
    description:
      "Meet fellow university students anonymously through random 1-on-1 video calls. Filter by college, year, or field of study. Built exclusively for university students.",
    images: ["https://univibe.vercel.app/og-img.png"],
    creator: "@Sanj0yX",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },

  category: "Social Networking",
}


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
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ThemeToggle />
          {children}
        </NextThemesProvider>
      </body>
    </html>
  );
}
