import { describe, expect, it } from 'vitest';
import {
  celsiusToFahrenheit,
  convertTemperature,
  fahrenheitToCelsius,
  formatTemperature,
  unitLabel,
} from '../../src/lib/temperature';

describe('temperature', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
    [25.4, 77.72],
  ])('converte %s °C para %s °F e vice-versa', (celsius, fahrenheit) => {
    expect(celsiusToFahrenheit(celsius)).toBeCloseTo(fahrenheit);
    expect(fahrenheitToCelsius(fahrenheit)).toBeCloseTo(celsius);
  });

  it.each([
    [0, 'celsius', 0],
    [0, 'fahrenheit', 32],
    [100, 'fahrenheit', 212],
    [-40, 'fahrenheit', -40],
  ] as const)('converte %s °C para a unidade %s', (celsius, unit, expected) => {
    expect(convertTemperature(celsius, unit)).toBe(expected);
  });

  it.each([
    ['celsius', '°C'],
    ['fahrenheit', '°F'],
  ] as const)('fornece o símbolo da unidade %s', (unit, label) => {
    expect(unitLabel(unit)).toBe(label);
  });

  it('formata com uma casa decimal, unidade explícita e locale pt-BR', () => {
    expect(formatTemperature(0, 'celsius')).toBe('0,0 °C');
    expect(formatTemperature(0, 'fahrenheit')).toBe('32,0 °F');
    expect(formatTemperature(100, 'fahrenheit')).toBe('212,0 °F');
    expect(formatTemperature(-12.34, 'celsius')).toBe('-12,3 °C');
    expect(formatTemperature(25.4, 'fahrenheit')).toBe('77,7 °F');
  });

  it('preserva indisponibilidade nas duas unidades', () => {
    expect(formatTemperature(null, 'celsius')).toBe('Indisponível');
    expect(formatTemperature(null, 'fahrenheit')).toBe('Indisponível');
  });

  it.each([null, undefined, NaN, Infinity, -Infinity])(
    'usa fallback indisponível para temperatura ausente ou não finita: %s',
    (value) => {
      expect(formatTemperature(value, 'celsius')).toBe('Indisponível');
    },
  );

  it('preserva zero sem confundi-lo com campo ausente', () => {
    expect(formatTemperature(0, 'celsius')).toBe('0,0 °C');
  });
});
