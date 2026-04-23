import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UIProvider } from "@/context/UIContext";
import PWARegistration from "@/components/PWARegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WaspAI | Advanced Engineering Terminal",
  description: "Advanced AI-powered software engineering assistant for Staff Engineers. Architecture mapping, security audits, and code refactoring.",
  manifest: "/manifest.json",
  themeColor: "#060010",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WaspAI",
  },
  openGraph: {
    title: "WaspAI | Your Engineering Partner",
    description: "The next generation of Engineering Intelligence. Specialized agents for high-performance teams.",
    url: "https://wasp-ai.vercel.app",
    siteName: "WaspAI",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WaspAI | Engineering Terminal",
    description: "AI-powered assistant for advanced software architecture and security.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative overflow-x-hidden">
        <UIProvider>
          <PWARegistration />
          <div className="relative z-10 flex-grow flex flex-col">
            {children}
          </div>
        </UIProvider>
      </body>
    </html>
  );
}
