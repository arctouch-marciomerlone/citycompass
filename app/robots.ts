import type { MetadataRoute } from "next";

import { readSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const origin = readSiteUrl().replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
