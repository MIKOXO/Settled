import { motion, useReducedMotion } from 'framer-motion';

const STATS = [
  { accent: '0', rest: 'accounts needed' },
  { accent: '1 link', rest: 'for the whole group' },
  { accent: 'Owner', rest: 'locks the decision' },
];

const StatStrip = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-y border-border">
      <motion.div
        className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-6"
        initial={reduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.8 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
        }}
      >
        {STATS.map((stat, index) => (
          <motion.div key={stat.accent} className="flex items-center" variants={{
            hidden: { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
            visible: { clipPath: 'inset(0 0 0% 0)', opacity: 1 },
          }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
            {index > 0 && (
              <span className="mr-6 hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
            )}
            <p className={`font-sans text-sm text-text-muted ${index > 0 ? 'sm:ml-6' : ''}`}>
              <span className="font-mono text-accent">{stat.accent}</span>{' '}
              {stat.rest}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default StatStrip;
