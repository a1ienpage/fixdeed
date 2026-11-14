import { describe, it, expect } from "vitest";
import { createRequestGuard } from "@/lib/requestGuard";
import { getTriageContext } from "@/lib/clientContext";
import { DEFAULT_STATE } from "@/lib/homeStore";
const deferred = () => {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => (release = resolve));
  return { promise, release };
};
describe("latest request authority", () => {
  it("an edit revokes a pending diagnosis even if the transport ignores abort", async () => {
    const guard = createRequestGuard();
    const old = guard.start();
    const response = deferred();
    const published: string[] = [];
    const task = response.promise.then(() => {
      if (old.isCurrent()) published.push("old DIY steps");
    });
    guard.invalidate();
    response.release();
    await task;
    expect(old.signal.aborted).toBe(true);
    expect(published).toEqual([]);
  });
  it("only the most recent request may publish an out-of-order response", async () => {
    const guard = createRequestGuard();
    const first = guard.start();
    const second = guard.start();
    const a = deferred();
    const b = deferred();
    const published: string[] = [];
    const one = a.promise.then(() => {
      if (first.isCurrent()) published.push("old");
    });
    const two = b.promise.then(() => {
      if (second.isCurrent()) published.push("new");
    });
    b.release();
    await two;
    a.release();
    await one;
    expect(published).toEqual(["new"]);
  });
  it("unmount cancellation revokes successful response handlers", () => {
    const guard = createRequestGuard();
    const work = guard.start();
    guard.invalidate();
    expect(work.isCurrent()).toBe(false);
  });
});
describe("minimum diagnostic context", () => {
  it("never transmits household nickname, notes, plan or inventory", () => {
    const context = getTriageContext({
      ...DEFAULT_STATE.profile,
      homeName: "Private nickname",
      pastIssues: ["sensitive note"],
      planTier: "family",
      appliances: ["washer_dryer"],
    });
    expect(context).toEqual({ yearBuilt: 2000, homeEra: "1980_2000" });
    expect(JSON.stringify(context)).not.toMatch(
      /Private|sensitive|family|washer_dryer/,
    );
  });
});
