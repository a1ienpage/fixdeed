"use client";
import { useSyncExternalStore } from "react";
import {
  DEFAULT_STATE,
  DEMO_STATE,
  FixdeedStateSchema,
  HomeProfileSchema,
  addConfirmedRepair,
  deriveHomeEra,
  localDate,
  type FixdeedState,
  type HomeProfile,
  type PlanTier,
  type RepairLogEntry,
  type UnlockedSkill,
} from "@/lib/homeStore";
import { PREVENTIVE_TASKS } from "@/content/preventive";
import { getGuideBySlug } from "@/content/guides";
import { getTransferCase } from "@/content/practice";
import { getTaskStatus } from "@/lib/scheduling";

export const STORAGE_KEY = "fixdeed:v2";
export const DEMO_STORAGE_KEY = "fixdeed:demo:v2";
const MODE_KEY = "fixdeed:mode:v2";
let cache: FixdeedState | null = null;
let personalCache: FixdeedState | null = null;
let persistenceStatus: "saved" | "unavailable" = "saved";
let storageListening = false;
const listeners = new Set<() => void>();
const fresh = (): FixdeedState => structuredClone(DEFAULT_STATE);
function notify() {
  listeners.forEach((cb) => cb());
}
function listenToStorage() {
  if (typeof window === "undefined" || storageListening) return;
  window.addEventListener("storage", (event) => {
    if (
      [STORAGE_KEY, DEMO_STORAGE_KEY, MODE_KEY].includes(event.key ?? "") ||
      event.key === null
    ) {
      cache = null;
      personalCache = null;
      readState();
      notify();
    }
  });
  storageListening = true;
}
function loadStored(
  key: string,
  expectedMode: "personal" | "demo",
): FixdeedState {
  const raw = window.localStorage.getItem(key);
  if (!raw)
    return expectedMode === "personal" ? fresh() : structuredClone(DEMO_STATE);
  const parsed = FixdeedStateSchema.safeParse(JSON.parse(raw));
  if (!parsed.success || parsed.data.dataMode !== expectedMode) {
    persistenceStatus = "unavailable";
    return { ...fresh(), dataMode: expectedMode };
  }
  return parsed.data;
}
function readState(): FixdeedState {
  if (cache) return cache;
  if (typeof window === "undefined") return DEFAULT_STATE;
  listenToStorage();
  let demo = false;
  try {
    persistenceStatus = "saved";
    demo = window.localStorage.getItem(MODE_KEY) === "demo";
    cache = loadStored(
      demo ? DEMO_STORAGE_KEY : STORAGE_KEY,
      demo ? "demo" : "personal",
    );
    if (cache.dataMode === "personal") personalCache = cache;
  } catch {
    cache = { ...fresh(), dataMode: demo ? "demo" : "personal" };
    persistenceStatus = "unavailable";
  }
  return cache;
}
function readPersonalHome(): FixdeedState {
  const active = readState();
  if (active.dataMode === "personal") return active;
  if (personalCache) return personalCache;
  try {
    personalCache = loadStored(STORAGE_KEY, "personal");
  } catch {
    personalCache = fresh();
    persistenceStatus = "unavailable";
  }
  return personalCache;
}
function writeState(next: FixdeedState): void {
  const validated = FixdeedStateSchema.safeParse(next);
  if (!validated.success) return;
  cache = validated.data;
  if (cache.dataMode === "personal") personalCache = cache;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        cache.dataMode === "demo" ? DEMO_STORAGE_KEY : STORAGE_KEY,
        JSON.stringify(cache),
      );
      window.localStorage.setItem(MODE_KEY, cache.dataMode);
      persistenceStatus = "saved";
    } catch {
      persistenceStatus = "unavailable";
    }
  } else persistenceStatus = "unavailable";
  notify();
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  listenToStorage();
  return () => {
    listeners.delete(cb);
  };
}
export function useFixdeedState(): FixdeedState {
  return useSyncExternalStore(subscribe, readState, () => DEFAULT_STATE);
}
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
export function getPersistenceStatus(): "saved" | "unavailable" {
  readState();
  return persistenceStatus;
}
export function usePersistenceStatus(): "saved" | "unavailable" {
  return useSyncExternalStore(subscribe, getPersistenceStatus, () => "saved");
}
/** Exports personal records even while the example home is active. */
export function getExportData(): string {
  return JSON.stringify(readPersonalHome(), null, 2);
}
export function updateProfile(patch: Partial<HomeProfile>): void {
  const state = readPersonalHome();
  const yearBuilt = patch.yearBuilt ?? state.profile.yearBuilt;
  const profile = HomeProfileSchema.safeParse({
    ...state.profile,
    ...patch,
    yearBuilt,
    homeEra: deriveHomeEra(yearBuilt),
  });
  if (profile.success)
    writeState({
      ...state,
      dataMode: "personal",
      profileConfigured: true,
      profile: profile.data,
    });
}
export function setPlanTier(planTier: PlanTier): void {
  updateProfile({ planTier });
}
export function completePreventiveTask(taskId: string): void {
  if (!PREVENTIVE_TASKS.some((task) => task.id === taskId)) return;
  const s = readState();
  writeState({
    ...s,
    completedPreventive: { ...s.completedPreventive, [taskId]: localDate() },
  });
}
export function uncompletePreventiveTask(taskId: string): void {
  const s = readState();
  const completedPreventive = { ...s.completedPreventive };
  delete completedPreventive[taskId];
  writeState({ ...s, completedPreventive });
}
export function togglePreventiveTask(taskId: string): void {
  const task = PREVENTIVE_TASKS.find((t) => t.id === taskId);
  if (!task) return;
  const s = readState();
  if (getTaskStatus(task, s.completedPreventive[taskId]).status === "upcoming")
    uncompletePreventiveTask(taskId);
  else completePreventiveTask(taskId);
}
/** Returns accepted-in-memory status; usePersistenceStatus reports whether browser storage succeeded. */
export function logCompletedRepair(
  entry: Omit<RepairLogEntry, "id" | "date">,
): boolean {
  const next = addConfirmedRepair(readState(), entry);
  if (!next) return false;
  writeState(next);
  return true;
}
export function completeSkillAssessment(
  guideSlug: string,
  answerId: string,
): boolean {
  const guide = getGuideBySlug(guideSlug);
  const assessment = getTransferCase(guideSlug);
  const s = readState();
  if (
    !guide ||
    !assessment.correctId ||
    assessment.correctId !== answerId ||
    s.unlockedSkills.some((skill) => skill.id === guideSlug)
  )
    return false;
  writeState({
    ...s,
    unlockedSkills: [
      ...s.unlockedSkills,
      {
        id: guide.slug,
        title: guide.skillUnlockedTitle,
        category: guide.skillCategory,
        unlockedAt: localDate(),
      },
    ],
  });
  return true;
}
/** Retained for source compatibility; only assessment completion can award a skill. */
export function unlockSkill(_skill: Omit<UnlockedSkill, "unlockedAt">): void {}
export function incrementDiagnosticsCount(): void {
  const s = readState();
  writeState({ ...s, diagnosticsRun: s.diagnosticsRun + 1 });
}
export function resetDemoHome(): void {
  readPersonalHome();
  writeState(structuredClone(DEMO_STATE));
}
export function switchToPersonalHome(): void {
  writeState(readPersonalHome());
}
/** Clear only reports success once every owned storage key reads back absent. */
export function clearHomeData(): boolean {
  const previousActive = readState();
  const previousPersonal = readPersonalHome();
  const keys = [STORAGE_KEY, DEMO_STORAGE_KEY, MODE_KEY, "fixdeed:v1"];
  try {
    if (typeof window === "undefined") throw new Error("Browser unavailable");
    for (const key of keys) window.localStorage.removeItem(key);
    if (keys.some((key) => window.localStorage.getItem(key) !== null))
      throw new Error("Home data remains in storage");
    cache = fresh();
    personalCache = cache;
    persistenceStatus = "saved";
    notify();
    return true;
  } catch {
    // A partial clear must not erase the only exportable copy, including unsaved changes.
    cache = previousActive;
    personalCache = previousPersonal;
    persistenceStatus = "unavailable";
    notify();
    return false;
  }
}
