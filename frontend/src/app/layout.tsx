import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Meridian — SA Government Data Pipeline",
  description:
    "Weekly scraped South African government datasets — crime, Eskom load-shedding, water access, housing. Download CSVs, explore trends, power your Power BI dashboards.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-[family-name:var(--font-geist)] bg-[#f5f0e8] text-[#0a0a0a] antialiased`}>
        {children}
      </body>
    </html>
  );
}
