import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/contact",
          "/terms",
          "/privacy",
          "/refund-policy",
          "/login",
          "/register",
        ],
        disallow: [
          "/customer/",
          "/customer",
          "/engineer/",
          "/engineer",
          "/engineer-login",
          "/submit/",
          "/submit",
          "/api/",
          "/estimate/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
