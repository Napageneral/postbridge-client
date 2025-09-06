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
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Tweet Like Nikita",
    description:
      "Paste insights, parse into tweet-sized posts, and schedule daily at your chosen time using Post-Bridge.",
    images: [
      {
        url: "/nikita-hero.png",
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
    images: ["/nikita-hero.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="max-w-5xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div />
            <a
              href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-org%2Fpostbridge-client&env=OPENAI_API_KEY,POSTBRIDGE_API_KEY&project-name=postbridge-client&repository-name=postbridge-client"
              target="_blank"
              rel="noreferrer"
              className="text-sm px-3 py-2 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
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
