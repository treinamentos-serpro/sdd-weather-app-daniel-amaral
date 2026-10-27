import { useId } from 'react';
import type { ForecastDay, Unit } from '../types/weather';
import ForecastDayCard from './ForecastDayCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-4 text-xl font-semibold text-white">
        Previsão de 5 dias
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day) => (
          <li key={day.date} className="min-w-0">
            <ForecastDayCard day={day} unit={unit} />
          </li>
        ))}
      </ul>
    </section>
  );
}
