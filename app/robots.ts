import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://perapin.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // Allow the public landing page (and any other truly public content).
      allow: "/",
      // Keep the app itself, auth flows, and backend routes out of search
      // results. Note: this is a crawler hint, not a security boundary.
      disallow: ["/consumer/", "/merchant/", "/api/", "/login", "/register/"],
    },
    host: siteUrl,
  };
}
