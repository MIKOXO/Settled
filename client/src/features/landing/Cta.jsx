import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cta = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-3xl"
        initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-[40%] top-[45%] h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-secondary/10 blur-3xl"
        initial={reduceMotion ? false : { scale: 0.3, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="relative mx-auto max-w-6xl">
        <motion.h2
          className="max-w-3xl font-heading text-4xl font-bold leading-[1.1] text-text-primary sm:text-5xl lg:text-6xl"
          initial={reduceMotion ? false : { letterSpacing: '0.12em', opacity: 0 }}
          whileInView={{ letterSpacing: '0em', opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
        >
          Make the call.
        </motion.h2>

        <motion.div
          className="mt-6 h-px origin-left bg-accent"
          initial={reduceMotion ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.77, 0, 0.18, 1] }}
        />

        <motion.div
          className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
          initial={reduceMotion ? false : { opacity: 0, clipPath: 'inset(40% 0 0 0)' }}
          whileInView={{ opacity: 1, clipPath: 'inset(0% 0 0 0)' }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, delay: 0.28, ease: [0.65, 0, 0.35, 1] }}
        >
          <p className="max-w-md font-sans text-lg leading-relaxed text-text-muted">
            Start a board. Send the link. Let the group weigh in without making an account.
          </p>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <Link
              to="/create"
              className="group inline-flex items-center gap-2 rounded-btn bg-accent px-6 py-3 font-sans text-base font-semibold text-background transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_20px_rgba(255,107,74,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Start a board
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <p className="font-sans text-sm text-text-muted">Free. No account needed.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Cta;
