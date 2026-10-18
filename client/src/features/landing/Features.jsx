import { Fragment, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  X,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Calendar,
  Lock,
  Sparkles,
  TrendingUp,
  Search,
  Users,
  ShieldCheck,
  Clock,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Demo 1: MiniVote - Live Re-ranking Voting Demo                            */
/* -------------------------------------------------------------------------- */
const MiniVote = ({ reduceMotion }) => {
  const [leadFirst, setLeadFirst] = useState(true);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const id = window.setInterval(() => setLeadFirst((value) => !value), 3200);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const items = leadFirst
    ? [
        {
          id: 'ramen',
          label: 'Ippudo Tonkotsu Ramen',
          likes: 9,
          dislikes: 1,
          score: '+8',
          lead: true,
          voter: 'Alex + 7 others',
        },
        {
          id: 'tacos',
          label: 'Los Tacos No. 1',
          likes: 6,
          dislikes: 2,
          score: '+4',
          lead: false,
          voter: 'Sarah + 4 others',
        },
      ]
    : [
        {
          id: 'tacos',
          label: 'Los Tacos No. 1',
          likes: 10,
          dislikes: 1,
          score: '+9',
          lead: true,
          voter: 'Sarah + 8 others',
        },
        {
          id: 'ramen',
          label: 'Ippudo Tonkotsu Ramen',
          likes: 8,
          dislikes: 2,
          score: '+6',
          lead: false,
          voter: 'Alex + 6 others',
        },
      ];

  return (
    <div className="w-full space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-text-muted">
            Live Leaderboard
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Live Sync
        </span>
      </div>

      {/* Re-ranking rows */}
      <div className="space-y-2.5">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 350, damping: 28 }
            }
            className={`relative flex flex-col gap-2 rounded-btn p-3.5 transition-colors ${
              item.lead
                ? 'bg-surface-2 shadow-sm'
                : 'bg-surface/50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-sans text-sm font-semibold text-text-primary truncate">
                    {item.label}
                  </span>
                  {item.lead && (
                    <span className="inline-flex items-center gap-1 rounded-btn bg-accent-secondary/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-accent-secondary">
                      <Sparkles className="h-2.5 w-2.5" />
                      Leading
                    </span>
                  )}
                </div>
                <span className="font-sans text-xs text-text-muted">
                  Voted by {item.voter}
                </span>
              </div>

              {/* Score pill */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 rounded-btn bg-background px-2.5 py-1">
                  <ThumbsUp className="h-3 w-3 text-accent" />
                  <span className="font-mono text-xs font-bold text-accent">
                    {item.likes}
                  </span>
                </div>
                <div className="flex items-center gap-1 rounded-btn bg-background px-2.5 py-1">
                  <ThumbsDown className="h-3 w-3 text-text-muted/60" />
                  <span className="font-mono text-xs font-medium text-text-muted">
                    {item.dislikes}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Demo 2: MiniMap - Interactive Shared Map Demo                              */
/* -------------------------------------------------------------------------- */
const MiniMap = ({ reduceMotion }) => (
  <div className="w-full space-y-3">
    {/* Map Header */}
    <div className="flex items-center justify-between pb-2.5">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-accent" />
        <span className="font-sans text-xs font-semibold uppercase tracking-wider text-text-muted">
          Shared Map Overview
        </span>
      </div>
      <div className="flex items-center gap-1 text-[11px] font-medium text-text-muted">
        <Search className="h-3 w-3 text-accent-secondary" />
        <span>Nominatim Search</span>
      </div>
    </div>

    {/* Map graphic canvas */}
    <div className="relative h-44 w-full overflow-hidden rounded-btn bg-surface-2">
      {/* Dark vector map SVG background */}
      <svg
        viewBox="0 0 320 176"
        className="h-full w-full opacity-30 text-text-muted/30"
        aria-hidden="true"
      >
        <path
          d="M0 32h320M0 88h320M0 144h320M60 0v176M160 0v176M260 0v176"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
        {/* Curved River / Road */}
        <path
          d="M 10 160 C 90 120, 130 90, 210 50 C 260 20, 290 10, 310 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>

      {/* Option Pin 1 - Ramen Spot */}
      <div className="absolute left-[22%] top-[30%] -translate-x-1/2 -translate-y-1/2">
        <div className="relative group">
          <motion.div
            className="flex items-center gap-1.5 rounded-btn bg-surface px-2 py-1 shadow-sm"
            animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="font-sans text-[11px] font-semibold text-text-primary">
              Ippudo Ramen
            </span>
          </motion.div>
        </div>
      </div>

      {/* Option Pin 2 - Taco Spot */}
      <div className="absolute left-[68%] top-[55%] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="flex items-center gap-1.5 rounded-btn bg-surface px-2 py-1 shadow-sm"
          animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
          transition={{ duration: 3.2, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="h-2 w-2 rounded-full bg-accent-secondary" />
          <span className="font-sans text-[11px] font-semibold text-text-primary">
            Los Tacos
          </span>
        </motion.div>
      </div>

      {/* Opt-in Participant Location Pin */}
      <div className="absolute left-[42%] top-[68%] -translate-x-1/2 -translate-y-1/2">
        <div className="relative flex flex-col items-center">
          {/* Pulse ring */}
          <motion.span
            className="absolute inset-0 rounded-full bg-success/20"
            animate={reduceMotion ? undefined : { scale: [1, 2.4], opacity: [0.8, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          />
          <div className="z-10 flex items-center gap-1 rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-medium text-success">
            <Users className="h-2.5 w-2.5" />
            <span>Alex (You)</span>
          </div>
        </div>
      </div>

      {/* Footer info pill overlay */}
      <div className="absolute inset-x-2 bottom-2 flex items-center justify-between rounded-btn bg-background/90 backdrop-blur-md px-3 py-1.5 text-[11px]">
        <span className="font-sans text-text-muted">2 options dropped</span>
        <span className="font-sans text-success font-medium flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          1 participant sharing
        </span>
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Demo 3: MiniDates - Availability Heatmap Matrix Demo                         */
/* -------------------------------------------------------------------------- */
/* One row per person, one column per date — the same shape the real Dates tab   */
/* renders, so the landing illustration is a preview rather than a metaphor.     */
const AVAILABILITY_DAYS = [
  { id: 'thu', dow: 'Thu', date: 'Oct 12', full: 'Thursday, Oct 12' },
  { id: 'fri', dow: 'Fri', date: 'Oct 13', full: 'Friday, Oct 13' },
  { id: 'sat', dow: 'Sat', date: 'Oct 14', full: 'Saturday, Oct 14' },
  { id: 'sun', dow: 'Sun', date: 'Oct 15', full: 'Sunday, Oct 15' },
];

const AVAILABILITY_PEOPLE = [
  { id: 'alex', name: 'Alex', initials: 'AL', cells: { thu: 'free', fri: 'free', sat: 'free', sun: 'free' } },
  { id: 'sarah', name: 'Sarah', initials: 'SR', cells: { thu: 'free', fri: 'busy', sat: 'free', sun: 'free' } },
  { id: 'james', name: 'James', initials: 'JM', cells: { thu: null, fri: 'free', sat: 'free', sun: 'busy' } },
  { id: 'dani', name: 'Dani', initials: 'DT', cells: { thu: 'busy', fri: 'busy', sat: 'free', sun: 'free' } },
  { id: 'kai', name: 'Kai', initials: 'KW', cells: { thu: 'free', fri: null, sat: 'free', sun: 'busy' } },
];

// Counts and the winning day are derived from the matrix above, never hand-typed,
// so the columns can never disagree with the cells they summarize.
const AVAILABILITY_TOTAL = AVAILABILITY_PEOPLE.length;
const AVAILABILITY_TALLY = AVAILABILITY_DAYS.map((day) => ({
  ...day,
  free: AVAILABILITY_PEOPLE.filter((person) => person.cells[day.id] === 'free').length,
}));
const AVAILABILITY_BEST = AVAILABILITY_TALLY.reduce((top, day) =>
  day.free > top.free ? day : top
);

const AvailabilityCell = ({ status, isBest, delay, reduceMotion }) => {
  // The winning column swaps its "free" tone for mustard — the same treatment the
  // leading option gets, so the best date reads at a glance instead of by counting.
  const tone =
    status === 'free'
      ? isBest
        ? 'border-accent-secondary/40 bg-accent-secondary/20 text-accent-secondary'
        : 'border-success/30 bg-success/15 text-success'
      : status === 'busy'
        ? 'border-error/30 bg-error/15 text-error'
        : 'border-border bg-background text-text-muted/40';

  return (
    <motion.span
      aria-hidden="true"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.22, delay, ease: 'easeOut' }}
      className={`flex h-8 items-center justify-center rounded-btn border sm:h-9 ${tone}`}
    >
      {status === 'free' ? (
        <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      ) : status === 'busy' ? (
        <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      ) : (
        <span className="h-px w-3 rounded-full bg-current" />
      )}
    </motion.span>
  );
};

const MiniDates = ({ reduceMotion }) => (
  <div className="w-full space-y-3.5">
    {/* Header */}
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pb-2.5">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-accent" />
        <span className="font-sans text-xs font-semibold text-text-muted">
          Group availability
        </span>
      </div>
      <div className="flex items-center gap-3 font-sans text-[11px] text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[4px] border border-success/30 bg-success/15" />
          Free
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[4px] border border-error/30 bg-error/15" />
          Busy
        </span>
        <span className="font-mono text-text-primary">{AVAILABILITY_TOTAL} joined</span>
      </div>
    </div>

    {/* Matrix */}
    <div className="grid grid-cols-[5.25rem_repeat(4,minmax(0,1fr))] items-center gap-x-1.5 gap-y-1.5 sm:grid-cols-[7.5rem_repeat(4,minmax(0,1fr))] sm:gap-x-2 sm:gap-y-2">
      {/* Day header row */}
      <span className="truncate font-sans text-[10px] text-text-muted">People</span>
      {AVAILABILITY_TALLY.map((day) => {
        const isBest = day.id === AVAILABILITY_BEST.id;
        return (
          <div
            key={day.id}
            className={`flex flex-col items-center gap-0.5 rounded-btn py-1 ${
              isBest ? 'bg-accent-secondary/10' : ''
            }`}
          >
            <span
              className={`font-sans text-[11px] font-semibold sm:text-xs ${
                isBest ? 'text-accent-secondary' : 'text-text-primary'
              }`}
            >
              {day.dow}
            </span>
            <span className="font-mono text-[10px] text-text-muted">{day.date}</span>
            {isBest && (
              <span className="mt-0.5 h-0.5 w-4 rounded-full bg-accent-secondary" />
            )}
          </div>
        );
      })}

      {/* Participant rows */}
      {AVAILABILITY_PEOPLE.map((person, rowIndex) => (
        <Fragment key={person.id}>
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-[9px] font-semibold text-text-muted">
              {person.initials}
            </span>
            <span className="truncate font-sans text-[11px] font-medium text-text-primary">
              {person.name}
            </span>
          </div>
          {AVAILABILITY_TALLY.map((day, dayIndex) => (
            <AvailabilityCell
              key={day.id}
              status={person.cells[day.id]}
              isBest={day.id === AVAILABILITY_BEST.id}
              delay={0.025 * (rowIndex * AVAILABILITY_TALLY.length + dayIndex)}
              reduceMotion={reduceMotion}
            />
          ))}
        </Fragment>
      ))}

      {/* Summary row */}
      <span className="border-t border-border pt-2 font-sans text-[11px] font-medium text-text-muted">
        Free
      </span>
      {AVAILABILITY_TALLY.map((day) => {
        const isBest = day.id === AVAILABILITY_BEST.id;
        return (
          <div
            key={day.id}
            className="flex items-center justify-center border-t border-border py-2"
          >
            <span className="font-mono text-xs">
              <span
                className={`font-bold ${
                  isBest ? 'text-accent-secondary' : 'text-text-primary'
                }`}
              >
                {day.free}
              </span>
              <span className="text-text-muted">/{AVAILABILITY_TOTAL}</span>
            </span>
          </div>
        );
      })}
    </div>

    {/* Resolution callout */}
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center justify-between gap-3 rounded-btn border border-accent-secondary/25 bg-accent-secondary/10 px-3 py-2.5"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <motion.span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-secondary/15 text-accent-secondary"
          animate={reduceMotion ? undefined : { scale: [1, 1.12, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="h-3.5 w-3.5" />
        </motion.span>
        <p className="font-sans text-xs leading-snug">
          <span className="font-semibold text-text-primary">
            {AVAILABILITY_BEST.full}
          </span>
          <span className="text-text-muted">
            {' '}
            ·{' '}
            {AVAILABILITY_BEST.free === AVAILABILITY_TOTAL
              ? 'everyone is free'
              : `${AVAILABILITY_BEST.free} of ${AVAILABILITY_TOTAL} free`}
          </span>
        </p>
      </div>
      <span className="shrink-0 rounded-btn bg-accent-secondary/15 px-2 py-0.5 font-sans text-[10px] font-semibold text-accent-secondary">
        Best date
      </span>
    </motion.div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Demo 4: MiniLock - Decision Lock-in Demo                                   */
/* -------------------------------------------------------------------------- */
const MiniLock = ({ reduceMotion }) => (
  <div className="w-full space-y-3">
    {/* Header */}
    <div className="flex items-center justify-between pb-2.5">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-accent-secondary" />
        <span className="font-sans text-xs font-semibold uppercase tracking-wider text-text-muted">
          Official Decision
        </span>
      </div>
      <span className="inline-flex items-center gap-1 rounded-full bg-accent-secondary/15 px-2 py-0.5 text-[11px] font-bold text-accent-secondary">
        <ShieldCheck className="h-3 w-3" />
        Owner Locked
      </span>
    </div>

    {/* Locked Card */}
    <div className="relative overflow-hidden rounded-btn bg-surface-2 p-4 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-btn bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
            <Check className="h-3.5 w-3.5" />
            <span>It&apos;s Settled!</span>
          </div>
          <h4 className="font-heading text-lg font-bold text-text-primary pt-1">
            Ippudo Tonkotsu Ramen
          </h4>
          <div className="flex flex-wrap items-center gap-3 pt-1 font-sans text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-accent" />
              Sat, Oct 14 · 7:30 PM
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-accent-secondary" />
              65 Fourth Ave
            </span>
          </div>
        </div>
      </div>

      {/* Celebration particles */}
      {!reduceMotion && (
        <div aria-hidden="true" className="pointer-events-none">
          {[
            { x: '15%', y: '20%', color: 'bg-accent', delay: 0 },
            { x: '82%', y: '15%', color: 'bg-accent-secondary', delay: 0.1 },
            { x: '65%', y: '75%', color: 'bg-accent', delay: 0.2 },
            { x: '90%', y: '60%', color: 'bg-accent-secondary', delay: 0.15 },
          ].map((p) => (
            <motion.span
              key={`${p.x}-${p.y}`}
              className={`absolute h-2 w-2 rounded-full ${p.color}`}
              style={{ left: p.x, top: p.y }}
              initial={{ scale: 0, opacity: 1 }}
              whileInView={{ scale: [0, 1.8, 0], opacity: [1, 0.8, 0] }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 + p.delay, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Feature Row Specifications                                                */
/* -------------------------------------------------------------------------- */
const ROWS = [
  {
    tag: '01 / REAL-TIME VOTING',
    title: 'Votes that re-rank automatically as they land',
    copy: 'Likes and passes score instantly in real time. The group consensus jumps to the top of the leaderboard in under a second — no manual counting or hidden messages.',
    highlights: ['One reaction per person', 'Instant net score re-ranking', 'Live leading choice indicator'],
    Demo: MiniVote,
  },
  {
    tag: '02 / INTERACTIVE MAP',
    title: 'A shared map, not a pile of dropped addresses in chat',
    copy: 'Plot every proposed option directly on an interactive map using built-in place search. Participants can optionally share their exact pin for effortless meetups.',
    highlights: ['Nominatim place search', 'Option location markers', 'Private opt-in participant pins'],
    Demo: MiniMap,
  },
  {
    tag: '03 / DATE AVAILABILITY',
    title: 'Visual date polling everyone can actually understand',
    copy: 'Stop deciphering conflicting multi-message schedules. Tap to mark free or busy and watch the group availability heatmap pinpoint the best date instantly.',
    highlights: ['One-tap availability grid', 'Group heatmap synthesis', 'Automatic best-date calculation'],
    Demo: MiniDates,
  },
  {
    tag: '04 / DECISION LOCK-IN',
    title: 'You lock it. The plan is settled.',
    copy: 'When signal becomes clear consensus, the board owner locks the decision. Everyone gets the confirmed venue, time, and details without lingering debate.',
    highlights: ['Owner decision lock', 'Single source of truth', 'Inactivity takeover recovery'],
    Demo: MiniLock,
  },
];

/* -------------------------------------------------------------------------- */
/* Main Features Component                                                    */
/* -------------------------------------------------------------------------- */
const Features = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section id="features" className="relative bg-background py-16 sm:py-24">
      {/* Background subtle radial warm highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-accent/5 blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          className="flex flex-col items-start gap-3"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-accent">
            What is on the board
          </span>

          <h2 className="max-w-2xl font-heading text-3xl font-bold leading-tight text-text-primary sm:text-4xl lg:text-5xl">
            Everything your group needs. <br className="hidden sm:inline" />
            <span className="text-accent">Nothing it does not.</span>
          </h2>

          <p className="max-w-xl font-sans text-base leading-relaxed text-text-muted sm:text-lg">
            Purpose-built tools designed to move groups from endless chat threads to locked decisions in minutes.
          </p>
        </motion.div>

        {/* Feature Rows */}
        <div className="mt-12 sm:mt-16 space-y-12 sm:space-y-16">
          {ROWS.map((row, index) => {
            const Demo = row.Demo;

            // SPECIAL CASE: Row 3 (Decision Lock-in) - Spotlight
            if (index === 3) {
              return (
                <motion.article
                  key={row.title}
                  className="relative overflow-hidden rounded-card bg-surface-2 p-8 sm:p-16 text-center shadow-lg"
                  initial={reduceMotion ? false : { opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="mx-auto max-w-2xl">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-accent-secondary">
                      {row.tag}
                    </span>
                    <h3 className="mt-4 font-heading text-3xl font-bold leading-snug text-text-primary sm:text-4xl">
                      {row.title}
                    </h3>
                    <p className="mt-4 font-sans text-lg leading-relaxed text-text-muted">
                      {row.copy}
                    </p>
                    <div className="mt-10 inline-block w-full max-w-sm">
                      <div className="rounded-card bg-surface p-4 sm:p-5 shadow-inner">
                        <Demo reduceMotion={reduceMotion} />
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            }

            // SPECIAL CASE: Row 1 (Map) - Wide / Immersive
            if (index === 1) {
              return (
                <motion.article
                  key={row.title}
                  className="rounded-card bg-surface/50 p-6 sm:p-10 shadow-md"
                  initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="text-center mb-8">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-accent-secondary">
                      {row.tag}
                    </span>
                    <h3 className="mt-2 font-heading text-2xl font-bold text-text-primary sm:text-3xl">
                      {row.title}
                    </h3>
                    <p className="mt-3 max-w-xl mx-auto font-sans text-base text-text-muted">
                      {row.copy}
                    </p>
                  </div>
                  <div className="rounded-card bg-surface p-2 shadow-inner">
                    <Demo reduceMotion={reduceMotion} />
                  </div>
                </motion.article>
              );
            }

            // STANDARD CASES: Rows 0, 2
            const reverse = index === 2; // Row 2 reversed
            const rowBackgrounds = [
              'bg-surface/50', // Index 0
              '', // Index 1 (handled)
              'bg-surface/50', // Index 2
            ];

            return (
              <motion.article
                key={row.title}
                className={`grid items-center gap-8 rounded-card p-6 sm:p-8 lg:grid-cols-12 lg:gap-12 shadow-md ${
                  rowBackgrounds[index]
                } ${reverse ? 'lg:[&>div:first-child]:order-2' : ''}`}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Text Content */}
                <div className="flex flex-col lg:col-span-5">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-accent-secondary">
                    {row.tag}
                  </span>
                  <h3 className="mt-2 font-heading text-2xl font-bold leading-snug text-text-primary sm:text-3xl">
                    {row.title}
                  </h3>
                  <p className="mt-3 font-sans text-base leading-relaxed text-text-muted">
                    {row.copy}
                  </p>
                  <ul className="mt-5 space-y-2 border-t border-text-muted/10 pt-4">
                    {row.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-2 font-sans text-xs text-text-primary">
                        <Check className="h-3.5 w-3.5 text-success shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Demo */}
                <div className="w-full lg:col-span-7">
                  <div className="rounded-card bg-surface p-4 sm:p-5 shadow-inner">
                    <Demo reduceMotion={reduceMotion} />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;