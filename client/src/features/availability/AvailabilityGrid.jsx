import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronDown, Check, X, Loader2 } from 'lucide-react';
import { setAvailability } from '../../services/availability';
import { upsertAvailability, removeAvailability } from '../../store/boardSlice';
import aggregateAvailability from '../../utils/aggregateAvailability';

const DAYS_COUNT = 30;

const buildDateRange = () => {
  const dates = [];
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < DAYS_COUNT; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
};

const isToday = (dateStr) => {
  const now = new Date();
  const today = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  return dateStr === today;
};

const formatDate = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = d.getUTCDate();
  return { weekday, month, day };
};

const DayRow = ({ dateStr, aggregated, myStatus, onToggle, pending }) => {
  const [expanded, setExpanded] = useState(false);
  const { weekday, month, day } = formatDate(dateStr);
  const agg = aggregated[dateStr];

  const freeNames = agg?.free ?? [];
  const busyNames = agg?.busy ?? [];
  const freeCount = agg?.freeCount ?? 0;
  const totalCount = agg?.totalCount ?? 0;

  return (
    <div className="border-b border-border last:border-b-0">
      <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs text-text-muted">
              {weekday}
            </span>
            <span className="font-sans text-sm font-medium text-text-primary">
              {month} {day}
            </span>
            {isToday(dateStr) && (
              <span className="rounded-btn bg-accent/15 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-accent">
                Today
              </span>
            )}
          </div>

          {totalCount > 0 ? (
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="font-mono text-xs text-success">
                {freeCount}
              </span>
              <span className="font-sans text-xs text-text-muted">
                / {totalCount} free
              </span>
            </div>
          ) : (
            <p className="mt-0.5 font-sans text-xs text-text-muted">
              No availability set
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onToggle(dateStr)}
          disabled={pending === dateStr}
          aria-label={
            myStatus === 'free'
              ? `Mark busy on ${month} ${day}`
              : `Mark free on ${month} ${day}`
          }
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-btn border transition-colors duration-150 ${
            pending === dateStr
              ? 'cursor-wait border-border opacity-50'
              : myStatus === 'free'
                ? 'border-success/50 bg-success/10 text-success hover:bg-success/20'
                : myStatus === 'busy'
                  ? 'border-error/50 bg-error/10 text-error hover:bg-error/20'
                  : 'border-border text-text-muted hover:border-accent/50 hover:text-text-primary'
          }`}
        >
          {pending === dateStr ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : myStatus === 'free' ? (
            <Check className="h-4 w-4" />
          ) : myStatus === 'busy' ? (
            <X className="h-4 w-4" />
          ) : (
            <span className="font-mono text-xs">+</span>
          )}
        </button>

        {totalCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-btn text-text-muted transition-colors duration-150 hover:text-text-primary"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>

      {expanded && totalCount > 0 && (
        <div className="border-t border-border bg-surface-2/50 px-4 py-3">
          {freeNames.length > 0 && (
            <div className="mb-2">
              <span className="font-sans text-xs font-semibold text-success">
                Free
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {freeNames.map((name) => (
                  <span
                    key={name}
                    className="rounded-btn bg-success/10 px-2 py-0.5 font-sans text-xs text-success"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {busyNames.length > 0 && (
            <div>
              <span className="font-sans text-xs font-semibold text-error">
                Busy
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {busyNames.map((name) => (
                  <span
                    key={name}
                    className="rounded-btn bg-error/10 px-2 py-0.5 font-sans text-xs text-error"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AvailabilityGrid = ({ boardId }) => {
  const dispatch = useDispatch();
  const availability = useSelector((state) => state.board.availability);
  const participants = useSelector((state) => state.board.participants);
  const myId = useSelector((state) => state.session?.id);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);

  const dates = useMemo(() => buildDateRange(), []);

  const aggregated = useMemo(
    () => aggregateAvailability(availability, participants),
    [availability, participants],
  );

  const mySlots = useMemo(() => {
    const map = {};
    for (const slot of availability) {
      if (slot.participantId === myId) {
        const key = new Date(slot.date).toISOString().slice(0, 10);
        map[key] = slot.status;
      }
    }
    return map;
  }, [availability, myId]);

  const handleToggle = async (dateStr) => {
    if (pending) return;

    const currentStatus = mySlots[dateStr];
    let nextStatus;
    if (currentStatus === 'free') {
      nextStatus = 'busy';
    } else if (currentStatus === 'busy') {
      nextStatus = 'free';
    } else {
      nextStatus = 'free';
    }

    const snapshot = currentStatus ?? null;

    dispatch(upsertAvailability({ participantId: myId, date: dateStr, status: nextStatus }));
    setPending(dateStr);
    setError(null);

    try {
      const { slot } = await setAvailability(boardId, dateStr, nextStatus);
      dispatch(upsertAvailability({ participantId: slot.participantId, date: slot.date, status: slot.status }));
    } catch {
      if (snapshot) {
        dispatch(upsertAvailability({ participantId: myId, date: dateStr, status: snapshot }));
      } else {
        dispatch(removeAvailability({ participantId: myId, date: dateStr }));
      }
      setError(dateStr);
      setTimeout(() => setError(null), 2500);
    } finally {
      setPending(null);
    }
  };

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Availability
        </h2>
        <span className="font-mono text-sm text-text-muted">
          {participants.length} participant{participants.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div className="mb-3 rounded-btn border border-error/30 bg-error/10 px-3 py-2 font-sans text-xs text-error">
          Couldn&apos;t update — try again
        </div>
      )}

      <div className="rounded-card border border-border bg-surface overflow-hidden">
        {dates.map((dateStr) => (
          <DayRow
            key={dateStr}
            dateStr={dateStr}
            aggregated={aggregated}
            myStatus={mySlots[dateStr] ?? null}
            onToggle={handleToggle}
            pending={pending}
          />
        ))}
      </div>
    </section>
  );
};

export default AvailabilityGrid;
