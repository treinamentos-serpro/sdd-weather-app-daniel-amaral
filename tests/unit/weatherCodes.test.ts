import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('weatherCodes', () => {
  it.each([
    0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86,
    95, 96, 99,
  ])('fornece rótulo e ícone para o código WMO %s', (code) => {
    const condition = getWeatherCondition(code);
    expect(condition.label).not.toBe('Indisponível');
    expect(condition.label.length).toBeGreaterThan(0);
    expect(condition.icon.length).toBeGreaterThan(0);
  });

  it('distingue céu limpo, nuvens, chuva e trovoada em pt-BR', () => {
    expect(getWeatherCondition(0).label).toBe('Céu limpo');
    expect(getWeatherCondition(2).label).toBe('Parcialmente nublado');
    expect(getWeatherCondition(61).label).toBe('Chuva leve');
    expect(getWeatherCondition(95).label).toBe('Trovoada');
  });

  it.each([null, -1, 999, NaN])('não inventa céu limpo para código %s', (code) => {
    expect(getWeatherCondition(code)).toEqual({ label: 'Indisponível', icon: '—' });
  });
});
