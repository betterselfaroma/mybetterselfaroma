import type { Metadata, Viewport } from "next";
import "./globals.css";
import { content } from "@/data/content";
import LanguageProvider from "@/components/LanguageProvider";
import MetaUpdater from "@/components/MetaUpdater";
import WhatsAppProvider from "@/components/WhatsAppDialog";
import RefCapture from "@/components/RefCapture";
import PwaRegister from "@/components/PwaRegister";
import { getSiteUrl, getMetadataBase } from "@/lib/site-url";

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: content.zh.meta.title,
  description: content.zh.meta.description,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Scent Admin",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/icon-192.png",
    icon:
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#62784C"/><path d="M16 25c5-3 7.5-6.5 7.5-11A7.5 7.5 0 0 0 8.5 14c0 4.5 2.5 8 7.5 11Z" fill="none" stroke="#FBF8F2" stroke-width="1.8" stroke-linejoin="round"/></svg>',
      ),
  },
  openGraph: {
    title: content.zh.meta.title,
    description: content.zh.meta.description,
    siteName: "香气读懂你的心 · Scent Knows You",
    url: SITE_URL,
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: content.zh.meta.title,
    description: content.zh.meta.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#2f5d46",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          <MetaUpdater />
          <RefCapture />
          <PwaRegister />
          <WhatsAppProvider>{children}</WhatsAppProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
