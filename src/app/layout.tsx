import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Agent Commerce",
  description: "AI 에이전트와 대화하여 쇼핑몰을 관리하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen`}
        style={{
          ["--font-pretendard" as string]: "'Pretendard Variable', Pretendard",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
