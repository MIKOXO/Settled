const TIME_STEPS = [
  { unit: 'year', ms: 365 * 24 * 3600 * 1000 },
  { unit: 'month', ms: 30 * 24 * 3600 * 1000 },
  { unit: 'week', ms: 7 * 24 * 3600 * 1000 },
  { unit: 'day', ms: 24 * 3600 * 1000 },
  { unit: 'hour', ms: 3600 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
];

const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** "3 minutes ago", "yesterday" — one helper, since both thread depths stamp rows. */
export default function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60 * 1000) return 'just now';
  const step = TIME_STEPS.find((s) => diff >= s.ms);
  if (!step) return '';
  return formatter.format(-Math.round(diff / step.ms), step.unit);
}
