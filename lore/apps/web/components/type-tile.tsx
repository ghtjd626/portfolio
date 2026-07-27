"use client";

import Link from "next/link";
import type { LocalRecordType } from "../lib/store/entities";
import { TypeIcon } from "./icons";

/** 종류 타일 — 카탈로그/인덱스카드 느낌. 색은 작은 스와치로(왼쪽 액센트 바 클리셰 대신). */
export function TypeTile({
  type,
  count,
  href,
}: {
  type: LocalRecordType;
  count?: number;
  href: string;
}) {
  const color = type.color ?? "var(--primary)";
  return (
    <Link href={href} className="type-tile">
      <div className="type-tile-top">
        <span
          className="type-swatch"
          style={{
            background: `color-mix(in srgb, ${color} 15%, transparent)`,
            color,
          }}
        >
          <TypeIcon icon={type.icon} size={19} />
        </span>
        {count !== undefined && <span className="type-tile-count">{count}</span>}
      </div>
      <span className="type-tile-name">{type.name}</span>
    </Link>
  );
}
