import { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import {
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  MapPin,
  Calendar,
  ListFilter,
  Check,
  X,
  Navigation,
} from 'lucide-react';

const INITIAL_OPTIONS = [
  { id: 'ramen', title: 'Friday ramen', meta: 'Walkable · 8pm', likes: 5, dislikes: 1, lat: 45, lng: 32, pinLabel: '1' },
  { id: 'tacos', title: 'Taco crawl', meta: 'Three stops · 7pm', likes: 4, dislikes: 1, lat: 68, lng: 64, pinLabel: '2' },
  { id: 'maya', title: "Maya's kitchen", meta: 'Cook together', likes: 3, dislikes: 0, lat: 28, lng: 72, pinLabel: '3' },
  { id: 'wine', title: 'Natural wine bar', meta: 'New on 4th', likes: 2, dislikes: 1, lat: 78, lng: 28, pinLabel: '4' },
];

const VOTE_SCRIPT = [
  { id: 'wine', likes: 1, actor: 'Alex' },
  { id: 'maya', likes: 1, actor: 'Priya' },
  { id: 'wine', likes: 1, actor: 'Sam' },
  { id: 'tacos', likes: 1, actor: 'Jon' },
  { id: 'wine', likes: 1, actor: 'Maya' },
  { id: 'ramen', likes: 1, actor: 'Priya' },
];

const PARTICIPANTS = [
  { initial: 'A', name: 'Alex', color: 'bg-accent/20 text-accent border-accent/40' },
  { initial: 'P', name: 'Priya', color: 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary/40' },
  { initial: 'S', name: 'Sam', color: 'bg-surface-2 text-text-muted border-border' },
  { initial: 'J', name: 'Jon', color: 'bg-surface-2 text-text-muted border-border' },
  { initial: 'M', name: 'Maya', color: 'bg-accent/20 text-accent border-accent/40' },
];

const DATES_DATA = [
  { id: 'fri', label: 'Fri 24', name: 'Friday', freeCount: 4, total: 5 },
  { id: 'sat', label: 'Sat 25', name: 'Saturday', freeCount: 5, total: 5, isBest: true },
  { id: 'sun', label: 'Sun 26', name: 'Sunday', freeCount: 3, total: 5 },
  { id: 'mon', label: 'Mon 27', name: 'Monday', freeCount: 1, total: 5 },
];

const INITIAL_AVAILABILITY = {
  Alex: { fri: true, sat: true, sun: false, mon: false },
  Priya: { fri: true, sat: true, sun: true, mon: false },
  Sam: { fri: false, sat: true, sun: false, mon: false },
  Maya: { fri: true, sat: true, sun: true, mon: false },
  You: { fri: true, sat: true, sun: true, mon: false },
};

const RANK_SPRING = { type: 'spring', stiffness: 440, damping: 32, mass: 0.7 };

const scoreOf = (option) => option.likes - option.dislikes;

const sortOptions = (options) =>
  [...options].sort((a, b) => {
    const diff = scoreOf(b) - scoreOf(a);
    if (diff !== 0) return diff;
    return a.title.localeCompare(b.title);
  });

const applyVote = (options, event) =>
  options.map((option) => {
    if (option.id !== event.id) return option;
    if (event.likes > 0) return { ...option, likes: option.likes + event.likes };
    return { ...option, dislikes: option.dislikes + Math.abs(event.likes) };
  });

const optionById = (options, id) => options.find((option) => option.id === id);

const TABS = [
  { id: 'options', label: 'Options', count: 4, icon: ListFilter },
  { id: 'map', label: 'Map', icon: MapPin },
  { id: 'dates', label: 'Dates', icon: Calendar },
];

// Placeholder for a future Remotion-rendered video of the actual product in use.
// Swap this component for a <video> or Remotion export inside Hero's preview slot
// without restructuring the hero layout.
const LiveBoardPreview = () => {
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState('options');
  const [options, setOptions] = useState(INITIAL_OPTIONS);
  const [selectedPinId, setSelectedPinId] = useState('ramen');
  const [availability, setAvailability] = useState(INITIAL_AVAILABILITY);
  const [userVotedIds, setUserVotedIds] = useState({});
  const [toast, setToast] = useState({
    key: 'initial',
    text: 'Live decision board active',
    isLike: true,
  });

  const userInteractedRef = useRef(false);

  // Auto-switch tabs periodically (Options -> Map -> Dates) if user has not manually locked a tab
  useEffect(() => {
    if (reduceMotion) return undefined;

    const tabSequence = ['options', 'map', 'dates'];
    let tabIndex = 0;

    const interval = window.setInterval(() => {
      // Only auto-cycle if user hasn't interacted recently
      if (!userInteractedRef.current) {
        tabIndex = (tabIndex + 1) % tabSequence.length;
        setActiveTab(tabSequence[tabIndex]);
      } else {
        // Reset interaction flag after 14s so the demo resumes
        userInteractedRef.current = false;
      }
    }, 6200);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  // Automated voting activity simulation
  useEffect(() => {
    if (reduceMotion) return undefined;

    let step = 0;
    const tick = () => {
      const event = VOTE_SCRIPT[step % VOTE_SCRIPT.length];
      setOptions((current) => {
        const next = applyVote(current, event);
        const target = optionById(next, event.id);
        setToast({
          key: `${event.actor}-${step}`,
          text: `${event.actor} ${event.likes > 0 ? 'liked' : 'passed on'} ${target?.title || 'an option'}`,
          isLike: event.likes > 0,
        });
        return next;
      });
      step += 1;
    };

    const intervalId = window.setInterval(tick, 2800);
    const firstId = window.setTimeout(tick, 1200);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(firstId);
    };
  }, [reduceMotion]);

  const eventSeqRef = useRef(0);

  const handleTabClick = (tabId) => {
    userInteractedRef.current = true;
    eventSeqRef.current += 1;
    setActiveTab(tabId);
    if (tabId === 'map') {
      setToast({
        key: `map-${eventSeqRef.current}`,
        text: 'Showing 4 option pins & your location',
        isLike: true,
      });
    } else if (tabId === 'dates') {
      setToast({
        key: `dates-${eventSeqRef.current}`,
        text: 'Saturday Oct 25 has 100% group availability',
        isLike: true,
      });
    }
  };

  const handleUserVote = useCallback((optionId, isLike) => {
    userInteractedRef.current = true;
    eventSeqRef.current += 1;
    const seq = eventSeqRef.current;
    setOptions((current) => {
      const next = applyVote(current, { id: optionId, likes: isLike ? 1 : -1 });
      const target = optionById(next, optionId);
      setToast({
        key: `user-${seq}`,
        text: `You ${isLike ? 'voted for' : 'passed on'} ${target?.title || 'an option'}`,
        isLike,
      });
      return next;
    });
    setUserVotedIds((prev) => ({ ...prev, [optionId]: isLike ? 'like' : 'dislike' }));
  }, []);

  const toggleUserAvailability = (dateId) => {
    userInteractedRef.current = true;
    eventSeqRef.current += 1;
    const seq = eventSeqRef.current;
    setAvailability((prev) => {
      const nextState = !prev.You[dateId];
      setToast({
        key: `avail-${seq}`,
        text: `You marked ${dateId.toUpperCase()} as ${nextState ? 'Free' : 'Busy'}`,
        isLike: nextState,
      });
      return {
        ...prev,
        You: {
          ...prev.You,
          [dateId]: nextState,
        },
      };
    });
  };

  const ranked = sortOptions(options);
  const leadScore = scoreOf(ranked[0]);
  const activePinOption = options.find((o) => o.id === selectedPinId) || ranked[0];

  return (
    <div className="relative w-full overflow-hidden rounded-card border border-border bg-surface shadow-2xl shadow-black/50">
      {/* Board Top Navigation Bar */}
      <div className="border-b border-border bg-surface-2/60 px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-heading text-base font-semibold text-text-primary sm:text-lg">
                Saturday dinner
              </h2>
              <span className="shrink-0 rounded-btn border border-border bg-surface px-2 py-0.5 font-sans text-[11px] text-text-muted">
                Dinner
              </span>
            </div>
            <p className="mt-0.5 font-sans text-xs text-text-muted">
              5 participants · Owner: Alex
            </p>
          </div>

          {/* Status & Avatars Pill */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex -space-x-1.5 overflow-hidden">
              {PARTICIPANTS.map((p) => (
                <div
                  key={p.name}
                  title={p.name}
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-mono font-medium ${p.color}`}
                >
                  {p.initial}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-success"
                animate={reduceMotion ? undefined : { opacity: [1, 0.3, 1] }}
                transition={reduceMotion ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="font-sans text-[11px] font-semibold text-success">Live</span>
            </div>
          </div>
        </div>

        {/* Interactive Feature Tabs Switcher (Options, Map, Dates) */}
        <div className="mt-3 flex items-center gap-1.5 border-t border-border/50 pt-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex items-center gap-1.5 rounded-btn px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-surface text-text-primary border border-border/80 shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface/50'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-accent' : ''}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                      isActive
                        ? 'bg-accent/20 text-accent font-semibold'
                        : 'bg-surface-2 text-text-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="previewActiveTab"
                    className="absolute -bottom-[9px] left-2 right-2 h-0.5 bg-accent"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Preview Body - Dynamically Switches Between Options, Map, Dates */}
      <div className="relative min-h-[290px] overflow-hidden">
        <AnimatePresence mode="wait">
          {/* VIEW 1: OPTIONS RANKED LIST */}
          {activeTab === 'options' && (
            <motion.div
              key="options-view"
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? false : { opacity: 0, x: 8 }}
              transition={{ duration: 0.25 }}
              className="p-3 sm:p-4"
            >
              <LayoutGroup>
                <ul className="flex flex-col gap-2">
                  {ranked.map((option, index) => {
                    const score = scoreOf(option);
                    const isLeading = score === leadScore && score > 0;
                    const userVote = userVotedIds[option.id];

                    return (
                      <motion.li
                        key={option.id}
                        layout
                        transition={reduceMotion ? { duration: 0 } : RANK_SPRING}
                        className={`group relative flex items-center justify-between gap-3 rounded-btn border p-2.5 transition-colors sm:p-3 ${
                          isLeading
                            ? 'border-accent-secondary bg-surface-2 shadow-sm'
                            : 'border-border bg-background/50 hover:bg-background/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-btn font-mono text-xs font-semibold ${
                              isLeading
                                ? 'bg-accent-secondary/20 text-accent-secondary'
                                : 'bg-surface-2 text-text-muted'
                            }`}
                          >
                            {index + 1}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate font-sans text-sm font-semibold text-text-primary">
                                {option.title}
                              </p>
                              {isLeading && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-accent-secondary/15 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-accent-secondary">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  Lead
                                </span>
                              )}
                            </div>
                            <p className="truncate font-sans text-xs text-text-muted">{option.meta}</p>
                          </div>
                        </div>

                        {/* Interactive Reactions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUserVote(option.id, true)}
                            title="Vote thumbs up"
                            className={`flex items-center gap-1 rounded-btn px-2 py-1 text-xs font-mono transition-all ${
                              userVote === 'like'
                                ? 'bg-accent text-background font-semibold'
                                : 'bg-surface border border-border/80 text-text-muted hover:border-accent hover:text-accent'
                            }`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>{option.likes}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUserVote(option.id, false)}
                            title="Vote pass"
                            className={`flex items-center gap-1 rounded-btn px-2 py-1 text-xs font-mono transition-all ${
                              userVote === 'dislike'
                                ? 'bg-text-muted text-background font-semibold'
                                : 'bg-surface border border-border/80 text-text-muted hover:border-text-muted hover:text-text-primary'
                            }`}
                          >
                            <ThumbsDown className="h-3 w-3" />
                            <span>{option.dislikes}</span>
                          </button>

                          <div
                            className={`flex min-w-[2rem] items-center justify-center rounded-btn px-1.5 py-1 font-mono text-xs font-bold ${
                              isLeading
                                ? 'bg-accent-secondary text-background'
                                : 'bg-surface-2 text-text-primary'
                            }`}
                          >
                            {score > 0 ? `+${score}` : score}
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              </LayoutGroup>
            </motion.div>
          )}

          {/* VIEW 2: INTERACTIVE SHARED MAP */}
          {activeTab === 'map' && (
            <motion.div
              key="map-view"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="relative flex flex-col justify-between p-3 sm:p-4"
            >
              {/* Stylized Vector Map Surface */}
              <div className="relative h-48 w-full overflow-hidden rounded-btn border border-border bg-background">
                {/* SVG Street Grid Background */}
                <svg
                  viewBox="0 0 400 200"
                  className="h-full w-full opacity-25 text-border"
                  aria-hidden="true"
                >
                  <path d="M0 50h400M0 100h400M0 150h400M80 0v200M180 0v200M280 0v200" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M30 180c60-40 120 20 200-20s110 30 170-10" fill="none" stroke="currentColor" strokeWidth="3" className="text-accent/30" />
                  <path d="M140 0c-20 60 40 110-10 200" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted/30" />
                </svg>

                {/* Option Map Pins */}
                {options.map((opt) => {
                  const isSelected = opt.id === selectedPinId;
                  const isLead = opt.id === ranked[0].id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        userInteractedRef.current = true;
                        setSelectedPinId(opt.id);
                        setToast({
                          key: `pin-${opt.id}`,
                          text: `Selected pin: ${opt.title} (${scoreOf(opt) > 0 ? `+${scoreOf(opt)}` : scoreOf(opt)})`,
                          isLike: true,
                        });
                      }}
                      style={{ left: `${opt.lng}%`, top: `${opt.lat}%` }}
                      className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-bold shadow-md transition-transform ${
                          isSelected
                            ? 'scale-125 ring-2 ring-background ring-offset-1 ring-offset-accent'
                            : 'hover:scale-110'
                        } ${
                          isLead
                            ? 'bg-accent-secondary text-background ring-1 ring-accent-secondary'
                            : 'bg-accent text-background'
                        }`}
                      >
                        {opt.pinLabel}
                      </span>
                      <span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-btn bg-surface px-1.5 py-0.5 font-sans text-[10px] text-text-primary shadow opacity-0 group-hover:opacity-100 transition-opacity">
                        {opt.title}
                      </span>
                    </button>
                  );
                })}

                {/* Opt-in Participant Location (You) */}
                <div
                  style={{ left: '50%', top: '56%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                >
                  <span className="absolute h-8 w-8 rounded-full bg-success/20 animate-ping" />
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-[8px] text-background">
                    <Navigation className="h-2.5 w-2.5 fill-current" />
                  </span>
                  <span className="absolute -top-4 whitespace-nowrap rounded-btn bg-surface-2/90 px-1 py-0.2 font-sans text-[9px] text-success border border-success/30">
                    You (Opt-in)
                  </span>
                </div>
              </div>

              {/* Selected Pin Mini Info Banner */}
              <div className="mt-2.5 flex items-center justify-between rounded-btn border border-border bg-surface-2 px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-background">
                    {activePinOption.pinLabel}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-sans text-xs font-semibold text-text-primary">
                      {activePinOption.title}
                    </p>
                    <p className="truncate font-sans text-[11px] text-text-muted">
                      {activePinOption.meta}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs font-bold text-accent-secondary">
                    {scoreOf(activePinOption) > 0 ? `+${scoreOf(activePinOption)}` : scoreOf(activePinOption)}
                  </span>
                  <span className="font-sans text-[10px] text-text-muted">Tap pins to inspect</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 3: DATES & AVAILABILITY GRID */}
          {activeTab === 'dates' && (
            <motion.div
              key="dates-view"
              initial={reduceMotion ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? false : { opacity: 0, x: -8 }}
              transition={{ duration: 0.25 }}
              className="p-3 sm:p-4"
            >
              {/* Header row with Date Columns */}
              <div className="grid grid-cols-5 gap-1.5 pb-2 border-b border-border text-center">
                <span className="font-sans text-[11px] text-left font-medium text-text-muted">
                  Participant
                </span>
                {DATES_DATA.map((d) => (
                  <div key={d.id} className="flex flex-col items-center">
                    <span className="font-sans text-xs font-semibold text-text-primary">
                      {d.label}
                    </span>
                    <span
                      className={`font-mono text-[10px] ${
                        d.isBest ? 'text-accent-secondary font-bold' : 'text-text-muted'
                      }`}
                    >
                      {d.freeCount}/5
                    </span>
                  </div>
                ))}
              </div>

              {/* Participant Availability Rows */}
              <div className="mt-2 space-y-1.5">
                {Object.keys(availability).map((person) => {
                  const isUser = person === 'You';
                  const row = availability[person];

                  return (
                    <div
                      key={person}
                      className={`grid grid-cols-5 items-center gap-1.5 rounded-btn px-2 py-1.5 text-center ${
                        isUser
                          ? 'bg-accent/10 border border-accent/30 font-medium'
                          : 'bg-background/40'
                      }`}
                    >
                      <span
                        className={`truncate text-left font-sans text-xs ${
                          isUser ? 'font-semibold text-accent' : 'text-text-muted'
                        }`}
                      >
                        {person} {isUser && '(Click)'}
                      </span>

                      {DATES_DATA.map((d) => {
                        const isFree = row[d.id];

                        if (isUser) {
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => toggleUserAvailability(d.id)}
                              className={`mx-auto flex h-6 w-6 items-center justify-center rounded-btn border transition-all ${
                                isFree
                                  ? 'bg-accent text-background border-accent font-bold'
                                  : 'bg-surface text-text-muted border-border hover:border-text-muted'
                              }`}
                              title={`Toggle ${d.label}`}
                            >
                              {isFree ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            </button>
                          );
                        }

                        return (
                          <div key={d.id} className="flex items-center justify-center">
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-btn text-[10px] ${
                                isFree
                                  ? 'bg-success/20 text-success'
                                  : 'bg-surface-2 text-text-muted/40'
                              }`}
                            >
                              {isFree ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Dates Best Day Summary Banner */}
              <div className="mt-3 flex items-center justify-between rounded-btn border border-accent-secondary/40 bg-accent-secondary/10 px-3 py-1.5">
                <span className="flex items-center gap-1.5 font-sans text-xs font-semibold text-accent-secondary">
                  <Sparkles className="h-3 w-3" />
                  Best pick: Saturday Oct 25
                </span>
                <span className="font-mono text-xs font-bold text-accent-secondary">
                  100% available
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live Activity Toast Bar */}
      <div className="border-t border-border bg-surface-2/40 px-4 py-2 sm:px-5">
        <div className="flex h-6 items-center justify-between gap-2">
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {toast && (
                <motion.div
                  key={toast.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 font-sans text-xs text-text-muted"
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      toast.isLike ? 'bg-accent' : 'bg-text-muted'
                    }`}
                  />
                  <span className="truncate">{toast.text}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className="shrink-0 font-sans text-[11px] text-text-muted/70">
            {activeTab === 'options' && 'Click 👍 / 👎 to vote'}
            {activeTab === 'map' && 'Tap any pin to view'}
            {activeTab === 'dates' && 'Toggle Your availability'}
          </span>
        </div>
      </div>

      {/* Board Bottom Controls */}
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5 sm:px-5">
        <div className="flex flex-1 items-center gap-2 rounded-btn border border-border bg-background/50 px-3 py-1.5">
          <span className="font-sans text-xs text-text-muted/60">
            {activeTab === 'options' && 'Suggest an option or place…'}
            {activeTab === 'map' && 'Search location or drop pin…'}
            {activeTab === 'dates' && 'Propose alternative date…'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span className="font-sans text-xs text-text-muted">5 voting live</span>
        </div>
      </div>
    </div>
  );
};

export default LiveBoardPreview;
