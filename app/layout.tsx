import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://equipcheck.io";

export const metadata: Metadata = {
  title: "EquipCheck — AI Equipment Validation for Field Service Teams",
  description:
    "Validate equipment lists against specs in under 2 minutes. Catch mismatches, missing parts, and quantity errors before your crew leaves the shop. Free to start.",
  keywords: [
    "equipment validation",
    "BOM checker",
    "material verification",
    "field service",
    "equipment list",
    "spec validation",
    "AI validation",
  ],
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "EquipCheck — AI Equipment Validation for Field Service Teams",
    description:
      "Upload any equipment list against any spec. AI validates every line item in under 2 minutes — catching mismatches, missing parts, and quantity errors.",
    url: baseUrl,
    siteName: "EquipCheck",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EquipCheck — AI Equipment Validation",
    description:
      "Turn 2-hour manual equipment validation into 2-minute AI-powered checks. Free to start.",
  },
  robots: {
    index: true,
    follow: true,
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
        className={`${inter.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
