import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import { mockWeatherData } from '../../src/mocks/weather';
import type { CurrentWeather as CurrentWeatherData, Unit } from '../../src/types/weather';

const { city, current } = mockWeatherData;

function WeatherWithUnitToggle() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather
        city={city}
        current={{ ...current, temperatureC: 0, apparentTemperatureC: 0 }}
        unit={unit}
      />
    </>
  );
}

describe('CurrentWeather', () => {
  it('apresenta cidade, condição, temperaturas e métricas do mock', () => {
    render(<CurrentWeather city={city} current={current} unit="celsius" />);

    expect(screen.getByRole('region', { name: 'Salvador' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Salvador' })).toBeVisible();
    expect(screen.getByText('Bahia, Brasil')).toBeVisible();
    expect(screen.getByText('25,4 °C')).toBeVisible();
    expect(screen.getByText('Sensação térmica: 27,1 °C')).toBeVisible();
    expect(screen.getByText('Parcialmente nublado')).toBeVisible();
    expect(screen.getByText('⛅')).toHaveAttribute('aria-hidden', 'true');

    for (const [label, value] of [
      ['Umidade', '68 %'],
      ['Vento', '12,5 km/h'],
      ['Precipitação', '0,2 mm'],
      ['Pressão à superfície', '1.013,2 hPa'],
    ]) {
      expect(screen.getByText(label, { selector: 'dt' }).nextElementSibling).toHaveTextContent(
        value,
      );
    }
  });

  it('converte temperatura e sensação sem alterar demais métricas ou dados canônicos', () => {
    const original = structuredClone(current);
    const { rerender } = render(<CurrentWeather city={city} current={current} unit="celsius" />);

    rerender(<CurrentWeather city={city} current={current} unit="fahrenheit" />);

    expect(screen.getByText('77,7 °F')).toBeVisible();
    expect(screen.getByText('Sensação térmica: 80,8 °F')).toBeVisible();
    expect(screen.queryByText('25,4 °C')).not.toBeInTheDocument();
    expect(screen.getByText('12,5 km/h')).toBeVisible();
    expect(screen.getByText('0,2 mm')).toBeVisible();
    expect(screen.getByText('1.013,2 hPa')).toBeVisible();
    expect(current).toEqual(original);
  });

  it('preserva zero em todas as métricas e reconhece o código zero', () => {
    const zero: CurrentWeatherData = {
      temperatureC: 0,
      apparentTemperatureC: 0,
      relativeHumidityPercent: 0,
      windSpeedKmh: 0,
      precipitationMm: 0,
      surfacePressureHpa: 0,
      weatherCode: 0,
    };
    render(<CurrentWeather city={city} current={zero} unit="celsius" />);

    for (const value of ['0,0 °C', 'Sensação térmica: 0,0 °C', '0 %', '0 km/h', '0 mm', '0 hPa']) {
      expect(screen.getByText(value)).toBeVisible();
    }
    expect(screen.getByText('Céu limpo')).toBeVisible();
  });

  it('converte 0 °C para Fahrenheit ao selecionar °F no toggle', async () => {
    const user = userEvent.setup();
    render(<WeatherWithUnitToggle />);

    expect(screen.getByText('0,0 °C')).toBeVisible();
    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByRole('button', { name: '°F', pressed: true })).toBeVisible();
    expect(screen.getByText('32,0 °F')).toBeVisible();
    expect(screen.getByText('Sensação térmica: 32,0 °F')).toBeVisible();
    expect(screen.queryByText('0,0 °C')).not.toBeInTheDocument();
  });

  it('substitui dados anteriores por indisponibilidade sem inventar métricas', () => {
    const missing: CurrentWeatherData = {
      temperatureC: null,
      apparentTemperatureC: null,
      relativeHumidityPercent: null,
      windSpeedKmh: null,
      precipitationMm: null,
      surfacePressureHpa: null,
      weatherCode: null,
    };
    const { rerender } = render(<CurrentWeather city={city} current={current} unit="celsius" />);
    rerender(<CurrentWeather city={city} current={missing} unit="fahrenheit" />);

    expect(screen.getAllByText('Indisponível')).toHaveLength(6);
    expect(screen.getByText('Sensação térmica: Indisponível')).toBeVisible();
    expect(screen.queryByText('25,4 °C')).not.toBeInTheDocument();
    expect(screen.queryByText('12,5 km/h')).not.toBeInTheDocument();
    expect(screen.queryByText('Parcialmente nublado')).not.toBeInTheDocument();
  });

  it('mostra condição desconhecida como indisponível e aceita localização parcial', () => {
    render(
      <CurrentWeather
        city={{ ...city, administrativeArea: null, country: null }}
        current={{ ...current, weatherCode: 999 }}
        unit="celsius"
      />,
    );

    expect(screen.getByText('Indisponível')).toBeVisible();
    expect(screen.queryByText('Céu limpo')).not.toBeInTheDocument();
    expect(screen.queryByText('Bahia, Brasil')).not.toBeInTheDocument();
    expect(screen.getByText('25,4 °C')).toBeVisible();
  });

  it('não exibe NaN para métricas não finitas', () => {
    const invalidCurrent: CurrentWeatherData = {
      temperatureC: Number.NaN,
      apparentTemperatureC: Number.POSITIVE_INFINITY,
      relativeHumidityPercent: Number.NaN,
      windSpeedKmh: Number.NaN,
      precipitationMm: Number.NaN,
      surfacePressureHpa: Number.NaN,
      weatherCode: Number.NaN,
    };
    Object.defineProperty(invalidCurrent, 'windSpeedKmh', { value: undefined });

    render(
      <CurrentWeather city={city} current={invalidCurrent} unit="celsius" />,
    );

    expect(screen.getAllByText('Indisponível')).toHaveLength(6);
    expect(screen.getByText('Sensação térmica: Indisponível')).toBeVisible();
    expect(screen.getByText('Vento', { selector: 'dt' }).nextElementSibling).toHaveTextContent(
      'Indisponível',
    );
    expect(screen.queryByText(/NaN|Infinity|undefined/)).not.toBeInTheDocument();
  });
});
