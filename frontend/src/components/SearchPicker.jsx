import { useEffect, useMemo, useRef, useState } from "react";

export default function SearchPicker({
  label,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search",
  emptyMessage = "No results found.",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const selectedOption = options.find((option) => option.value === value) || null;
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) =>
      [option.label, option.meta]
        .filter(Boolean)
        .some((entry) => String(entry).toLowerCase().includes(normalizedQuery)),
    );
  }, [options, query]);

  return (
    <div ref={containerRef} className="search-picker">
      <span className="search-picker-label">{label}</span>

      <button
        className={`search-picker-trigger${open ? " open" : ""}`}
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <div className="search-picker-trigger-copy">
          <strong>{selectedOption?.label || placeholder}</strong>
          {selectedOption?.meta ? <small>{selectedOption.meta}</small> : null}
        </div>
        <span className="search-picker-caret">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="search-picker-menu">
          <input
            className="search-picker-input"
            type="text"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <div className="search-picker-options">
            {filteredOptions.length ? (
              filteredOptions.slice(0, 12).map((option) => (
                <button
                  key={option.value}
                  className={`search-picker-option${option.value === value ? " active" : ""}`}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <strong>{option.label}</strong>
                  {option.meta ? <small>{option.meta}</small> : null}
                </button>
              ))
            ) : (
              <div className="search-picker-empty">{emptyMessage}</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
