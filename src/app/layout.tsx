import type { Metadata, Viewport } from "next";
import { Inter, Amiri } from "next/font/google";
import "./globals.css";
import "../styles/tokens.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#059669",
};

export const metadata: Metadata = {
  title: "MarriageMediaUSA.com — Premier Islamic Matrimonial Network for US Diaspora",
  description:
    "Connecting practicing Muslim professionals in North America and globally through 100% Halal matchmaking, verified Walis, and Purdah photo modesty protection.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${amiri.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@700&family=Gulzar&family=Reem+Kufi:wght@700&family=Scheherazade+New:wght@700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@700&family=Gulzar&family=Reem+Kufi:wght@700&family=Scheherazade+New:wght@700&display=swap"
          media="print"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
