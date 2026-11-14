/** Supported, affirmative observations only. Doubt and negation leave a check unanswered. */
export function inferObservationContext(text: string): {
  presetId?: string;
  answers: Record<string, string>;
} {
  const t = text.toLowerCase().replace(/[’]/g, "'");
  const clauses = t
    .split(/[.!?;\n]+/)
    .map((c) => c.trim())
    .filter(Boolean);
  const doubt =
    /\b(?:not|no|never|cannot|can't|couldn't|doesn't|don't|won't|without|unsure|uncertain|unknown|maybe|might|possibly|probably|think|believe|guess)\b/;
  function affirmed(pattern: RegExp, allowedNegative?: RegExp) {
    return clauses.some(
      (c) =>
        pattern.test(c) &&
        !doubt.test(allowedNegative ? c.replace(allowedNegative, "") : c),
    );
  }
  const answers: Record<string, string> = {};
  let presetId: string | undefined;
  if (/\bsink\b/.test(t) && /\b(?:leak\w*|drip\w*)\b/.test(t)) {
    presetId = "sink-leaking";
    if (
      affirmed(
        /\b(?:continuously|constantly|overnight)\b|\b(?:even|while|when)\b.{0,25}\b(?:off|unused)\b/,
      )
    )
      answers.timing = "constantly";
    else if (
      affirmed(
        /\bonly\s+(?:when|while)\b.{0,45}\b(?:run\w*|drain\w*|empt\w*)\b/,
      )
    )
      answers.timing = "when_running";
    if (
      affirmed(
        /\b(?:valve|shutoff|handle)\b.{0,35}\b(?:crust\w*|corrod\w*|stiff)\b|\b(?:crust\w*|corrod\w*|stiff)\b.{0,35}\b(?:valve|shutoff|handle)\b/,
      )
    )
      answers.valve_type = "crusty_oval";
    else if (
      affirmed(
        /\bclean\b.{0,35}\b(?:quarter[ -]turn|1\/4[ -]turn)\b|\b(?:quarter[ -]turn|1\/4[ -]turn)\b.{0,35}\bclean\b/,
      )
    )
      answers.valve_type = "quarter_lever";
  } else if (/\btoilet\b/.test(t)) {
    presetId = "toilet-wont-flush";
    if (
      affirmed(
        /\b(?:base|floor)\b.{0,35}\b(?:wet|water|leak\w*)\b|\b(?:water|leak\w*)\b.{0,35}\b(?:base|floor)\b/,
      )
    )
      answers.symptom = "water_rising_base";
    else if (affirmed(/\b(?:refill\w*|hiss\w*|runs constantly)\b/))
      answers.symptom = "runs_constantly";
    else if (
      affirmed(
        /\b(?:loose handle|handle.{0,15}loose|chain.{0,15}(?:unhooked|detached))\b/,
      ) ||
      affirmed(
        /\bflapper\b.{0,15}\b(?:does not|doesn't|won't) lift\b/,
        /\b(?:does not|doesn't|won't) lift\b/,
      )
    )
      answers.symptom = "loose_handle";
  } else if (/\b(?:ac|hvac|air condition\w*)\b/.test(t)) {
    presetId = "ac-not-cooling";
    if (
      /\boutdoor\b.{0,30}\bbuzz\w*\b|\bfan\b.{0,20}\b(?:won't|doesn't|does not|not)\b.{0,10}\bspin\b/.test(
        t,
      )
    )
      answers.symptom = "outdoor_buzz";
    else if (
      /\bthermostat\b.{0,20}\bblank\b|\b(?:full|standing water)\b.{0,20}\b(?:pan|drain)\b/.test(
        t,
      )
    )
      answers.symptom = "warm_no_fan";
    else if (
      /\b(?:ice|frost|frozen)\b/.test(
        t.replace(/\b(?:no|without)\s+(?:visible\s+)?(?:ice|frost)\b/g, ""),
      )
    )
      answers.symptom = "ice_frost";
    else if (
      affirmed(
        /\b(?:weak|poor)\s+airflow\b|\b(?:dirty|dusty)\b.{0,20}\bfilter\b/,
        /\b(?:no|without)\s+(?:visible\s+)?(?:ice|frost)\b/g,
      ) &&
      /\b(?:no|without)\s+(?:visible\s+)?(?:ice|frost)\b/.test(t)
    )
      answers.symptom = "filter_only";
  } else if (/\b(?:washer|washing machine)\b/.test(t)) {
    presetId = "washer-not-draining";
    if (
      affirmed(
        /\bhose\b.{0,30}\b(?:kink\w*|pinch\w*)\b|\b(?:kink\w*|pinch\w*)\b.{0,30}\bhose\b/,
      )
    )
      answers.style = "hose_kink";
    else if (
      affirmed(/\bfront[ -]load\w*\b.{0,50}\b(?:standing water|drain error)\b/)
    )
      answers.style = "front_load_err";
  } else if (/\bdoor\b/.test(t)) {
    presetId = "door-wont-close";
    if (affirmed(/\b(?:swollen|swelling)\b.{0,25}\b(?:all|evenly)\b/))
      answers.location = "all_around";
    else if (affirmed(/\b(?:rubs?|rubbing|sticks?)\b.{0,25}\btop\b/))
      answers.location = "top_rub";
  }
  return { presetId, answers };
}
