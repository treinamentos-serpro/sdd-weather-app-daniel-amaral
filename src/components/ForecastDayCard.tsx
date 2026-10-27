import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastDayCardProps {
  day: ForecastDay;
  unit: Unit;
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
});

export default function ForecastDayCard({ day, unit }: ForecastDayCardProps) {
  const condition = getWeatherCondition(day.weatherCode);

  return (
    <article className="h-full min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-glass backdrop-blur-md [overflow-wrap:anywhere]">
      <h3 className="font-semibold">
        <time dateTime={day.date}>{dateFormatter.format(new Date(`${day.date}T00:00:00Z`))}</time>
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
          <dd>
            {day.precipitationProbabilityMaxPercent === null
              ? 'Indisponível'
              : `${day.precipitationProbabilityMaxPercent} %`}
          </dd>
        </div>
      </dl>
    </article>
  );
}
