import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import * as client from "@/lib/homeClientStore";
import * as home from "@/lib/homeStore";
import { PREVENTIVE_TASKS } from "@/content/preventive";
import { GUIDES } from "@/content/guides";

// Browser storage is the boundary; the store, validation, and reducers are real.
let values: Map<string, string>;
beforeEach(() => {
  vi.resetModules();
  values = new Map();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => values.set(k, v),
      removeItem: (k: string) => values.delete(k),
    },
    addEventListener: () => {},
  });
});
afterEach(() => vi.unstubAllGlobals());
const read = async () =>
  JSON.parse((await import("@/lib/homeClientStore")).getExportData());
const repair = {
  title: "fixed fixture",
  category: "Plumbing" as const,
  outcome: "diy_fixed" as const,
  proEstimate: 100,
  diySpent: 20,
  savedAmount: 999,
  confirmationId: "confirmation-a",
};

describe("confirmed records and persistence", () => {
  it("exports personal data and ignores fabricated v1 history", async () => {
    values.set(
      "fixdeed:v1",
      JSON.stringify({ ...home.DEFAULT_STATE, repairHistory: [repair] }),
    );
    expect(typeof client.getExportData).toBe("function");
    expect((await read()).repairHistory).toEqual([]);
  });
  it("derives savings, requires confirmation, and rejects duplicate submission", async () => {
    const store = await import("@/lib/homeClientStore");
    expect(
      store.logCompletedRepair({ ...repair, confirmationId: undefined }),
    ).toBe(false);
    expect(store.logCompletedRepair(repair)).toBe(true);
    expect(store.logCompletedRepair(repair)).toBe(false);
    expect((await read()).repairHistory[0].savedAmount).toBe(80);
    expect(
      store.logCompletedRepair({
        ...repair,
        confirmationId: "b",
        outcome: "pro_routed",
      }),
    ).toBe(true);
    expect((await read()).repairHistory[0].savedAmount).toBe(0);
  });
  it.each([NaN, Infinity, -1])("rejects invalid cost %s", async (cost) => {
    const store = await import("@/lib/homeClientStore");
    expect(store.logCompletedRepair({ ...repair, diySpent: cost })).toBe(false);
    expect((await read()).repairHistory).toEqual([]);
  });
  it("keeps over thirty confirmed records", async () => {
    const store = await import("@/lib/homeClientStore");
    for (let i = 0; i < 35; i++)
      store.logCompletedRepair({
        ...repair,
        confirmationId: `confirmation-${i}`,
      });
    expect((await read()).repairHistory).toHaveLength(35);
  });
  it("resets demo history when creating personal profile and clears data", async () => {
    const store = await import("@/lib/homeClientStore");
    store.resetDemoHome();
    expect(JSON.parse(values.get("fixdeed:demo:v2")!).dataMode).toBe("demo");
    expect((await read()).dataMode).toBe("personal");
    store.updateProfile({ homeName: "My actual home" });
    const personal = await read();
    expect(personal.dataMode).toBe("personal");
    expect(personal.profileConfigured).toBe(true);
    expect(personal.repairHistory).toEqual([]);
    expect(personal.unlockedSkills).toEqual([]);
    store.clearHomeData();
    expect((await read()).profileConfigured).toBe(false);
  });
  it("fails safely on malformed stored data", async () => {
    values.set(
      "fixdeed:v2",
      JSON.stringify({
        ...home.DEFAULT_STATE,
        repairHistory: "not-array",
        diagnosticsRun: -1,
      }),
    );
    expect((await read()).repairHistory).toEqual([]);
  });
  it("persists a completed maintenance cycle and can explicitly clear it", async () => {
    const store = await import("@/lib/homeClientStore");
    store.completePreventiveTask("prev_gfci_test");
    expect((await read()).completedPreventive.prev_gfci_test).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
    store.uncompletePreventiveTask("prev_gfci_test");
    expect((await read()).completedPreventive).toEqual({});
  });
  it("marks expired completion today rather than removing the old date", async () => {
    values.set(
      "fixdeed:v2",
      JSON.stringify({
        ...home.DEFAULT_STATE,
        completedPreventive: { prev_gfci_test: "2020-01-01" },
      }),
    );
    const store = await import("@/lib/homeClientStore");
    store.togglePreventiveTask("prev_gfci_test");
    expect((await read()).completedPreventive.prev_gfci_test).not.toBe(
      "2020-01-01",
    );
    expect((await read()).completedPreventive.prev_gfci_test).toBeTruthy();
  });
  it("awards only a correct transfer assessment once and retains it on reload", async () => {
    const store = await import("@/lib/homeClientStore");
    const practice = await import("@/content/practice");
    const c = practice.getTransferCase("sink-leaking");
    expect(store.completeSkillAssessment("sink-leaking", "wrong")).toBe(false);
    expect(store.completeSkillAssessment("unknown", c.correctId)).toBe(false);
    expect(store.completeSkillAssessment("sink-leaking", c.correctId)).toBe(
      true,
    );
    expect(store.completeSkillAssessment("sink-leaking", c.correctId)).toBe(
      false,
    );
    vi.resetModules();
    const refreshed = await read();
    expect(refreshed.unlockedSkills).toHaveLength(1);
    expect(refreshed.repairHistory).toEqual([]);
    expect(home.calculateSavingsSummary(refreshed).savedThisYear).toBe(0);
  });
});

it("reports blocked storage while retaining accepted in-memory data for export", async () => {
  const store = await import("@/lib/homeClientStore");
  window.localStorage.setItem = () => {
    throw new Error("Quota exceeded");
  };
  expect(store.logCompletedRepair(repair)).toBe(true);
  expect(store.getPersistenceStatus()).toBe("unavailable");
  expect((await read()).repairHistory).toHaveLength(1);
});

it("keeps personal records intact across demo loading, refresh, and profile editing", async () => {
  const store = await import("@/lib/homeClientStore");
  store.updateProfile({ homeName: "Real home" });
  store.logCompletedRepair(repair);
  store.resetDemoHome();
  expect(JSON.parse(store.getExportData()).repairHistory).toHaveLength(1);
  vi.resetModules();
  const refreshed = await import("@/lib/homeClientStore");
  expect(JSON.parse(refreshed.getExportData()).profile.homeName).toBe(
    "Real home",
  );
  refreshed.switchToPersonalHome();
  expect(JSON.parse(refreshed.getExportData()).repairHistory).toHaveLength(1);
  refreshed.resetDemoHome();
  refreshed.updateProfile({ homeName: "Renamed real home" });
  expect(JSON.parse(refreshed.getExportData()).repairHistory).toHaveLength(1);
});

it("reports a failed clear and keeps unsaved personal records exportable when removal throws", async () => {
  const store = await import("@/lib/homeClientStore");
  store.updateProfile({ homeName: "Retained home" });
  window.localStorage.setItem = () => {
    throw new Error("Quota exceeded");
  };
  store.logCompletedRepair(repair);
  window.localStorage.removeItem = () => {
    throw new Error("Removal denied");
  };
  expect(store.clearHomeData()).toBe(false);
  expect(store.getPersistenceStatus()).toBe("unavailable");
  expect(JSON.parse(store.getExportData()).repairHistory).toHaveLength(1);
});
it("retains personal export after a partially completed clear and permits a successful retry", async () => {
  const store = await import("@/lib/homeClientStore");
  store.updateProfile({ homeName: "Retained home" });
  store.logCompletedRepair(repair);
  window.localStorage.removeItem = (key: string) => {
    if (key === "fixdeed:demo:v2") throw new Error("Demo removal failed");
    values.delete(key);
  };
  expect(store.clearHomeData()).toBe(false);
  expect(store.getPersistenceStatus()).toBe("unavailable");
  expect(JSON.parse(store.getExportData()).repairHistory).toHaveLength(1);
  window.localStorage.removeItem = (key: string) => {
    values.delete(key);
  };
  expect(store.clearHomeData()).toBe(true);
  expect(JSON.parse(store.getExportData()).repairHistory).toEqual([]);
});
it("does not claim clear success when a storage provider silently retains a key", async () => {
  const store = await import("@/lib/homeClientStore");
  store.logCompletedRepair(repair);
  window.localStorage.removeItem = () => {};
  expect(store.clearHomeData()).toBe(false);
  expect(JSON.parse(store.getExportData()).repairHistory).toHaveLength(1);
});
