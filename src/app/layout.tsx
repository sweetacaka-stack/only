import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Z | 视觉设计师",
  description:
    "独立视觉设计师，用设计语言讲述品牌故事。",
  keywords: [
    "视觉设计",
    "品牌设计",
    "设计师",
    "作品集",
  ],
  authors: [{ name: "Z" }],
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
