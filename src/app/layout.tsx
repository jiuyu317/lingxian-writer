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
  title: "灵现 · AI写作智能体 - 你的专属灵感激发师",
  description: "灵现智能体：专为写作者设计的AI灵感激发师。跨界融合、反套路脑洞、情绪精准调节，让你的创作灵感源源不断。",
  keywords: ["AI写作", "灵感生成", "创作助手", "故事创作", "写作工具", "智能写作"],
  authors: [{ name: "灵现智能体" }],
  openGraph: {
    title: "灵现 · AI写作智能体",
    description: "给你的大脑放烟花！24小时在线的创作伙伴",
    type: "website",
  },
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
        {children}
      </body>
    </html>
  );
}
