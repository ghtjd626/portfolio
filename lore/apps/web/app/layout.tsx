import type { ReactNode } from "react";

export const metadata = {
  title: "Lore",
  description: "내가 직접 정의하는 local-first 개인 기록 플랫폼",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
