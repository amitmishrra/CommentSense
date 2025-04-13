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
  title: "CommentSense: The Bot with No Chill",
  description: "CommentSense is not your typical chatbot. It's bold, brutally honest, and proudly offensive. Trained to roast, rant, and respond with zero filters, this bot is here to bring chaos, not comfort.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-blue-600`}
      >
        {children}
      </body>
    </html>
  );
}
