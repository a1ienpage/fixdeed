import { z } from "zod";

export const QuoteSchema = z.object({
  id: z.string().min(1).max(100),
  contractor: z.string().trim().min(1).max(100),
  amount: z.number().finite().min(0).max(1_000_000),
  scope: z.string().trim().min(1).max(1000),
  exclusions: z.string().max(1000),
  warranty: z.string().max(500),
});
export type ContractorQuote = z.infer<typeof QuoteSchema>;
export const CaseSnapshotSchema = z.object({
  title: z.string().min(1).max(300),
  summary: z.string().max(3000),
  safetyTier: z.enum(["DIY_SAFE", "DIY_CAUTION", "PRO_REQUIRED", "EMERGENCY"]),
  canDiy: z.boolean(),
  steps: z.array(z.string().max(2000)).max(30),
  questions: z.array(z.string().max(1000)).max(15),
});
export const DecisionCaseSchema = z
  .object({
    id: z.string().min(1).max(100),
    title: z.string().trim().min(1).max(160),
    observations: z.string().trim().min(1).max(8000),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    status: z.enum(["open", "professional", "resolved"]),
    note: z.string().max(2000),
    snapshot: CaseSnapshotSchema,
    quotes: z.array(QuoteSchema).max(5),
  })
  .superRefine((item, ctx) => {
    if (new Set(item.quotes.map((q) => q.id)).size !== item.quotes.length)
      ctx.addIssue({ code: "custom", message: "Quote IDs must be unique." });
  });
export type DecisionCase = z.infer<typeof DecisionCaseSchema>;
export type CaseSnapshot = z.infer<typeof CaseSnapshotSchema>;

export function compareQuotes(quotes: ContractorQuote[]) {
  const amounts = quotes.map((q) => q.amount);
  const lowest = amounts.length ? Math.min(...amounts) : null;
  const highest = amounts.length ? Math.max(...amounts) : null;
  return {
    lowest,
    highest,
    spread: lowest !== null && highest !== null ? highest - lowest : 0,
    warning:
      "Compare the scope and exclusions before choosing. The lowest amount does not establish equivalent work or the best provider.",
    missingDetails: quotes.flatMap((q) => [
      ...(!q.exclusions.trim()
        ? [`${q.contractor}: exclusions not recorded`]
        : []),
      ...(!q.warranty.trim() ? [`${q.contractor}: warranty not recorded`] : []),
    ]),
  };
}
export function buildContractorBrief(item: DecisionCase): string {
  return [
    "FIXDEED — HOMEOWNER OBSERVATION BRIEF",
    item.title,
    "",
    `Recorded: ${item.createdAt}`,
    `Status: ${item.status}`,
    "",
    "Original observations",
    item.observations,
    "",
    "Guided result at the time of the check",
    item.snapshot.title,
    item.snapshot.summary,
    `Triage category: ${item.snapshot.safetyTier}`,
    "",
    "This record is educational guidance, not an inspection or professional diagnosis. Conditions may have changed. Recheck current symptoms before taking action.",
    "",
    "Questions to discuss with the professional",
    ...new Set([
      ...item.snapshot.questions,
      "What caused the issue, and which work is included?",
      "Are parts, labor, permits, cleanup and warranty included?",
      "What remains excluded, and what could change the price?",
    ]),
    "",
    "Homeowner follow-up note",
    item.note || "None recorded.",
    "",
    "Quotes entered by the homeowner",
    ...item.quotes.map(
      (q) =>
        `${q.contractor}: $${q.amount.toFixed(2)}\nScope: ${q.scope}\nExclusions: ${q.exclusions || "Not recorded"}\nWarranty: ${q.warranty || "Not recorded"}`,
    ),
    "",
    "Quotes have not been verified or normalized for equivalent scope. No savings or completed repair are inferred. This file is downloaded locally and is not sent to a contractor.",
    "",
  ].join("\n");
}
