import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster as Sonner } from "sonner";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

const siteConfig = {
  name: "Chesski",
  url: "https://app.chesski.lol",
  description: "Your personal AI chess tutor that coaches you in plain English",
  ogImage: "/chesski-social.png",
};

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [siteConfig.ogImage],
    },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/chesski-logo.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&family=Merriweather+Sans:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
        <script async src="https://cdn.tolt.io/tolt.js" data-tolt="16dc1630-6dcc-4c66-b488-9b2f77b5ca01"></script>
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
        {/* <Sonner /> */}
      </body>
    </html>
  );
}
