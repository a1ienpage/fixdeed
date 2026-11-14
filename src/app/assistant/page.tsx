"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useFixdeedState } from "@/lib/homeClientStore";
import { getTriageContext } from "@/lib/clientContext";
import { highestTier, type SafetyTier } from "@/lib/safetyGate";
import { Icon } from "@/components/Icon";
import { PageIntro, Notice } from "@/components/Workspace";
import { TierBadge } from "@/components/TierBadge";
interface Reply {
  replyText: string;
  safetyTier: SafetyTier;
  safetyFloor?: SafetyTier;
  canDiy: boolean;
  clarifyingQuestions: string[];
  possibleCauses: string[];
  nextSafeStep: string;
  materials: string[];
  recommendedGuideSlug: string | null;
  engineMode: string;
}
interface Item {
  id: string;
  role: "user" | "assistant";
  text: string;
  reply?: Reply;
}
const STARTERS = [
  "Water drips under my sink only when I run the faucet.",
  "My toilet keeps refilling every few minutes.",
  "My interior door started rubbing at the top.",
  "My washer has stopped draining.",
];
export default function Assistant() {
  const state = useFixdeedState();
  const [messages, setMessages] = useState<Item[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [safetyFloor, setFloor] = useState<SafetyTier | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [messages, loading]);
  async function send(override?: string) {
    const text = (override ?? input).trim();
    if (!text || loading) return;
    const user: Item = { id: crypto.randomUUID(), role: "user", text };
    const history = messages.slice(-8).map((m) => ({
      role: m.role,
      text: m.text.slice(0, 1500),
      ...(m.reply ? { safetyTier: m.reply.safetyTier } : {}),
    }));
    setMessages((items) => [...items, user]);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          safetyFloor: safetyFloor ?? undefined,
          profile: state.profileConfigured
            ? getTriageContext(state.profile)
            : undefined,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error ?? "The question could not be checked. Please try again.",
        );
      const reply: Reply = data.reply;
      setFloor(
        highestTier([safetyFloor, reply.safetyFloor ?? reply.safetyTier]),
      );
      setMessages((items) => [
        ...items,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: reply.replyText,
          reply,
        },
      ]);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Connection failed. Please try again.",
      );
      setInput(text);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="workspace container">
      <PageIntro
        eyebrow="A GOOD QUESTION IS A GOOD START"
        title="What's your home doing?"
        description="Describe what you notice. The guided assistant helps organize the observations and points you toward the right checks."
        action={
          messages.length > 0 ? (
            <button
              className="button button-outline button-small"
              disabled={loading}
              onClick={() => {
                setMessages([]);
                setFloor(null);
                setInput("");
                setError("");
              }}
            >
              New conversation
              <Icon name="plus" size={15} />
            </button>
          ) : undefined
        }
      />
      <div className="assistant-layout">
        <div className="stack">
          <section className="chat-window">
            <div className="chat-heading">
              <span className="icon-box">
                <Icon name="chat" size={19} />
              </span>
              <div>
                <h2>Your home assistant</h2>
                <p>
                  {state.profileConfigured
                    ? state.profile.homeName
                    : "Start with your observations"}
                </p>
              </div>
              <span className="pill">GUIDED MVP</span>
            </div>
            <div
              className="chat-messages"
              ref={scrollRef}
              role="log"
              aria-label="Conversation"
              aria-live="polite"
            >
              {messages.length === 0 ? (
                <div className="chat-item assistant">
                  <p className="chat-role">
                    FIXDEED / LET'S START WITH WHAT YOU KNOW
                  </p>
                  <p>
                    A drip, a noise, a door that won't quite close? Tell me
                    which fixture or appliance is affected and what happens.
                    I'll help you find the right questions to ask before
                    attempting a repair.
                  </p>
                  <div className="starter-prompts">
                    {STARTERS.slice(0, 3).map((prompt) => (
                      <button key={prompt} onClick={() => send(prompt)}>
                        {prompt}
                        <Icon name="arrow" size={15} />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((item) => (
                  <article key={item.id} className={`chat-item ${item.role}`}>
                    <p className="chat-role">
                      {item.role === "user"
                        ? "YOU"
                        : "FIXDEED / GUIDED RESPONSE"}
                    </p>
                    <p>{item.text}</p>
                    {item.reply && (
                      <div className="chat-structured">
                        {item.reply.clarifyingQuestions.length === 0 && (
                          <div>
                            <TierBadge tier={item.reply.safetyTier} />
                          </div>
                        )}
                        {item.reply.clarifyingQuestions.length > 0 && (
                          <div>
                            <h4>Details to check first</h4>
                            <ul>
                              {item.reply.clarifyingQuestions.map((q) => (
                                <li key={q}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <h4>
                            {item.reply.safetyTier === "EMERGENCY"
                              ? "Urgent next step"
                              : "Next step"}
                          </h4>
                          <p className="chat-next">{item.reply.nextSafeStep}</p>
                        </div>
                        {item.reply.materials.length > 0 &&
                          item.reply.canDiy && (
                            <div>
                              <h4>Materials mentioned</h4>
                              <p>{item.reply.materials.join(" · ")}</p>
                            </div>
                          )}
                        {item.reply.safetyTier !== "EMERGENCY" &&
                          item.reply.safetyTier !== "PRO_REQUIRED" && (
                            <Link className="text-link" href="/fix">
                              Answer the guided checks
                              <Icon name="arrow" size={15} />
                            </Link>
                          )}
                        {item.reply.safetyTier === "EMERGENCY" && (
                          <p className="small">
                            In the US, contact 911 from a safe location for an
                            active emergency. This chat cannot verify that the
                            situation is resolved.
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                ))
              )}
              {loading && (
                <div className="chat-item assistant">
                  <p className="chat-role">CHECKING THE GUIDED LIBRARY</p>
                  <div className="loading-line" />
                </div>
              )}
            </div>
            <div className="chat-input">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <label className="sr-only" htmlFor="assistant-input">
                  Describe your home question
                </label>
                <textarea
                  id="assistant-input"
                  value={input}
                  maxLength={1500}
                  rows={2}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Which fixture, what's happening, and when?"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={!input.trim() || loading}
                  aria-label="Send question"
                >
                  <Icon name="arrow" size={18} />
                </button>
              </form>
              <p>
                Guided rules, not a professional diagnosis. No photo analysis or
                external AI calls. Chat is not saved after reload.
              </p>
              {error && (
                <p className="error-feedback" role="alert">
                  {error}
                </p>
              )}
            </div>
          </section>
          {(safetyFloor === "EMERGENCY" || safetyFloor === "PRO_REQUIRED") && (
            <Notice tone={safetyFloor === "EMERGENCY" ? "danger" : "warning"}>
              This conversation keeps its safety stop across follow-up
              questions. The chat cannot verify that a hazard has been resolved.
              Start a new conversation only for a separate issue.
            </Notice>
          )}
        </div>
        <aside className="assistant-sidebar stack">
          <section className="surface">
            <p className="eyebrow">A LITTLE CONTEXT HELPS</p>
            <h3 style={{ fontSize: 22 }}>
              {state.profileConfigured
                ? "A home worth knowing."
                : "Make the checks more relevant."}
            </h3>
            <p className="aside-copy">
              {state.profileConfigured
                ? `${state.profile.yearBuilt} ${state.profile.housingType}. Your selected home details can inform the guided response, but do not establish materials or condition.`
                : "Add your home type, build year and equipment to tailor the maintenance list."}
            </p>
            <Link className="text-link mt-20" href="/my-home">
              {state.profileConfigured ? "View my home" : "Set up my home"}
              <Icon name="arrow" size={15} />
            </Link>
          </section>
          <section>
            <p className="eyebrow">KEEP IT SPECIFIC</p>
            <div className="starter-prompts">
              {STARTERS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => send(prompt)}
                  disabled={loading}
                >
                  {prompt}
                  <Icon name="arrow-up" size={14} />
                </button>
              ))}
            </div>
            <p className="small muted mt-20">
              Answer structured checks in the troubleshooting tool before
              following any repair steps.
            </p>
          </section>
          <Notice tone="warning">
            An active fire, gas smell, CO alarm or water near electrical
            equipment needs urgent professional help.{" "}
            <Link href="/safety">Read our safety limits.</Link>
          </Notice>
        </aside>
      </div>
    </div>
  );
}
