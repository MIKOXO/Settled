import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

const Select = ({ value, onChange, options, placeholder = 'Select...', name, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((opt) => opt.value === value) ?? null;

  const handleOpen = () => {
    setOpen((current) => !current);
    setFocusedIndex(value ? options.findIndex((opt) => opt.value === value) : -1);
  };

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
      return;
    }

    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setFocusedIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setFocusedIndex((index) => Math.max(index - 1, 0));
    } else if (e.key === 'Enter' && open && focusedIndex >= 0) {
      e.preventDefault();
      handleSelect(options[focusedIndex]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && listRef.current && focusedIndex >= 0) {
      const item = listRef.current.children[focusedIndex];
      if (item) item.scrollIntoView({ block: 'nearest' });
    }
  }, [open, focusedIndex]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        name={name}
        id={name}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 rounded-btn border bg-surface px-4 py-2.5 font-sans text-sm transition-colors focus:outline-none focus:border-accent ${
          open ? 'border-accent' : 'border-border hover:border-text-muted/40'
        } ${selected ? 'text-text-primary' : 'text-text-muted/60'}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={name}
          className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-btn border border-border bg-surface-2 p-1.5 shadow-xl shadow-black/40"
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isFocused = index === focusedIndex;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`flex w-full items-center justify-between gap-2 rounded-btn px-3 py-2.5 font-sans text-sm transition-colors ${
                    isSelected
                      ? 'bg-accent/15 text-accent'
                      : isFocused
                        ? 'bg-surface text-text-primary'
                        : 'text-text-muted hover:bg-surface hover:text-text-primary'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Select;
