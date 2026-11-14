import { describe, expect, it } from "vitest";
import { scanText } from "@/lib/safetyGate";
import { diagnoseDeterministic } from "@/lib/diagnosticEngine";
import { POST as assistant } from "@/app/api/assistant/route";

describe("reported observations retain context", () => {
  it.each([
    "My sink leaks when draining. There is no smoke and no fire.",
    "My sink leaks. There is no smoke or fire.",
    "My sink leaks. There is no gas smell.",
    "The smoke detector is not going off. My sink leaks.",
  ])(
    "does not turn an explicitly absent hazard into an emergency: %s",
    (text) => {
      expect(scanText(text).tier).not.toBe("EMERGENCY");
    },
  );
  it.each([
    "No smoke, but I smell gas.",
    "No gas smell but the outlet is sparking.",
    "I am not sure whether there is smoke.",
    "There is no fire yet, but smoke is coming from the outlet.",
    "I cannot rule out a gas leak.",
    "No gas smell and smoke is filling the room.",
    "No smoke, fire is spreading",
    "There was no smoke until now",
    "No gas smell, I think",
    "Maybe the CO alarm is not sounding",
    "No smoke here, but there is in the kitchen",
  ])("preserves a positive or uncertain hazard: %s", (text) => {
    expect(scanText(text).tier).toBe("EMERGENCY");
  });
  it("uses explicit sink observations without treating its wall valve as a wall problem", () => {
    const result = diagnoseDeterministic({
      symptomText:
        "Water drips under my sink only when the faucet runs. The wall shutoff valve has a clean quarter-turn lever.",
    });
    expect(result.canDiy).toBe(true);
    expect(result.recommendedGuideSlug).toBe("sink-leaking");
    expect(result.clarifyingQuestions).toEqual([]);
  });
  it("never lets inferred low-risk answers override an explicit risky answer", () => {
    const result = diagnoseDeterministic({
      presetId: "sink-leaking",
      symptomText:
        "My sink leaks only when draining. The valve is a clean quarter-turn lever.",
      answers: { timing: "constantly", valve_type: "quarter_lever" },
    });
    expect(result.safetyTier).toBe("PRO_REQUIRED");
  });
  it("advances the assistant after a direct answer to its question", async () => {
    const response = await assistant(
      new Request("http://localhost/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:
            "Only while draining. The valve is a clean quarter-turn lever.",
          history: [{ role: "user", text: "My sink is leaking." }],
        }),
      }),
    );
    const { reply } = await response.json();
    expect(reply.canDiy).toBe(true);
    expect(reply.recommendedGuideSlug).toBe("sink-leaking");
    expect(reply.clarifyingQuestions).toEqual([]);
    expect(reply.steps).toHaveLength(3);
    expect(reply.detectedPresetId).toBe("sink-leaking");
  });
  it("retains an actual prior emergency even after absent hazards in a follow-up", async () => {
    const response = await assistant(
      new Request("http://localhost/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "There is no smoke now. Just help with the sink.",
          safetyFloor: "EMERGENCY",
          history: [{ role: "user", text: "Smoke is coming from an outlet." }],
        }),
      }),
    );
    expect((await response.json()).reply.safetyTier).toBe("EMERGENCY");
  });
});
it.each([
  "My sink leaks, but not only when draining. I cannot confirm the valve is a clean quarter-turn lever.",
  "My toilet doesn't have a loose handle.",
  "My door does not rub the top.",
])("does not approve a negated or unconfirmed symptom: %s", (symptomText) => {
  expect(diagnoseDeterministic({ symptomText }).canDiy).toBe(false);
});
it("preserves a reported deteriorated valve against a reassuring selection", () => {
  expect(
    diagnoseDeterministic({
      presetId: "sink-leaking",
      symptomText: "My sink leaks only when draining; the valve is corroded",
      answers: { timing: "when_running", valve_type: "quarter_lever" },
    }).safetyTier,
  ).toBe("PRO_REQUIRED");
});
it("escalates an outdoor AC fan symptom ahead of weak-airflow guidance", () => {
  expect(
    diagnoseDeterministic({
      symptomText:
        "My AC has weak airflow and no ice. The outdoor unit buzzes but the fan won't spin.",
    }).canDiy,
  ).toBe(false);
});
it("advances the washer starter after the hose observation", async () => {
  const response = await assistant(
    new Request("http://localhost/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "The hose is kinked behind the washing machine",
        history: [{ role: "user", text: "My washer has stopped draining" }],
      }),
    }),
  );
  const { reply } = await response.json();
  expect(reply.detectedPresetId).toBe("washer-not-draining");
  expect(reply.clarifyingQuestions).toEqual([]);
});
