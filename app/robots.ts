import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://estimex.in";

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
