# MVP verification — 2026-11-15

103 automated tests across seven files passed. TypeScript and production build passed. Independent core and whole-product reviewers' critical/important findings were fixed and independently re-reviewed; no critical/important issues remained in those reviewed changes. Finite tests and reviews are not a certification of real-world safety.

Browser verification used synthetic records on an isolated localhost origin:

| Flow | Observed result |
| --- | --- |
| Landing page | Explanatory home page first; room controls change contextual problem link |
| Known sink issue | Relevant answers produce limited curated steps; no dollars added |
| Fire description | Emergency stop; no repair guide or repair action |
| Unknown refrigerator symptom | Clarification, no invented sink repair |
| Personal setup | Apartment/equipment selection persists and changes task applicability |
| Repair confirmation | Quote180/spend20 produces160 only after explicit confirmation; survives reload |
| Maintenance | Monthly completion schedules next calendar month; calendar and status filters work |
| Learning | Incorrect first instinct gets explanation; wrong transfer answer gives no award; correct new scenario awards one skill without changing money or repair count; persists |
| Sample home | Clearly marked and separate; returning restores personal record |
| Export while in demo | Download contains personal home and its confirmed record, not sample history |
| Assistant follow-up | Active emergency remains a safety stop on the next message |
| Mobile | 390px layout and navigation checked; no page overflow on inspected main/maintenance screens |

Data deletion failure and corruption were verified against controlled storage implementations in automated tests. No real household information, paid model calls or public publishing were used for QA.

Important limits: deterministic guided library, no image analysis, no account/payment/backend household sync, no background notifications. Local persistence is not a backup; conversation is in memory. Schedules and estimates are educational starting points.
