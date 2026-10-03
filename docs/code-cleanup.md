# Client code cleanup

This review compares the client animations and portfolio filter with `77aa23d`,
the touch Hero implementation. Changes address observed maintenance problems;
they preserve visible EN/ES content, layout, DOM contracts, CSP and canonical PDFs.
This is a scoped cleanup, not a claim that the repository has no remaining debt.

## Removed complexity and fixed lifecycle problems

| Finding                                                                                                 | Result                                                                                                                                                                                                                                                                                | Evidence                                                                            |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 18 optional settings had no production or test consumers                                                | Removed six selector/class overrides from the portfolio filter, five overrides from typed roles, three from the Hero renderer, and two each from counters and quotes. Three unused options interfaces disappeared. Settings actually used by tests or the quote pause control remain. | `src/scripts/{portfolio-filter,typed-text,hero-backdrop,counters,quote-rotator}.ts` |
| Load and the first-paint deadline could both queue canvas work; cleanup left the load listener attached | A small Hero-specific scheduler arbitrates one paint and cancels its deadline, load listener and idle callback.                                                                                                                                                                       | `src/scripts/hero-first-paint.ts`, `hero-first-paint.test.ts`                       |
| Canvas heat state was reset in three separate blocks                                                    | One reset clears glyph heat, pending pointer samples and scheduled frames, preventing stale state after rebuilding or changing motion preferences.                                                                                                                                    | `src/scripts/hero-backdrop.ts`                                                      |
| Reveal observers and three window listeners remained active after their work ended                      | Return immediately when nothing needs revealing; disconnect and remove listeners after the final reveal. The fast-scroll safety net remains.                                                                                                                                          | `src/scripts/scroll-reveal.ts`, `scroll-reveal.test.ts`                             |
| Quotes used one flag for pointer hover and keyboard focus                                               | Track both pause causes independently, including focus moving between controls inside the card.                                                                                                                                                                                       | `src/scripts/quote-rotator.ts`, `quote-rotator.test.ts`                             |
| Quote JSON was cast directly to its desired type; cancelled fades could leave text hidden               | Validate entries at the JSON boundary and restore the card's visibility on cleanup. Reduced motion returns before allocating timers/listeners.                                                                                                                                        | `src/scripts/quote-rotator.ts`, `quote-rotator.test.ts`                             |
| Portfolio categories were split on every click; counters duplicated the locale mapping                  | Parse static categories once and use the existing locale helpers.                                                                                                                                                                                                                     | `src/scripts/portfolio-filter.ts`, `counters.ts`                                    |

## Measurements

- Removed 18 unused optional settings and three speculative options interfaces.
- Production source in the six changed modules plus the new paint scheduler:
  1,136 lines before, 1,117 after (19 fewer, including comments and blank lines).
- The canvas module drops from 738 to 688 lines; its load/idle scheduling has a
  separate, tested responsibility. The scheduler is included in the total above.
- Added 22 regression cases: unit tests increase from 114 to 136. Tests cover
  deadline/load ordering, disposal, independent pause causes, invalid payloads,
  reveal completion, fast scrolling and the existing typewriter cadence.

Line count is a size measurement, not a quality score. The main reduction is the
number of unsupported configuration paths and duplicated lifecycle decisions.
No dependency or general-purpose framework was added.

## Validation and limits

Before committing, run check, lint, format:check, unit tests, build, browser tests,
both Lighthouse budgets, npm audit and the report-privacy check. Build precedes
browser QA. Reports, traces and generated output stay ignored and local.

Windows Chromium covers touch emulation, accessibility, geometry and behavior.
GitHub CI provides the Linux comparison against the existing reference images
with zero differing pixels. Do not regenerate those references for this cleanup.
These checks do not replace a review on physical iOS/Android devices.

The desktop canvas remains a stateful renderer with spatial indexing and dirty
rectangle painting. Keep those measured performance mechanisms; replacing them
with an abstraction or a smaller but continuously repainting loop would add risk.
Unused configuration is removed only after searching all current consumers.
Content, dependency forks and publication controls are outside this cleanup.
