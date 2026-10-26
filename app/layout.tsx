import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "@/lib/site-url";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Estimex — Civil Estimation Made Simple",
    template: "%s | Estimex",
  },
  description:
    "Professional civil construction quantity take-off, material schedules, and Bill of Quantities (BOQ) estimation.",
  openGraph: {
    title: "Estimex — Civil Estimation Made Simple",
    description:
      "Professional civil construction quantity take-off, material schedules, and Bill of Quantities (BOQ) estimation.",
    url: siteUrl,
    siteName: "Estimex",
    locale: "en_IN",
    type: "website",
  },
  alternates: {
    canonical: "./",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}><body className="min-h-full flex flex-col">{children}</body></html>;
}
