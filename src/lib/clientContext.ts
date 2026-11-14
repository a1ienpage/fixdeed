import { deriveHomeEra, type HomeProfile } from "./homeStore";
/** Only construction-era context is used by guided triage. Never transmit notes. */
export function getTriageContext(
  profile: HomeProfile,
): Pick<HomeProfile, "yearBuilt" | "homeEra"> {
  return {
    yearBuilt: profile.yearBuilt,
    homeEra: deriveHomeEra(profile.yearBuilt),
  };
}
