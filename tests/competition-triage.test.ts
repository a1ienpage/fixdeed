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
