import type { Metadata, Viewport } from "next";
import { Providers, THEME_SCRIPT } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Polyglot — Learn Japanese",
  description: "Bite-sized Japanese lessons: kana, JLPT vocabulary, kanji and grammar with spaced repetition.",
  applicationName: "Polyglot",
  appleWebApp: { capable: true, title: "Polyglot", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
