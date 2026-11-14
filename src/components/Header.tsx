"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";
import {
  useFixdeedState,
  useHydrated,
  switchToPersonalHome,
} from "@/lib/homeClientStore";
const LINKS = [
  { href: "/fix", label: "Fix a problem" },
  { href: "/prevent", label: "Maintenance" },
  { href: "/guides", label: "Learn" },
  { href: "/assistant", label: "Home assistant" },
];
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Fixdeed home">
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <path d="M3 3h26v8H11v5h13v7H11v8H3Z" fill="currentColor" />
        <path d="M22 23h7v8h-7Z" fill="var(--violet)" />
      </svg>
      <span>
        fixdeed<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const state = useFixdeedState();
  const hydrated = useHydrated();
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav
          className={`main-nav ${open ? "nav-open" : ""}`}
          aria-label="Main navigation"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={path.startsWith(link.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link
            className="button button-small button-dark"
            href="/my-home"
            onClick={() => setOpen(false)}
          >
            My home
            <Icon name="arrow-up" size={16} />
          </Link>
          <button
            className="menu-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>
      {hydrated && state.dataMode === "demo" && (
        <div className="global-demo-bar">
          <span>
            You're exploring a sample home. Your personal records are separate.
          </span>
          <button onClick={switchToPersonalHome}>
            Return to my home
            <Icon name="arrow" size={13} />
          </button>
        </div>
      )}
    </header>
  );
}
