import type { CSSProperties } from "react";
export type IconName =
  | "arrow"
  | "arrow-up"
  | "home"
  | "tool"
  | "calendar"
  | "book"
  | "shield"
  | "check"
  | "plus"
  | "close"
  | "menu"
  | "chat"
  | "drop"
  | "wind"
  | "door"
  | "layers"
  | "washer"
  | "clock"
  | "download"
  | "trash"
  | "search"
  | "alert"
  | "chevron"
  | "lock"
  | "spark"
  | "receipt";
const paths: Record<IconName, React.ReactNode> = {
  arrow: <path d="M4 12h15M13 5l7 7-7 7" />,
  "arrow-up": <path d="M6 18 18 6M6 6h12v12" />,
  home: (
    <>
      <path d="m3 10 9-7 9 7v10H3Z" />
      <path d="M9 20v-7h6v7" />
    </>
  ),
  tool: <path d="m14 6 4 4 3-3a6 6 0 0 1-8 8l-6 6-4-4 6-6a6 6 0 0 1 8-8Z" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4m10-4v4M3 10h18M7 14h3m4 0h3m-10 4h3" />
    </>
  ),
  book: (
    <path d="M12 5C8 2 4 3 3 4v16c3-2 6-2 9 0 3-2 6-2 9 0V4c-3-2-6-2-9 1Zm0 0v15" />
  ),
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  chat: (
    <>
      <path d="M21 11c0 5-4 8-9 8H5l-3 3V6c0-3 4-4 10-4s9 4 9 9Z" />
      <path d="M7 8h10M7 12h7" />
    </>
  ),
  drop: (
    <path d="M12 2S4 11 4 15a8 8 0 0 0 16 0c0-4-8-13-8-13Zm-4 13c0 2 1 3 3 3" />
  ),
  wind: (
    <path d="M3 8h12a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h5a3 3 0 1 1-3 3" />
  ),
  door: <path d="M4 21V3h16v18M7 21V5l10-2v18ZM13 12h1" />,
  layers: <path d="m12 3 10 5-10 5L2 8ZM2 12l10 5 10-5M2 16l10 5 10-5" />,
  washer: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M4 7h16M7 4h1m2 0h1" />
      <circle cx="12" cy="14" r="5" />
      <path d="M8 14c3 3 5-3 8 0" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
  trash: <path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7" />,
  search: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="m15 15 6 6" />
    </>
  ),
  alert: <path d="m12 3 10 18H2ZM12 9v5m0 3v.1" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3" />
    </>
  ),
  spark: <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z" />,
  receipt: (
    <path d="M5 2v20l3-2 4 2 4-2 3 2V2l-3 2-4-2-4 2ZM8 8h8M8 12h8m-8 4h4" />
  ),
};
export function Icon({
  name,
  size = 20,
  className = "",
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {paths[name]}
    </svg>
  );
}
