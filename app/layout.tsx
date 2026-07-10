import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { UnitProvider } from "@/components/unit-context";
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
  title: "Weather Twin",
  description: "Find places around the world with weather just like home.",
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
      <body className="min-h-full flex flex-col">
        <UnitProvider>{children}</UnitProvider>
      </body>
    </html>
  );
}
