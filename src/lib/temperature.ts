import type { Unit } from '../types/weather';

const temperatureFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

export function formatTemperature(temperatureC: number | null, unit: Unit): string {
  if (temperatureC === null) return 'Indisponível';
  if (!Number.isFinite(temperatureC)) {
    throw new RangeError('A temperatura deve ser um número finito ou null.');
  }

  const temperature = unit === 'fahrenheit' ? celsiusToFahrenheit(temperatureC) : temperatureC;
  return `${temperatureFormatter.format(temperature)} ${unit === 'fahrenheit' ? '°F' : '°C'}`;
}
