"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/** 라이트/다크 토글. localStorage에 저장하고 <html data-theme>에 반영(FOUC 방지 스크립트는 layout). */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lore-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
    else setTheme(null);
  }, []);

  const systemDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const current: Theme = theme ?? (systemDark ? "dark" : "light");

  function toggle() {
    const next: Theme = current === "dark" ? "light" : "dark";
    localStorage.setItem("lore-theme", next);
    document.documentElement.dataset.theme = next;
    setTheme(next);
  }

  return (
    <button className="back-btn" onClick={toggle} aria-label="테마 전환" type="button">
      {current === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
