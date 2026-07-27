"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

export function Loading() {
  return (
    <div className="center-pad">
      <div className="spinner" />
    </div>
  );
}

export function EmptyState({
  icon = "tag",
  title,
  sub,
  action,
}: {
  icon?: IconName;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={26} />
      </div>
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
  leading,
  action,
}: {
  title: string;
  sub?: string;
  back?: boolean;
  leading?: ReactNode;
  action?: ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="page-head">
      {back && (
        <button className="icon-btn" onClick={() => router.back()} aria-label="뒤로" type="button">
          <Icon name="chevronLeft" size={20} />
        </button>
      )}
      {leading}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="page-title">{title}</div>
        {sub && <div className="page-sub">{sub}</div>}
      </div>
      {action}
    </div>
  );
}
