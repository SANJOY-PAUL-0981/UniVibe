import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://univibee.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/callback/",
        "/profile/",
        "/call/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}