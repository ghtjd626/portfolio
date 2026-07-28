import type { AnchorHTMLAttributes, ReactNode } from "react";

/** next/link 대체 — 해시 경로로 라우팅. */
export default function Link({
  href,
  children,
  ...rest
}: { href: string; children?: ReactNode } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>) {
  return (
    <a href={`#${href}`} {...rest}>
      {children}
    </a>
  );
}
