"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function Loading() {
  return (
    <div className="center-pad">
      <div className="spinner" />
    </div>
  );
}

export function EmptyState({
  emoji,
  title,
  sub,
  action,
}: {
  emoji: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-emoji">{emoji}</div>
      <div className="empty-title">{title}</div>
      {sub && <div>{sub}</div>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  sub,
  back,
  action,
}: {
  title: string;
  sub?: string;
  back?: boolean;
  action?: ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="page-head">
      {back && (
        <button className="back-btn" onClick={() => router.back()} aria-label="뒤로" type="button">
          ‹
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="page-title">{title}</div>
        {sub && <div className="page-sub">{sub}</div>}
      </div>
      {action}
    </div>
  );
}
