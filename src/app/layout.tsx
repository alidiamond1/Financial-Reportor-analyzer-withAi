import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Financial Report Analyzer | AI-Powered Financial Intelligence",
  description: "Transform your financial reports into actionable insights with our AI-powered SaaS platform. Upload PDFs, Excel files, and get instant KPI analysis, risk assessment, and strategic recommendations.",
  keywords: ["financial analysis", "AI", "SaaS", "reporting", "KPI", "dashboard", "business intelligence"],
  authors: [{ name: "Financial Report Analyzer Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
