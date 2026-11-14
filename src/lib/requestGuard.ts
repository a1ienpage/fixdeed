/** A result loses authority whenever input changes, even if abort is ignored. */
export function createRequestGuard() {
  let active: AbortController | null = null;
  function invalidate() {
    active?.abort();
    active = null;
  }
  return {
    invalidate,
    start() {
      invalidate();
      const controller = new AbortController();
      active = controller;
      return {
        signal: controller.signal,
        isCurrent: () => active === controller && !controller.signal.aborted,
      };
    },
  };
}
