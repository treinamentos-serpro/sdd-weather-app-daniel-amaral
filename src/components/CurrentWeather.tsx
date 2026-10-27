import { useId } from 'react';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

const metricFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
});

function formatMetric(value: number | null | undefined, suffix: string): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Indisponível';
  return `${metricFormatter.format(value)} ${suffix}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const headingId = useId();
  const condition = getWeatherCondition(current.weatherCode);
  const location = [city.administrativeArea, city.country].filter(Boolean).join(', ');
  const metrics = [
    { label: 'Umidade', value: formatMetric(current.relativeHumidityPercent, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, 'km/h') },
    { label: 'Precipitação', value: formatMetric(current.precipitationMm, 'mm') },
    { label: 'Pressão à superfície', value: formatMetric(current.surfacePressureHpa, 'hPa') },
  ];

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 font-sans text-white shadow-glass backdrop-blur-md [overflow-wrap:anywhere] sm:p-8"
    >
      <p className="text-sm text-slate-300">Clima atual</p>
      <h2 id={headingId} className="mt-1 break-words text-2xl font-semibold sm:text-3xl">
        {city.name}
      </h2>
      {location && <p className="mt-1 text-slate-300">{location}</p>}
      <div className="my-6 flex flex-wrap items-center gap-6">
        <span aria-hidden="true" className="text-6xl text-sun sm:text-7xl">
          {condition.icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm text-slate-300">Temperatura</p>
          <p
            className={`font-semibold tracking-tight ${
              current.temperatureC === null
                ? 'text-2xl sm:text-3xl'
                : 'text-4xl sm:text-6xl lg:text-7xl'
            }`}
          >
            {formatTemperature(current.temperatureC, unit)}
          </p>
          <p className="mt-2 text-lg text-slate-200">{condition.label}</p>
          <p className="mt-1 text-slate-300">
            Sensação térmica: {formatTemperature(current.apparentTemperatureC, unit)}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <dt className="text-sm text-slate-300">{label}</dt>
            <dd className="mt-1 text-xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
