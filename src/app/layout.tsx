import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/layout/providers";
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
  title: {
    default: "e-Dent | PKU UTHM Clinic",
    template: "%s | e-Dent",
  },
  description: "Book your dental appointment at Pusat Kesihatan Universiti, UTHM. Real-time slot availability, easy booking, and appointment management.",
  keywords: ["dental", "appointment", "UTHM", "PKU", "booking", "clinic", "e-Dent"],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: '#DCE3E7',
  width: 'device-width',
  initialScale: 1,
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
      <body className="min-h-screen flex text-foreground font-sans relative">
        <div 
          className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-multiply" 
          style={{ backgroundImage: 'url(/images/backgrounds/uthm-clinic-bg-placeholder.svg)' }} 
        />
        {/* Soft frost overlay directly on the background */}
        <div className="fixed inset-0 -z-10 bg-background/80 backdrop-blur-[6px]" />
        
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
