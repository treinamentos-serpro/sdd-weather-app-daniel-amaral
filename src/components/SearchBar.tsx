import { type FormEvent, useId, useRef, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = `${inputId}-error`;
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setError('Digite o nome de uma cidade.');
      inputRef.current?.focus();
      return;
    }

    setError(null);
    onSearch(trimmedCity);
  }

  return (
    <form
      role="search"
      aria-label="Buscar cidade"
      aria-busy={disabled}
      onSubmit={handleSubmit}
      className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 font-sans text-white shadow-glass backdrop-blur-md"
    >
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-slate-200">
        Cidade
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={inputId}
          ref={inputRef}
          name="city"
          type="search"
          value={city}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            setCity(event.target.value);
            setError(null);
          }}
          placeholder="Ex.: São Paulo"
          className="min-w-0 flex-1 rounded-xl border border-slate-400 bg-night-800 px-4 py-3 text-white placeholder:text-slate-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-wait disabled:border-slate-600 disabled:opacity-70"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded-xl bg-accent-400 px-5 py-3 font-semibold text-night-900 transition-colors enabled:hover:bg-accent-500 enabled:active:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-wait disabled:bg-slate-600 disabled:text-slate-100 disabled:opacity-100"
        >
          Buscar
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
