import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import Footer from "@/components/Footer";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.yt-scripts.online";

export const metadata: Metadata = {
  title: {
    default: "YT Scripts | AI-Powered Script Creation",
    template: "%s | YT Scripts",
  },
  description:
    "Generate voiceover-ready YouTube scripts, SEO suggestions, and thumbnail concepts with AI. Perfect for faceless channels, educational content, and tech reviews.",
  keywords: [
    "YT Scripts",
    "AI script writer",
    "YouTube content creation",
    "video script maker",
    "faceted channel script",
    "educational video script",
    "tech review script",
    "SEO for YouTube",
    "thumbnail ideas",
    "content creator tools",
  ],
  authors: [{ name: "YT Scripts" }],
  creator: "YT Scripts",
  publisher: "YT Scripts",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "YT Scripts",
    title: "AI-Powered YT Scripts",
    description:
      "Generate voiceover-ready YouTube scripts, SEO suggestions, and thumbnail concepts with AI.",
    url: siteUrl,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YT Scripts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Powered YT Scripts",
    description:
      "Generate voiceover-ready YouTube scripts, SEO suggestions, and thumbnail concepts with AI.",
    images: ["/og-image.png"],
    creator: "@ytscripts",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "your-google-site-verification",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "YT Scripts",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    description:
      "AI-powered YouTube script generation tool. Generate voiceover-ready scripts, SEO optimization, and thumbnail concepts.",
    url: siteUrl,
    author: {
      "@type": "Organization",
      name: "YT Scripts",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      description: "Free credits on signup",
    },
    featureList: [
      "AI script generation",
      "SEO optimization",
      "Thumbnail concepts",
      "Content ideas",
      "Voiceover-ready scripts",
    ],
    screenshot: `${siteUrl}/og-image.png`,
    softwareVersion: "1.0",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
      bestRating: "5",
    },
  };

  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          as="style"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* DNS prefetch for API and AI services */}
        <link
          rel="dns-prefetch"
          href={
            process.env.NEXT_PUBLIC_API_URL ||
            "https://yt-scripts-backend.onrender.com"
          }
        />
        <link
          rel="preconnect"
          href={
            process.env.NEXT_PUBLIC_API_URL ||
            "https://yt-scripts-backend.onrender.com"
          }
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://openrouter.ai" />
        <link
          rel="preconnect"
          href="https://openrouter.ai"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <link
          rel="preconnect"
          href="https://lh3.googleusercontent.com"
          crossOrigin="anonymous"
        />
      </head>

      <body className="min-h-screen">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
