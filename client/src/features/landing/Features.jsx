import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';

const MiniVote = ({ reduceMotion }) => {
  const [leadFirst, setLeadFirst] = useState(true);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const id = window.setInterval(() => setLeadFirst((value) => !value), 2800);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const rows = leadFirst
    ? [
        { id: 'ramen', label: 'Friday ramen', score: '+7', lead: true },
        { id: 'tacos', label: 'Taco crawl', score: '+4', lead: false },
      ]
    : [
        { id: 'tacos', label: 'Taco crawl', score: '+6', lead: true },
        { id: 'ramen', label: 'Friday ramen', score: '+5', lead: false },
      ];

  return (
    <div className="w-full max-w-xs space-y-2">
      {rows.map((row) => (
        <motion.div
          key={row.id}
          layout
          transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 32 }}
          className={`flex items-center justify-between rounded-btn border px-3 py-2 ${
            row.lead ? 'border-accent-secondary bg-surface-2' : 'border-border bg-surface'
          }`}
        >
          <span className="font-sans text-sm text-text-primary">{row.label}</span>
          <span className="font-mono text-sm text-accent-secondary">{row.score}</span>
        </motion.div>
      ))}
    </div>
  );
};

const MiniMap = ({ reduceMotion }) => (
  <div className="relative h-36 w-full max-w-xs overflow-hidden rounded-btn border border-border bg-surface-2">
    <svg viewBox="0 0 240 144" className="h-full w-full text-border" aria-hidden="true">
      <path d="M0 48h240M0 96h240M40 0v144M120 0v144M190 0v144" fill="none" stroke="currentColor" />
      <path d="M20 110c40-20 70 10 120-8 30-12 60 6 90-4" fill="none" className="text-text-muted/40" stroke="currentColor" />
    </svg>
    <motion.span
      className="absolute left-[28%] top-[38%] h-3 w-3 rounded-full bg-accent"
      animate={reduceMotion ? undefined : { scale: [1, 1.25, 1] }}
      transition={reduceMotion ? undefined : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.span
      className="absolute left-[62%] top-[58%] h-3 w-3 rounded-full bg-accent-secondary"
      animate={reduceMotion ? undefined : { scale: [1, 1.2, 1] }}
      transition={
        reduceMotion ? undefined : { duration: 2.4, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }
      }
    />
    <motion.span
      className="absolute left-[48%] top-[26%] h-3 w-3 rounded-full bg-accent/70"
      animate={reduceMotion ? undefined : { scale: [1, 1.15, 1] }}
      transition={
        reduceMotion ? undefined : { duration: 2.6, delay: 0.8, repeat: Infinity, ease: 'easeInOut' }
      }
    />
    {/* Current location ring */}
    <motion.span
      className="absolute left-[28%] top-[38%] h-3 w-3 rounded-full border border-accent/50"
      animate={reduceMotion ? undefined : { scale: [1, 2.2], opacity: [0.6, 0] }}
      transition={
        reduceMotion ? undefined : { duration: 2, repeat: Infinity, ease: 'easeOut' }
      }
    />
    <div className="absolute inset-x-0 bottom-0 px-3 py-1.5">
      <span className="font-sans text-[10px] text-text-muted/60">4 spots on the map</span>
    </div>
  </div>
);

const MiniDates = () => {
  const days = [
    { d: 'Fri', n: 4, bar: 'h-12 bg-accent/40', best: false },
    { d: 'Sat', n: 6, bar: 'h-[4.5rem] bg-accent', best: true },
    { d: 'Sun', n: 3, bar: 'h-9 bg-accent/40', best: false },
    { d: 'Mon', n: 1, bar: 'h-3 bg-accent/40', best: false },
  ];

  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <div className="flex gap-3">
        {days.map((day) => (
          <div key={day.d} className="flex flex-1 flex-col items-center gap-2">
            <span className="font-sans text-xs text-text-muted">{day.d}</span>
            <div className="flex h-20 w-full items-end rounded-btn bg-background">
              <div className={`w-full rounded-btn ${day.bar}`} />
            </div>
            <span className="font-mono text-xs text-text-primary">{day.n}</span>
          </div>
        ))}
      </div>
      <p className="text-center font-sans text-xs text-accent-secondary">Best day: Sat</p>
    </div>
  );
};

const MiniLock = ({ reduceMotion }) => (
  <div className="relative w-full max-w-xs overflow-hidden rounded-btn border border-accent-secondary bg-surface-2 px-4 py-3">
    <p className="flex items-center gap-1.5 font-sans text-xs text-accent-secondary">
      <Check className="h-3.5 w-3.5" />
      Locked
    </p>
    <p className="mt-1 font-heading text-lg font-semibold text-text-primary">Friday ramen</p>
    <p className="mt-1 font-sans text-sm text-text-muted">8pm · walkable</p>
    {/* Celebration particles */}
    {!reduceMotion && (
      <div aria-hidden="true">
        {[
          { x: '20%', y: '15%', color: 'bg-accent', delay: 0 },
          { x: '75%', y: '10%', color: 'bg-accent-secondary', delay: 0.1 },
          { x: '60%', y: '80%', color: 'bg-accent', delay: 0.2 },
          { x: '85%', y: '50%', color: 'bg-accent-secondary', delay: 0.15 },
        ].map((p) => (
          <motion.span
            key={`${p.x}-${p.y}`}
            className={`absolute h-1.5 w-1.5 rounded-full ${p.color}`}
            style={{ left: p.x, top: p.y }}
            initial={{ scale: 0, opacity: 1 }}
            whileInView={{ scale: [0, 1.8, 0], opacity: [1, 0.8, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 + p.delay, ease: 'easeOut' }}
          />
        ))}
      </div>
    )}
  </div>
);

const ROWS = [
  {
    title: 'Votes that re-rank as they land',
    copy: 'Likes and passes score live. The lead is obvious — not buried in emoji.',
    Demo: MiniVote,
  },
  {
    title: 'A map, not a pile of dropped pins in chat',
    copy: 'Options sit on a shared map. Share your own pin only if you want to.',
    Demo: MiniMap,
  },
  {
    title: 'Dates people can actually see',
    copy: 'Mark free or busy. The grid updates for everyone as it happens.',
    Demo: MiniDates,
  },
  {
    title: 'You lock it. It is decided.',
    copy: 'When the signal is in, the owner calls it. One record. No maybes.',
    Demo: MiniLock,
  },
];

const Features = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section id="features" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          className="pt-14 sm:pt-20"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-sans text-sm text-text-muted">What is on the board</p>
          <h2 className="mt-3 max-w-lg font-heading text-2xl font-semibold text-text-primary sm:text-3xl">
            Everything the group needs. Nothing it does not.
          </h2>
        </motion.div>

        {ROWS.map((row, index) => {
          const Demo = row.Demo;
          const reverse = index % 2 === 1;

          return (
            <motion.article
              key={row.title}
              className={`grid gap-8 border-b border-border py-14 md:grid-cols-2 md:items-center md:gap-16 md:py-20 ${
                reverse ? 'md:[&>div:first-child]:order-2' : ''
              }`}
              initial={reduceMotion ? false : { opacity: 0, filter: 'blur(10px)', scale: 0.98 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            >
              <div>
                <h2 className="font-heading text-2xl font-semibold text-text-primary sm:text-3xl">
                  {row.title}
                </h2>
                <p className="mt-3 max-w-md font-sans text-base leading-relaxed text-text-muted">
                  {row.copy}
                </p>
              </div>
              <div className={reverse ? 'md:justify-self-start' : 'md:justify-self-end'}>
                <div className="rounded-card bg-surface p-4">
                  <Demo reduceMotion={reduceMotion} />
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};

export default Features;
