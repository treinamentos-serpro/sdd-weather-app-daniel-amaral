import { getDayLabel, getShortDate } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

function formatPrecipitationProbability(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
    return 'Indisponível';
  }
  return `${value} %`;
}

interface ForecastDayCardProps {
  day: ForecastDay;
  dayIndex: number;
  unit: Unit;
}

export default function ForecastDayCard({ day, dayIndex, unit }: ForecastDayCardProps) {
  const condition = getWeatherCondition(day.weatherCode);

  return (
    <article className="h-full min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-glass backdrop-blur-md [overflow-wrap:anywhere]">
      <h3 className="font-semibold">
        <time dateTime={day.date}>
          {getDayLabel(dayIndex, day.date)}, {getShortDate(day.date)}
        </time>
      </h3>
      <span aria-hidden="true" className="my-3 block text-4xl text-sun">
        {condition.icon}
      </span>
      <p className="mb-3 text-sm text-slate-200">{condition.label}</p>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-slate-300">Máxima</dt>
          <dd className="font-semibold">{formatTemperature(day.maxTemperatureC, unit)}</dd>
        </div>
        <div>
          <dt className="text-slate-300">Mínima</dt>
          <dd>{formatTemperature(day.minTemperatureC, unit)}</dd>
        </div>
        <div>
          <dt className="text-slate-300">Probabilidade de precipitação</dt>
          <dd>{formatPrecipitationProbability(day.precipitationProbabilityMaxPercent)}</dd>
        </div>
      </dl>
    </article>
  );
}
