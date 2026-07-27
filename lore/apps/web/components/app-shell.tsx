"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";
import { ThemeToggle } from "./theme-toggle";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "홈", icon: "home" },
  { href: "/new", label: "기록", icon: "plus" },
  { href: "/settings", label: "설정", icon: "sliders" },
];

/** 반응형 셸: 데스크톱=사이드바, 모바일=상단바+하단 내비(thumb-zone). */
export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Lore</div>
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`nav-item ${isActive(n.href) ? "active" : ""}`}
          >
            <Icon name={n.icon} size={19} />
            {n.label}
          </Link>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: "0 12px" }}>
          <ThemeToggle />
        </div>
      </aside>

      <div>
        <header className="topbar">
          <span className="topbar-title">Lore</span>
          <span className="topbar-spacer" />
          <ThemeToggle />
        </header>
        <main className="app-main">{children}</main>
      </div>

      <nav className="bottomnav">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`bottomnav-item ${isActive(n.href) ? "active" : ""}`}
          >
            <Icon name={n.icon} size={23} strokeWidth={isActive(n.href) ? 2.1 : 1.75} />
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
