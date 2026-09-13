const aggregateAvailability = (rawList, participants) => {
  const nameMap = new Map(
    participants.map((p) => [p.id, p.displayName]),
  );

  const byDate = new Map();

  for (const slot of rawList) {
    const dateKey = new Date(slot.date).toISOString().slice(0, 10);
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, { free: [], busy: [] });
    }

    const entry = byDate.get(dateKey);
    const name = nameMap.get(slot.participantId) ?? 'Unknown';
    if (slot.status === 'free') {
      entry.free.push(name);
    } else {
      entry.busy.push(name);
    }
  }

  const result = {};
  for (const [dateKey, { free, busy }] of byDate) {
    result[dateKey] = {
      free,
      busy,
      freeCount: free.length,
      totalCount: free.length + busy.length,
    };
  }

  return result;
};

export default aggregateAvailability;
