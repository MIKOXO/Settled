import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { searchPlaces } from '../../services/location';

const DEBOUNCE_MS = 400;
const MIN_CHARS = 3;

const inputClasses =
  'w-full rounded-btn border border-border bg-surface px-3.5 py-2.5 pl-9 font-sans text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent transition-colors duration-200';

const PlaceSearch = ({ onSelect, placeholder = 'Search for a place...' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  const fetchResults = useCallback(async (q) => {
    if (q.trim().length < MIN_CHARS) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await searchPlaces(q.trim());
      setResults(res.results ?? []);
      setOpen(true);
    } catch {
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults(query);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchResults]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result) => {
    setQuery(result.name);
    setOpen(false);
    onSelect({ lat: result.lat, lng: result.lng, placeName: result.name });
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    onSelect(null);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={inputClasses}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {(query || loading) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-card border border-border bg-surface shadow-lg">
          {results.map((result, i) => (
            <li key={`${result.lat}-${result.lng}-${i}`}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="w-full px-3.5 py-2.5 text-left font-sans text-sm text-text-primary hover:bg-surface-2 transition-colors duration-150"
              >
                {result.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim().length >= MIN_CHARS && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-1 w-full rounded-card border border-border bg-surface px-3.5 py-2.5 shadow-lg">
          <p className="font-sans text-sm text-text-muted">No results found</p>
        </div>
      )}
    </div>
  );
};

export default PlaceSearch;
