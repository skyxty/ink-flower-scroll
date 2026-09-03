import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "花信水墨长卷",
  description: "点击、滑动，让十四种中国花木在宣纸上渐次开放。",
  other: { "codex-preview": "development" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
