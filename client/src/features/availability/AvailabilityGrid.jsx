import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Check, ChevronLeft, ChevronRight, Loader2, Trash2, X } from 'lucide-react';
import { clearAvailability, setAvailability } from '../../services/availability';
import { upsertAvailability, removeAvailability } from '../../store/boardSlice';
import aggregateAvailability from '../../utils/aggregateAvailability';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (value) => String(value).padStart(2, '0');
const toDateKey = (year, monthIndex, day) => `${year}-${pad(monthIndex + 1)}-${pad(day)}`;

const todayKey = () => {
  const now = new Date();
  return toDateKey(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
};

const startOfMonth = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const addMonths = (date, delta) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta, 1));

const formatMonthTitle = (month) =>
  month.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const formatDayTitle = (dateKey) =>
  new Date(`${dateKey}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

const buildMonthCells = (month) => {
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();
  const leadingBlanks = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  const cells = [];
  for (let i = 0; i < leadingBlanks; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, dateKey: toDateKey(year, monthIndex, day) });
  }
  return cells;
};

const DayCell = ({
  day,
  dateKey,
  aggregated,
  myStatus,
  isToday,
  isPast,
  isSelected,
  isPending,
  onDayClick,
}) => {
  const agg = aggregated[dateKey];
  const freeCount = agg?.freeCount ?? 0;
  const totalCount = agg?.totalCount ?? 0;

  const statusClasses = isPast
    ? 'border-transparent text-text-muted/30'
    : myStatus === 'free'
      ? 'border-success/50 bg-success/10'
      : myStatus === 'busy'
        ? 'border-error/50 bg-error/10'
        : 'border-border bg-surface-2/40 hover:border-accent/40';

  const label = [
    formatDayTitle(dateKey),
    myStatus ? `you are ${myStatus}` : null,
    totalCount > 0 ? `${freeCount} of ${totalCount} free` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <button
      type="button"
      onClick={() => onDayClick(dateKey)}
      disabled={isPast}
      aria-pressed={myStatus === 'free'}
      aria-label={label}
      className={`relative flex h-12 flex-col items-center justify-center rounded-btn border transition-colors duration-150 ${statusClasses} ${
        isSelected && !isPast ? 'ring-1 ring-accent' : ''
      }`}
    >
      {isPending ? (
        <Loader2 className="absolute right-1 top-1 h-2.5 w-2.5 animate-spin text-text-muted" />
      ) : (
        myStatus && (
          <span
            className={`absolute right-1 top-1 ${
              myStatus === 'free' ? 'text-success' : 'text-error'
            }`}
          >
            {myStatus === 'free' ? (
              <Check className="h-2.5 w-2.5" />
            ) : (
              <X className="h-2.5 w-2.5" />
            )}
          </span>
        )
      )}

      <span
        className={`font-sans text-sm font-medium ${
          isToday ? 'text-accent' : isPast ? '' : 'text-text-primary'
        }`}
      >
        {day}
      </span>

      {totalCount > 0 && (
        <span className="font-mono text-[10px] text-text-muted">
          {freeCount}/{totalCount}
        </span>
      )}

      {isToday && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />}
    </button>
  );
};

const AvailabilityGrid = ({ boardId }) => {
  const dispatch = useDispatch();
  const availability = useSelector((state) => state.board.availability);
  const participants = useSelector((state) => state.board.participants);
  const myId = useSelector((state) => state.session?.id);

  const currentMonth = useMemo(() => startOfMonth(new Date()), []);
  const today = useMemo(() => todayKey(), []);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState(today);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);

  const cells = useMemo(() => buildMonthCells(viewMonth), [viewMonth]);

  const aggregated = useMemo(
    () => aggregateAvailability(availability, participants),
    [availability, participants],
  );

  const mySlots = useMemo(() => {
    const map = {};
    for (const slot of availability) {
      if (slot.participantId === myId) {
        map[new Date(slot.date).toISOString().slice(0, 10)] = slot.status;
      }
    }
    return map;
  }, [availability, myId]);

  const isCurrentMonth = viewMonth.getTime() === currentMonth.getTime();
  const selectedStatus = mySlots[selectedDate];
  const isSelectedPending = pending === selectedDate;
  const selectedAgg = aggregated[selectedDate];
  const selectedFree = selectedAgg?.free ?? [];
  const selectedBusy = selectedAgg?.busy ?? [];

  const goToMonth = (delta) => {
    const next = addMonths(viewMonth, delta);
    if (next < currentMonth) return;

    setViewMonth(next);
    setSelectedDate(
      next.getTime() === currentMonth.getTime()
        ? today
        : toDateKey(next.getUTCFullYear(), next.getUTCMonth(), 1),
    );
  };

  const handleToggle = async (dateKey) => {
    if (pending) return;

    const currentStatus = mySlots[dateKey];
    const nextStatus = currentStatus === 'free' ? 'busy' : 'free';
    const snapshot = currentStatus ?? null;

    dispatch(upsertAvailability({ participantId: myId, date: dateKey, status: nextStatus }));
    setPending(dateKey);
    setError(null);

    try {
      const { slot } = await setAvailability(boardId, dateKey, nextStatus);
      dispatch(upsertAvailability({ participantId: slot.participantId, date: slot.date, status: slot.status }));
    } catch {
      if (snapshot) {
        dispatch(upsertAvailability({ participantId: myId, date: dateKey, status: snapshot }));
      } else {
        dispatch(removeAvailability({ participantId: myId, date: dateKey }));
      }
      setError(dateKey);
      setTimeout(() => setError(null), 2500);
    } finally {
      setPending(null);
    }
  };

  const handleDayClick = (dateKey) => {
    setSelectedDate(dateKey);
    handleToggle(dateKey);
  };

  const handleClear = async (dateKey) => {
    if (pending) return;

    const snapshot = mySlots[dateKey];
    if (!snapshot) return;

    dispatch(removeAvailability({ participantId: myId, date: dateKey }));
    setPending(dateKey);
    setError(null);

    try {
      await clearAvailability(boardId, dateKey);
    } catch {
      dispatch(upsertAvailability({ participantId: myId, date: dateKey, status: snapshot }));
      setError(dateKey);
      setTimeout(() => setError(null), 2500);
    } finally {
      setPending(null);
    }
  };

  return (
    <section aria-label="Availability">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-sans text-sm text-text-muted">
          Tap a day to mark your availability
        </p>
        <span className="font-mono text-xs text-text-muted">
          {participants.length} participant{participants.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div className="mb-3 rounded-btn border border-error/30 bg-error/10 px-3 py-2 font-sans text-xs text-error">
          Couldn&apos;t update — try again
        </div>
      )}

      <div className="rounded-card border border-border bg-surface p-3 sm:p-4">
        <div className="mb-3 grid grid-cols-3 items-center">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            disabled={isCurrentMonth}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center justify-self-start rounded-btn text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text-primary disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <h3 className="text-center font-heading text-sm font-semibold text-text-primary sm:text-base">
            {formatMonthTitle(viewMonth)}
          </h3>

          <button
            type="button"
            onClick={() => goToMonth(1)}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center justify-self-end rounded-btn text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 pb-1">
          {WEEKDAYS.map((label) => (
            <span
              key={label}
              className="text-center font-sans text-[10px] font-medium text-text-muted"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, index) =>
            cell ? (
              <DayCell
                key={cell.dateKey}
                day={cell.day}
                dateKey={cell.dateKey}
                aggregated={aggregated}
                myStatus={mySlots[cell.dateKey] ?? null}
                isToday={cell.dateKey === today}
                isPast={cell.dateKey < today}
                isSelected={cell.dateKey === selectedDate}
                isPending={pending === cell.dateKey}
                onDayClick={handleDayClick}
              />
            ) : (
              <span key={`blank-${index}`} aria-hidden="true" />
            ),
          )}
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h4 className="font-heading text-sm font-semibold text-text-primary">
                {formatDayTitle(selectedDate)}
              </h4>
              {selectedDate === today && (
                <span className="rounded-btn bg-accent/15 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-accent">
                  Today
                </span>
              )}
            </div>

            {selectedAgg && selectedAgg.totalCount > 0 && (
              <span className="font-mono text-xs text-text-muted">
                <span className="text-success">{selectedAgg.freeCount}</span> /{' '}
                {selectedAgg.totalCount} free
              </span>
            )}
          </div>

          {selectedFree.length > 0 || selectedBusy.length > 0 ? (
            <div className="mt-3 space-y-2">
              {selectedFree.length > 0 && (
                <div>
                  <span className="font-sans text-xs font-semibold text-success">Free</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {selectedFree.map((name) => (
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

              {selectedBusy.length > 0 && (
                <div>
                  <span className="font-sans text-xs font-semibold text-error">Busy</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {selectedBusy.map((name) => (
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
          ) : (
            <p className="mt-3 font-sans text-xs text-text-muted">
              No availability set for this day yet.
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => handleToggle(selectedDate)}
              disabled={Boolean(pending)}
              className={`flex w-full items-center justify-center gap-2 rounded-btn border px-4 py-2.5 font-sans text-sm font-semibold transition-colors duration-200 disabled:opacity-60 sm:w-auto ${
                selectedStatus === 'free'
                  ? 'border-error/50 bg-error/10 text-error hover:bg-error/20'
                  : 'border-success/50 bg-success/10 text-success hover:bg-success/20'
              }`}
            >
              {isSelectedPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : selectedStatus === 'free' ? (
                <X className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {selectedStatus === 'free' ? 'Mark busy' : 'Mark free'}
            </button>

            {selectedStatus && (
              <button
                type="button"
                onClick={() => handleClear(selectedDate)}
                disabled={Boolean(pending)}
                className="flex w-full items-center justify-center gap-2 rounded-btn border border-border px-4 py-2.5 font-sans text-sm font-medium text-text-muted transition-colors duration-200 hover:border-error/50 hover:text-error disabled:opacity-60 sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AvailabilityGrid;
