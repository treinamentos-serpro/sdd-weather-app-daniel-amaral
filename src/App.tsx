import { useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import useWeather from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, cities, error, search, retry } = useWeather();
  const mainRef = useRef<HTMLElement>(null);
  const operation = cities.length ? 'weather' : 'search';

  return (
    <div className="min-h-screen bg-gradient-to-br from-night-900 via-night-800 to-night-900 font-sans text-white [overflow-wrap:anywhere]">
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-night-800 p-3 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:py-10">
        <header className="grid items-center gap-5 lg:grid-cols-[auto_1fr_auto]">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span aria-hidden="true" className="mr-2 text-sun">
                ☀
              </span>
              WeatherView
            </h1>
            <p className="mt-1 text-sm text-slate-300">O tempo, de um jeito simples.</p>
          </div>
          <SearchBar onSearch={search} disabled={status === 'loading'} />
          <div className="justify-self-start lg:justify-self-end">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </header>

        <p aria-live="polite" aria-atomic="true" className="sr-only">
          {status === 'success' && data
            ? `Clima de ${data.city.name} e previsão de cinco dias em ${unit === 'celsius' ? 'Celsius' : 'Fahrenheit'}.`
            : status === 'empty'
              ? 'Nenhuma cidade encontrada. Verifique a grafia ou busque outra cidade.'
              : status === 'idle'
                ? 'Use a busca para consultar o clima de uma cidade.'
                : ''}
        </p>
        <main
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          className="space-y-6 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
        >
          {status === 'idle' && (
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md">
              <h2 className="text-xl font-semibold">Consulte o clima de uma cidade</h2>
              <p className="mt-2 text-slate-300">
                Use a busca acima para consultar as condições atuais e a previsão de cinco dias.
              </p>
            </section>
          )}
          {status === 'loading' && <LoadingState operation={operation} />}
          {status === 'empty' && <EmptyState />}
          {status === 'error' && (
            <ErrorState
              message={error ?? undefined}
              operation={operation}
              onRetry={() => {
                void retry();
                mainRef.current?.focus();
              }}
            />
          )}
          {status === 'success' && data && (
            <>
              <CurrentWeather city={data.city} current={data.current} unit={unit} />
              <ForecastList forecast={data.forecast} unit={unit} />
            </>
          )}
        </main>
        <footer className="text-center text-sm text-slate-400">
          Dados meteorológicos fornecidos pela{' '}
          <a
            href="https://open-meteo.com/"
            className="underline underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          >
            Open-Meteo
          </a>
          .
        </footer>
      </div>
    </div>
  );
}
