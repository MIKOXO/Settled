import { motion, useReducedMotion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Calendar, ListFilter, MapPin } from 'lucide-react';

const TABS = [
  { id: 'options', label: 'Options', icon: ListFilter },
  { id: 'dates', label: 'Dates', icon: Calendar },
  { id: 'map', label: 'Map', icon: MapPin },
];

const BoardTabs = ({ active, onChange }) => {
  const reduceMotion = useReducedMotion();
  const optionCount = useSelector((state) => state.board.options.length);
  const myFreeDays = useSelector(
    (state) =>
      state.board.availability.filter(
        (slot) => slot.participantId === state.session?.id && slot.status === 'free',
      ).length,
  );
  const locationCount = useSelector(
    (state) =>
      state.board.optionLocations.length + state.board.participantLocations.length,
  );

  const counts = { options: optionCount, dates: myFreeDays, map: locationCount };

  return (
    <div
      role="tablist"
      aria-label="Board sections"
      className="sticky top-14 z-40 border-b border-border bg-background/90 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          const count = counts[tab.id];

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`relative flex shrink-0 items-center gap-2 rounded-btn px-3 py-3 font-sans text-sm transition-colors duration-200 ${
                isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-accent' : ''}`} />
              {tab.label}
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
                    isActive ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-text-muted'
                  }`}
                >
                  {count}
                </span>
              )}
              {isActive && (
                <motion.span
                  layoutId="boardActiveTab"
                  className="absolute inset-x-2 bottom-0 h-0.5 bg-accent"
                  transition={reduceMotion ? { duration: 0 } : undefined}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BoardTabs;
