import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: "ISO-CHRON | Molecular Skincare Analysis",
  description: "Advanced conflict detection engine for skincare routines. Analyze ingredient interactions, optimize AM/PM schedules, and prevent chemical hazards.",
  keywords: ["skincare", "ingredients", "conflict check", "retinol", "vitamin c", "routine builder", "dermatology", "molecular analysis"],
  openGraph: {
    title: "ISO-CHRON | Molecular Skincare Analysis",
    description: "Advanced conflict detection engine for skincare routines.",
    url: "https://iso-chron.vercel.app",
    siteName: "ISO-CHRON",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ISO-CHRON Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ISO-CHRON | Molecular Skincare Analysis",
    description: "Advanced conflict detection engine for skincare routines.",
    creator: "@isochron_lab",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This is a safety check. If the key is missing (e.g. during build), we skip the provider
  // so the build doesn't crash. Auth won't work, but the site will deploy.
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkKey) {
    return (
      <html lang="en" className="dark">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
          {children}
        </body>
      </html>
    )
  }

  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
