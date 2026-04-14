import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "陈默 | Brand Designer",
  description:
    "独立品牌设计师，用克制的手法，让品牌在嘈杂的信息中脱颖而出。",
  keywords: [
    "品牌设计",
    "视觉设计",
    "UI设计",
    "设计师",
    "作品集",
  ],
  authors: [{ name: "Chen Mo" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
