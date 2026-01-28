import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DropAI - Sales Hacker Tool",
  description: "A high-conversion landing page for an AI SaaS tool designed for online sellers and e-commerce.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#0B0518] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}