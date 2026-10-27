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

export function convertTemperature(temperatureC: number, unit: Unit): number {
  return unit === 'fahrenheit' ? celsiusToFahrenheit(temperatureC) : temperatureC;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function formatTemperature(
  temperatureC: number | null | undefined,
  unit: Unit,
): string {
  if (typeof temperatureC !== 'number' || !Number.isFinite(temperatureC)) {
    return 'Indisponível';
  }

  const temperature = convertTemperature(temperatureC, unit);
  if (!Number.isFinite(temperature)) return 'Indisponível';
  return `${temperatureFormatter.format(temperature)} ${unitLabel(unit)}`;
}
