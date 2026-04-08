import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "이지회식 — 모두가 납득하는 회식장소",
  description: "참석자 위치와 예산, 종목을 고려한 최적 회식장소 추천",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
