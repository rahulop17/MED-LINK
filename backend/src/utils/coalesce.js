/** In-flight promise map: identical keys share one execution. */
const inflight = new Map()

/**
 * Coalesce concurrent calls with the same key onto a single promise.
 * Useful for double-clicks / parallel like toggles on a viral post.
 */
export function coalesce(key, fn) {
  const existing = inflight.get(key)
  if (existing) return existing

  const promise = Promise.resolve()
    .then(fn)
    .finally(() => {
      if (inflight.get(key) === promise) {
        inflight.delete(key)
      }
    })

  inflight.set(key, promise)
  return promise
}
