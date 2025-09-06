import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tweet Like Nikita — Schedule X posts via Post-Bridge",
  description:
    "Paste insights, parse into tweet-sized posts, and schedule daily at your chosen time using Post-Bridge.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
    other: [
      { rel: "android-chrome", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome", url: "/android-chrome-512x512.png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Tweet Like Nikita",
    description:
      "Paste insights, parse into tweet-sized posts, and schedule daily at your chosen time using Post-Bridge.",
    images: [
      {
        url: "/nikita-tweet.png",
        width: 1200,
        height: 630,
        alt: "Tweet Like Nikita",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tweet Like Nikita",
    description:
      "Paste insights, parse into tweet-sized posts, and schedule daily at your chosen time using Post-Bridge.",
    images: ["/nikita-tweet.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div />
            <a
              href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNapageneral%2Fpostbridge-client&project-name=tweet-like-nikita&repository-name=postbridge-client&env=OPENAI_API_KEY,POSTBRIDGE_API_KEY&envDescription=LLM%20and%20Post-Bridge%20keys&envLink=https%3A%2F%2Fwww.post-bridge.com%2Fdashboard%2Fapi-keys"
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              Deploy to Vercel
            </a>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
