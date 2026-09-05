import { motion, useReducedMotion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import LiveBoardPreview from './LiveBoardPreview';
import StartBoardButton from './StartBoardButton';

const Hero = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12 lg:pt-14">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
        {/* Left Column: Value Proposition & CTA */}
        <div className="flex flex-col lg:col-span-6 xl:col-span-5">
          {/* Eyebrow badge */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex w-fit items-center gap-2 rounded-btn border border-border bg-surface px-3 py-1.5"
          >
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="font-sans text-xs font-medium text-text-muted">
              No account required to vote
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-heading text-4xl font-bold leading-[1.08] text-text-primary sm:text-5xl xl:text-6xl"
          >
            Stop deciding in group chats.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 font-heading text-lg font-semibold text-accent sm:text-xl"
          >
            One board. Everyone votes. You decide.
          </motion.p>

          {/* Value pitch paragraph */}
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-sans text-base leading-relaxed text-text-muted sm:text-lg"
          >
            One shared link. People vote, drop pins, and mark when they&apos;re free — live. You lock it when the call is obvious.
          </motion.p>

          {/* Action CTA row */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
          >
            <StartBoardButton className="px-6 py-3 text-base shadow-lg shadow-accent/15" />
            <div className="flex items-center gap-1.5 font-sans text-xs text-text-muted">
              <Zap className="h-3.5 w-3.5 text-accent-secondary" />
              <span>Ready in 10 seconds</span>
            </div>
          </motion.div>

          {/* Trust badges strip */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-wrap gap-2 pt-2 border-t border-border/60"
          >
            {[
              '0 sign-ups to vote',
              '1 link for the group',
              'Real-time live sync',
            ].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-btn bg-surface-2 px-2.5 py-1 font-sans text-xs text-text-muted"
              >
                <Check className="h-3 w-3 text-success" />
                {tag}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right Column: Dedicated Interactive Preview Slot */}
        <div className="w-full lg:col-span-6 xl:col-span-7">
          {/* Preview slot: LiveBoardPreview today; <video> or Remotion later. Keep this wrapper. */}
          <motion.div
            className="hero-preview relative w-full"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 140, damping: 20, mass: 0.9, delay: 0.2 }
            }
          >
            {/* Ambient warm glow behind preview */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 rounded-card bg-accent/10 blur-2xl sm:-inset-8"
            />
            <div className="relative">
              <LiveBoardPreview />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
