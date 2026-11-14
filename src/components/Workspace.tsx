import Link from "next/link";
import { Icon, type IconName } from "./Icon";
export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="intro-copy">{description}</p>
      </div>
      {action && <div className="intro-action">{action}</div>}
    </div>
  );
}
export function EmptyState({
  icon,
  title,
  description,
  href,
  label,
}: {
  icon: IconName;
  title: string;
  description: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty-state">
      <span className="icon-box">
        <Icon name={icon} size={25} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {href && (
        <Link className="text-link" href={href}>
          {label}
          <Icon name="arrow" size={17} />
        </Link>
      )}
    </div>
  );
}
export function Notice({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warning" | "danger" | "success";
}) {
  return (
    <div className={`notice notice-${tone}`}>
      <Icon
        name={
          tone === "danger" || tone === "warning"
            ? "alert"
            : tone === "success"
              ? "check"
              : "shield"
        }
        size={19}
      />
      <div>{children}</div>
    </div>
  );
}
export function ToolLinks() {
  return (
    <div className="tool-links">
      <Link href="/fix">
        <Icon name="tool" />
        Fix a problem
        <Icon name="arrow-up" size={16} />
      </Link>
      <Link href="/prevent">
        <Icon name="calendar" />
        Plan maintenance
        <Icon name="arrow-up" size={16} />
      </Link>
      <Link href="/guides">
        <Icon name="book" />
        Build a skill
        <Icon name="arrow-up" size={16} />
      </Link>
      <Link href="/assistant">
        <Icon name="chat" />
        Ask a question
        <Icon name="arrow-up" size={16} />
      </Link>
    </div>
  );
}
