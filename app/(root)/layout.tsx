import type { Metadata } from "next";
import "./globals.css";
import { geistMono, geistSans } from "@/fonts/font";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "Dumcel",
  description: "Dumcel - The Ultimate Cloud Deployment Platform",
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
        <Analytics />
        {children}
      </body>
    </html>
  );
}
