import Link from "next/link";
import { Notice } from "@/components/Workspace";
export default function Privacy() {
  return (
    <div className="container">
      <article className="prose-page">
        <p className="eyebrow">PRIVACY & YOUR DATA</p>
        <h1>
          Your home.
          <br />
          Your information.
        </h1>
        <p className="intro-copy">
          This MVP keeps your home record in this browser. Here's what that
          means in practice.
        </p>
        <section>
          <h2>What stays on your device</h2>
          <p>
            Your home profile, completed maintenance, practiced skills and
            repair ledger are stored in this browser's local storage. A separate
            sample-home record keeps demo history apart from your personal
            records. No address, email, payment information or account is
            required.
          </p>
        </section>
        <section>
          <h2>What is sent to the app server</h2>
          <p>
            When you request troubleshooting or ask the assistant a question,
            the app sends your description, selected answers, and only your
            home's build year and derived construction era to its server. The
            assistant also sends recent conversation and its safety status. Your
            saved home nickname, notes, equipment inventory and repair ledger
            are not included. The current implementation does not call an
            external AI model, analyze images or save this chat in an
            application database. Chat history stays in memory until you reload
            or start a new conversation.
          </p>
          <p>
            Hosting infrastructure may generate operational request logs. Do not
            enter sensitive personal information into descriptions or notes.
          </p>
        </section>
        <section>
          <h2>Local storage is not a secure vault</h2>
          <p>
            Records are not end-to-end encrypted. Someone with access to your
            browser profile may be able to read them. Browser extensions, device
            compromise and cleared site data can affect privacy or availability.
            Use your own trusted device and avoid storing confidential
            information.
          </p>
        </section>
        <section>
          <h2>Export or clear your records</h2>
          <p>
            In <Link href="/my-home">My home</Link>, you can download a JSON
            copy of your personal record or permanently clear Fixdeed data from
            this browser. The export contains personal records even while you
            are exploring a sample home. Store exported files somewhere you
            control.
          </p>
          <p>
            Clearing this browser's data cannot remove an export you previously
            downloaded. There is no cloud backup or cross-device synchronization
            in this MVP.
          </p>
        </section>
        <section>
          <h2>When storage is unavailable</h2>
          <p>
            The application shows a warning if browser storage fails. You can
            continue during the session, but your changes may not survive
            closing or reloading the page. Export them before leaving.
          </p>
        </section>
        <Notice>
          Use <Link href="/my-home">My home data controls</Link> to export your
          records or clear this browser's Fixdeed data.
        </Notice>
      </article>
    </div>
  );
}
