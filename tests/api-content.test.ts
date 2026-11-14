import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as assistant } from "@/app/api/assistant/route";
import { POST as diagnose } from "@/app/api/diagnose/route";
import { PREVENTIVE_TASKS } from "@/content/preventive";
import { GUIDES } from "@/content/guides";
import { getTransferCase } from "@/content/practice";

const request = (path: string, body: unknown) =>
  new Request("http://localhost/api/" + path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
afterEach(() => vi.unstubAllEnvs());

describe("bounded deterministic API", () => {
  it("asks for context for photo-only diagnosis without claiming image verification", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const res = await diagnose(
      request("diagnose", { image: "data:image/png;base64,YQ==" }),
    );
    const { result } = await res.json();
    expect(result.canDiy).toBe(false);
    expect(result.steps).toEqual([]);
    expect(result.recommendedGuideSlug).toBeNull();
    expect(result.diagnosisTitle).not.toMatch(/verified/i);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
  it.each(["user", "assistant"])(
    "preserves unresolved emergency in prior %s history",
    async (role) => {
      vi.stubEnv("GEMINI_API_KEY", "");
      const res = await assistant(
        request("assistant", {
          message: "It looks fine now. What tools do I need?",
          history: [{ role, text: "The outlet is on fire" }],
        }),
      );
      const { reply } = await res.json();
      expect(reply.canDiy).toBe(false);
      expect(reply.safetyTier).toBe("EMERGENCY");
      expect(reply.recommendedGuideSlug).toBeNull();
    },
  );
  it("uses nonhazard user history for ordinary follow-ups", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const res = await assistant(
      request("assistant", {
        message: "What tools do I need?",
        history: [
          { role: "user", text: "My sink leaks only when faucet runs" },
        ],
      }),
    );
    const { reply } = await res.json();
    expect(reply.clarifyingQuestions.join(" ")).toMatch(/valve|handle/i);
    expect(reply.replyText).not.toMatch(/refrigerator/i);
    expect(reply.canDiy).toBe(false);
  });
  it("does not turn a generic assistant warning into an active emergency", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const res = await assistant(
      request("assistant", {
        message: "My sink leaks",
        history: [
          {
            role: "assistant",
            text: "If there is gas smell or a CO alarm, leave and call emergency services.",
          },
        ],
      }),
    );
    const { reply } = await res.json();
    expect(reply.safetyTier).not.toBe("EMERGENCY");
  });
  it.each([diagnose, assistant])(
    "rejects malformed and excessive input with no-store",
    async (handler) => {
      vi.stubEnv("GEMINI_API_KEY", "");
      const malformed = await handler(
        new Request("http://localhost/api/test", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{",
        }),
      );
      expect(malformed.status).toBe(400);
      expect(malformed.headers.get("cache-control")).toBe("no-store");
      const tooLarge = await handler(
        request("test", {
          message: "x".repeat(100000),
          symptomText: "x".repeat(100000),
        }),
      );
      expect(tooLarge.status).toBe(413);
    },
  );
});

describe("conservative maintenance content and learning transfer", () => {
  it("uses manufacturer-compatible filter instructions and ground-level gutter checks", () => {
    const filter = PREVENTIVE_TASKS.find((t) => t.id === "prev_hvac_filter")!;
    expect(filter.quickSteps.join(" ")).toMatch(/manufacturer/i);
    expect(filter.quickSteps.join(" ")).not.toMatch(/MERV 8|MERV 11|MERV 8–11/);
    const gutter = PREVENTIVE_TASKS.find(
      (t) => t.id === "prev_gutter_downspout",
    )!;
    expect(gutter.quickSteps.join(" ")).toMatch(/ground/i);
    expect(gutter.quickSteps.join(" ")).not.toMatch(
      /from a .*ladder|climb|scoop/,
    );
    expect(
      PREVENTIVE_TASKS.find(
        (t) => t.id === "prev_water_heater_annual",
      )!.quickSteps.join(" "),
    ).not.toMatch(/attach.*hose|drain 2|pilot/i);
    expect(
      GUIDES.find((g) => g.slug === "water-heater-check")!.safetyTier,
    ).toBe("PRO_REQUIRED");
  });
  it("has a distinct transferable scenario for every guide", () => {
    expect(new Set(GUIDES.map((g) => getTransferCase(g.slug).id)).size).toBe(
      12,
    );
    for (const guide of GUIDES) {
      const c = getTransferCase(guide.slug);
      expect(c.options.length).toBeGreaterThan(1);
      expect(c.options.some((o) => o.id === c.correctId)).toBe(true);
      expect(guide.quiz.some((q) => q.prompt === c.prompt)).toBe(false);
    }
    expect(getTransferCase("unknown").options).toEqual([]);
  });
});

it("keeps service-panel work and pressurized component replacement out of direct guide instructions", () => {
  expect(
    GUIDES.find((g) => g.slug === "dead-gfci-outlet")!.steps.join(" "),
  ).not.toMatch(/open.*panel|flip.*off.*on|feel.*faceplate/i);
  expect(
    GUIDES.find((g) => g.slug === "toilet-wont-flush")!.steps.join(" "),
  ).not.toMatch(/swap.*fill valve|replace.*fill valve/i);
  expect(
    GUIDES.find((g) => g.slug === "dripping-faucet")!.steps.join(" "),
  ).not.toMatch(/unscrew.*cartridge|pull.*cartridge|remove.*cartridge/i);
});

it("varies the correct transfer option position across the guide set", () => {
  const positions = new Set(
    GUIDES.map((g) => {
      const c = getTransferCase(g.slug);
      return c.options.findIndex((o) => o.id === c.correctId);
    }),
  );
  expect(positions.size).toBeGreaterThan(1);
});

it("teaches a unique fixture-specific baseline before each distinct transfer scenario", () => {
  const prompts = GUIDES.map((guide) => guide.quiz[0].prompt);
  expect(new Set(prompts).size).toBe(12);
  const positions = new Set<number>();
  for (const guide of GUIDES) {
    const baseline = guide.quiz[0];
    const transfer = getTransferCase(guide.slug);
    expect(baseline.prompt).not.toBe(transfer.prompt);
    expect(
      baseline.options.some((option) => option.id === baseline.correctId),
    ).toBe(true);
    positions.add(
      baseline.options.findIndex((option) => option.id === baseline.correctId),
    );
  }
  expect(positions.size).toBe(2);
});

it("credits quarterly exterior dryer observation separately from each-load screen care", () => {
  const task = PREVENTIVE_TASKS.find((task) => task.id === "prev_dryer_lint")!;
  expect(task.cadence).toBe("Every 3 Months");
  expect(task.requiresAppliances).toContain("washer_dryer");
  expect(task.title).toMatch(/exterior.*vent|vent.*exterior/i);
  expect(task.title).not.toMatch(/clean.*screen/i);
  expect(task.quickSteps[0]).toMatch(/ground/i);
  expect(task.quickSteps.join(" ")).not.toMatch(/remove lint|clean.*screen/i);
  expect(task.whyItMatters).toMatch(/each load/i);
  expect(task.whyItMatters).toMatch(/separate|not.*quarter/i);
});
