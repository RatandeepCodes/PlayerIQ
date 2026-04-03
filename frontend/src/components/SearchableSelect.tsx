import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  value: string;
  label: string;
  subtitle?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchableSelect = ({ options, value, onChange, placeholder = 'Search...' }: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) =>
      [option.label, option.subtitle]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    );
  }, [deferredQuery, options]);
  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-card border border-border text-sm font-body text-foreground hover:border-foreground/20 transition-colors"
      >
        <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 rounded-xl bg-card border border-border shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Search size={14} className="text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-sm font-body text-foreground outline-none placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground font-body">
                  No results found
                </div>
              ) : (
                filtered.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={`w-full text-left px-4 py-3 text-sm font-body transition-colors hover:bg-accent ${
                      value === option.value ? 'text-foreground bg-accent' : 'text-secondary-foreground'
                    }`}
                  >
                    <div>{option.label}</div>
                    {option.subtitle && (
                      <div className="text-xs text-muted-foreground mt-0.5">{option.subtitle}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchableSelect;
