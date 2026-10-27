import { describe, expect, it } from 'vitest';
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  formatTemperature,
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

  it('formata com uma casa decimal, unidade explícita e locale pt-BR', () => {
    expect(formatTemperature(0, 'celsius')).toBe('0,0 °C');
    expect(formatTemperature(0, 'fahrenheit')).toBe('32,0 °F');
    expect(formatTemperature(-12.34, 'celsius')).toBe('-12,3 °C');
    expect(formatTemperature(25.4, 'fahrenheit')).toBe('77,7 °F');
  });

  it('preserva indisponibilidade nas duas unidades', () => {
    expect(formatTemperature(null, 'celsius')).toBe('Indisponível');
    expect(formatTemperature(null, 'fahrenheit')).toBe('Indisponível');
  });

  it.each([NaN, Infinity, -Infinity])('rejeita temperatura não finita %s', (value) => {
    expect(() => formatTemperature(value, 'celsius')).toThrow(RangeError);
  });
});
