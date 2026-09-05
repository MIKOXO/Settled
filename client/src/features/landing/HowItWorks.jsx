import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const STEPS = [
  {
    n: '01',
    title: 'Send a link',
    summary: 'Zero signup required',
    copy: 'Name the board and copy the invite. That is the whole start. Anyone with the link can weigh in instantly without creating an account or downloading an app.',
    tag: 'settled.app/b/dinner-402',
    accent: 'accent',
  },
  {
    n: '02',
    title: 'Watch it move',
    summary: 'Instant live updates',
    copy: 'Votes, pins, and free/busy land live on everyone’s screen. Nobody refreshes. Options automatically re-rank in real time as the group signals what they want.',
    tag: 'Real-time sync · 0s delay',
    accent: 'accent',
  },
  {
    n: '03',
    title: 'Lock it in',
    summary: 'One source of truth',
    copy: 'When the signal is clear, the owner calls it. The board becomes the permanent, indisputable record. No confusion, no second-guessing in the chat.',
    tag: 'Final decision locked',
    accent: 'accent-secondary',
  },
];

const HowItWorks = () => {
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText('https://settled.app/b/dinner-402');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="how-it-works" className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      {/* Section Header */}
      <div className="max-w-2xl">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-xs font-semibold tracking-wider text-accent uppercase"
        >
          How it works
        </motion.p>

        <motion.h2
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl"
        >
          Three steps from &lsquo;should we?&rsquo; to settled.
        </motion.h2>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 font-sans text-base leading-relaxed text-text-muted sm:text-lg"
        >
          No signup friction. No scattered messages. Just clear momentum towards a final call.
        </motion.p>
      </div>

      {/* Desktop Horizontal Process Pipeline (No cards, No icon containers) */}
      <div className="relative mt-16 sm:mt-20">
        {/* Connecting Horizontal Line (Desktop) */}
        <div className="hidden md:block">
          <div className="absolute top-3 left-6 right-6 h-px bg-border/80" />
          <motion.div
            className="absolute top-3 left-6 right-6 h-px bg-gradient-to-r from-accent via-accent to-accent-secondary origin-left"
            initial={reduceMotion ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 lg:gap-12">
          {STEPS.map((step, index) => {
            const isLast = index === STEPS.length - 1;

            return (
              <motion.div
                key={step.n}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.55,
                  delay: reduceMotion ? 0 : 0.1 + index * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative flex flex-col justify-between"
              >
                <div>
                  {/* Step Top Anchor: Node dot + Numeral */}
                  <div className="flex items-center justify-between">
                    {/* Track Node Indicator */}
                    <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-border bg-background transition-colors duration-300 group-hover:border-accent">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isLast ? 'bg-accent-secondary' : 'bg-accent'
                        }`}
                      />
                    </div>

                    {/* Prominent Serif/Mono Step Numeral */}
                    <span className="font-mono text-3xl font-bold tracking-tight text-text-muted/30 transition-colors duration-300 group-hover:text-text-primary sm:text-4xl">
                      {step.n}
                    </span>
                  </div>

                  {/* Step Title & Subtitle */}
                  <div className="mt-6">
                    <h3 className="font-heading text-xl font-bold text-text-primary sm:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-1 font-sans text-xs font-medium text-accent">
                      {step.summary}
                    </p>
                  </div>

                  {/* Step Detailed Narrative Copy */}
                  <p className="mt-3 font-sans text-sm leading-relaxed text-text-muted sm:text-base">
                    {step.copy}
                  </p>
                </div>

                {/* Bottom Contextual Tag / Micro-Interaction */}
                <div className="mt-6 pt-4 border-t border-border/50">
                  {index === 0 && (
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-2 font-mono text-xs text-text-muted transition-colors hover:text-accent"
                    >
                      <span className="text-accent">→</span>
                      <span className="underline underline-offset-4 decoration-border">
                        {step.tag}
                      </span>
                      <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-primary">
                        {copied ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  )}

                  {index === 1 && (
                    <div className="inline-flex items-center gap-2 font-mono text-xs text-text-muted">
                      <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                      <span>{step.tag}</span>
                    </div>
                  )}

                  {index === 2 && (
                    <div className="inline-flex items-center gap-2 font-mono text-xs text-accent-secondary">
                      <span>✓</span>
                      <span>{step.tag}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
