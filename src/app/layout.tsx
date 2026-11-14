import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { Header, Brand } from "@/components/Header";
import { Icon } from "@/components/Icon";
export const metadata: Metadata = {
  icons: { icon: "/icon.svg" },
  title: "Fixdeed — A little know-how. A better-kept home.",
  description:
    "Know what to check, when to call a pro, and what to take care of next. Guided home troubleshooting, recurring maintenance and practical homeowner skills.",
};
export const viewport: Viewport = { themeColor: "#f6f5f1" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="footer-top">
            <div>
              <Brand />
              <p>
                A little know-how.
                <br />A better-kept home.
              </p>
            </div>
            <nav aria-label="Footer navigation">
              <Link href="/fix">Fix a problem</Link>
              <Link href="/prevent">Maintenance</Link>
              <Link href="/guides">Practical skills</Link>
              <Link href="/assistant">Home assistant</Link>
            </nav>
            <div className="footer-note">
              <Icon name="lock" size={18} />
              <p>
                Your home record is stored in this browser.
                <br />
                <Link href="/privacy">Privacy & data controls</Link>
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>Fixdeed · Hackathon MVP</span>
            <p>
              Educational guidance, not an inspection or professional diagnosis.{" "}
              <Link href="/safety">How we handle safety</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
