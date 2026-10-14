/**
 * In-memory TTL cache. Not shared across processes and not persisted — it exists
 * only to spare repeated calls to rate-limited third-party APIs within one server
 * lifetime. Eviction is insertion-order once `maxEntries` is reached; a
 * non-positive `ttlMs` disables expiry.
 */
export const createTtlCache = ({ ttlMs, maxEntries = 500 }) => {
  const entries = new Map();
  const neverExpires = !(ttlMs > 0);

  return {
    get(key) {
      const entry = entries.get(key);
      if (!entry) return undefined;
      if (!neverExpires && Date.now() - entry.storedAt >= ttlMs) {
        entries.delete(key);
        return undefined;
      }
      return entry.value;
    },

    set(key, value) {
      if (entries.has(key)) {
        entries.delete(key);
      } else if (entries.size >= maxEntries) {
        entries.delete(entries.keys().next().value);
      }
      entries.set(key, { value, storedAt: Date.now() });
      return value;
    },
  };
};