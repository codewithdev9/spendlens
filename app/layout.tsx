import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpendLens — AI Tool Spend Auditor",
  description: "Find out if you're overpaying for AI tools. Free instant audit.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://spendlens.credex.rocks"),
  openGraph: {
    title: "SpendLens — AI Tool Spend Auditor",
    description: "Find out if you're overpaying for AI tools. Free instant audit.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendLens — AI Tool Spend Auditor",
    description: "Free instant audit of your AI tool spend.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
