const DEFAULT_MAX_ENTRIES = 500;

/**
 * Minimal in-memory TTL cache. Not shared across processes and not persisted —
 * it exists to spare repeated calls to rate-limited third-party APIs within a
 * single server lifetime. Eviction is insertion-order (oldest key first) once
 * `maxEntries` is reached. A non-positive `ttlMs` disables expiry.
 */
export const createTtlCache = ({ ttlMs, maxEntries = DEFAULT_MAX_ENTRIES }) => {
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
