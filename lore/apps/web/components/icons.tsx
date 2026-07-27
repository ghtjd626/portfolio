import type { ReactNode, SVGProps } from "react";

/**
 * 직접 만든 라인 아이콘 세트 — 이모지(AI스러움)를 대체한다.
 * 24x24 · stroke=currentColor · round. 색은 부모의 color로 상속.
 */
export type IconName =
  | "home"
  | "plus"
  | "sliders"
  | "chevronLeft"
  | "chevronRight"
  | "arrowRight"
  | "close"
  | "trash"
  | "sun"
  | "moon"
  | "check"
  | "download"
  | "upload"
  | "sync"
  | "wallet"
  | "checkCircle"
  | "book"
  | "bookOpen"
  | "calendar"
  | "dumbbell"
  | "heart"
  | "star"
  | "coffee"
  | "cart"
  | "activity"
  | "music"
  | "camera"
  | "mapPin"
  | "briefcase"
  | "pencil"
  | "target"
  | "leaf"
  | "tag"
  | "clock";

const P: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M4 11.4 12 5l8 6.4" />
      <path d="M6 10.2V19h12v-8.8" />
      <path d="M10 19v-4.5h4V19" />
    </>
  ),
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  sliders: (
    <>
      <path d="M4 8h9M17 8h3" />
      <circle cx="15" cy="8" r="2.1" />
      <path d="M4 16h3M11 16h9" />
      <circle cx="9" cy="16" r="2.1" />
    </>
  ),
  chevronLeft: <path d="M14.5 6.5 9 12l5.5 5.5" />,
  chevronRight: <path d="M9.5 6.5 15 12l-5.5 5.5" />,
  arrowRight: <path d="M5 12h13M13 6.5 18.5 12 13 17.5" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  trash: (
    <>
      <path d="M4.5 7h15" />
      <path d="M9 7V5h6v2" />
      <path d="M6.5 7 7.4 19h9.2L17.5 7" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="3.8" />
      <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
    </>
  ),
  moon: <path d="M20 13.5A8 8 0 1 1 10.5 4a6.3 6.3 0 0 0 9.5 9.5z" />,
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  download: <path d="M12 4v10M8 10.5l4 4 4-4M5 19h14" />,
  upload: <path d="M12 15V5M8 8.5l4-4 4 4M5 19h14" />,
  sync: (
    <>
      <path d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3L20 9" />
      <path d="M20 4.5V9h-4.5" />
      <path d="M19.5 12a7.5 7.5 0 0 1-12.8 5.3L4 15" />
      <path d="M4 19.5V15h4.5" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6H16v2" />
      <rect x="4" y="7.5" width="16" height="11" rx="2.2" />
      <circle cx="16.5" cy="13" r="1.2" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12l2.5 2.5 4.7-5.2" />
    </>
  ),
  book: (
    <>
      <path d="M6 4h11a1 1 0 0 1 1 1v15H7a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1z" />
      <path d="M9 4v16" />
    </>
  ),
  bookOpen: (
    <>
      <path d="M12 6.5C10.3 5 6.5 4.5 4.5 5.4v12.4c2-.9 5.8-.4 7.5 1.1 1.7-1.5 5.5-2 7.5-1.1V5.4C17.5 4.5 13.7 5 12 6.5z" />
      <path d="M12 6.5v12.4" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.2" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  dumbbell: <path d="M6.5 9v6M17.5 9v6M3.5 10.5v3M20.5 10.5v3M6.5 12h11" />,
  heart: <path d="M12 20s-7-4.4-7-9.4A3.6 3.6 0 0 1 12 7.6 3.6 3.6 0 0 1 19 10.6c0 5-7 9.4-7 9.4z" />,
  star: <path d="M12 4l2.5 5.1 5.6.8-4 3.9 1 5.6L12 16.8 6.9 19.4l1-5.6-4-3.9 5.6-.8z" />,
  coffee: (
    <>
      <path d="M4.5 8.5h12v4.5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4z" />
      <path d="M16.5 9.5h1.8a2 2 0 0 1 0 4h-1.8" />
      <path d="M7 3.5v2M11 3.5v2" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
      <path d="M3 4.5h2l2.2 10.5h10L20 8H6.2" />
    </>
  ),
  activity: <path d="M3.5 12.5h4l2.2 6 4-13 2.2 7h4.6" />,
  music: (
    <>
      <circle cx="7" cy="18" r="2.1" />
      <circle cx="17.5" cy="16" r="2.1" />
      <path d="M9 18V6.5l10.5-2V16" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2.4" />
      <circle cx="12" cy="14" r="3.4" />
      <path d="M8.5 7.5 10 4.5h4l1.5 3" />
    </>
  ),
  mapPin: (
    <>
      <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12" rx="2.2" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3 13h18" />
    </>
  ),
  pencil: <path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4.5C10.5 4.5 4.5 10 4.5 19.5c9.5 0 15.5-5.5 15.5-15z" />
      <path d="M5 19C9 13.5 12.5 11 18 8" />
    </>
  ),
  tag: (
    <>
      <path d="M4 4.5h6.5L20 14l-5.5 5.5L5 10V4.5z" />
      <circle cx="8" cy="8" r="1.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
};

export function Icon({
  name,
  size = 22,
  strokeWidth = 1.75,
  ...rest
}: { name: IconName; size?: number; strokeWidth?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {P[name]}
    </svg>
  );
}

/** 사용자가 종류에 붙일 수 있는 아이콘 후보. */
export const TYPE_ICON_NAMES: IconName[] = [
  "wallet",
  "checkCircle",
  "book",
  "bookOpen",
  "pencil",
  "calendar",
  "clock",
  "dumbbell",
  "activity",
  "heart",
  "star",
  "target",
  "coffee",
  "cart",
  "music",
  "camera",
  "mapPin",
  "briefcase",
  "leaf",
  "tag",
];

export function isIconName(s: string | undefined): s is IconName {
  return !!s && Object.prototype.hasOwnProperty.call(P, s);
}

/** 종류 아이콘 렌더: 아이콘 이름이면 SVG, (레거시) 이모지면 그대로, 없으면 tag. */
export function TypeIcon({
  icon,
  size = 18,
  className,
}: {
  icon?: string;
  size?: number;
  className?: string;
}) {
  if (isIconName(icon)) return <Icon name={icon} size={size} className={className} />;
  if (icon && icon.trim())
    return (
      <span className={className} style={{ fontSize: size, lineHeight: 1 }}>
        {icon}
      </span>
    );
  return <Icon name="tag" size={size} className={className} />;
}
