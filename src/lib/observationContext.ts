/** Extract only explicit supported observations. Unknown facts stay unanswered. */
export function inferObservationContext(text: string): {
  presetId?: string;
  answers: Record<string, string>;
} {
  const t = text.toLowerCase().replace(/\s+/g, " ");
  const answers: Record<string, string> = {};
  let presetId: string | undefined;
  if (/\bsink\b/.test(t) && /\b(?:leak\w*|drip\w*)\b/.test(t)) {
    presetId = "sink-leaking";
    if (/\b(?:continuously|constantly|overnight)\b|\b(?:even|while|when)\b.{0,25}\b(?:off|unused)\b/.test(t)) answers.timing = "constantly";
    else if (/\bonly\s+(?:when|while)\b.{0,45}\b(?:run\w*|drain\w*|empt\w*)\b/.test(t)) answers.timing = "when_running";
    if (/\b(?:crust\w*|corrod\w*|stiff)\b/.test(t)) answers.valve_type = "crusty_oval";
    else if (/\bclean\b.{0,35}\b(?:quarter[ -]turn|1\/4[ -]turn)\b|\b(?:quarter[ -]turn|1\/4[ -]turn)\b.{0,35}\bclean\b/.test(t)) answers.valve_type = "quarter_lever";
  } else if (/\btoilet\b/.test(t)) {
    presetId = "toilet-wont-flush";
    if (/\b(?:base|floor)\b.{0,35}\b(?:wet|water|leak\w*)\b|\b(?:water|leak\w*)\b.{0,35}\b(?:base|floor)\b/.test(t)) answers.symptom = "water_rising_base";
    else if (/\b(?:refill\w*|hiss\w*|runs constantly)\b/.test(t)) answers.symptom = "runs_constantly";
    else if (/\b(?:loose handle|chain.{0,15}(?:unhooked|detached)|flapper.{0,15}(?:not|doesn't|won't) lift)\b/.test(t)) answers.symptom = "loose_handle";
  } else if (/\b(?:ac|hvac|air condition\w*)\b/.test(t)) {
    presetId = "ac-not-cooling";
    if (/\b(?:ice|frost|frozen)\b/.test(t.replace(/\b(?:no|without)\s+(?:visible\s+)?(?:ice|frost)\b/g,""))) answers.symptom = "ice_frost";
    else if (/\b(?:weak|poor)\s+airflow\b|\b(?:dirty|dusty)\b.{0,20}\bfilter\b/.test(t) && /\b(?:no|without)\s+(?:visible\s+)?(?:ice|frost)\b/.test(t)) answers.symptom = "filter_only";
  } else if (/\b(?:interior door|door)\b/.test(t)) {
    presetId = "door-wont-close";
    if (/\b(?:swollen|swelling)\b.{0,25}\b(?:all|evenly)\b/.test(t)) answers.location = "all_around";
    else if (/\b(?:rubs?|rubbing|sticks?)\b.{0,25}\btop\b/.test(t)) answers.location = "top_rub";
  }
  return { presetId, answers };
}
