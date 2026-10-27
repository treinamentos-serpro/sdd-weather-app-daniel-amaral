import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastList from '../../src/components/ForecastList';
import { mockWeatherData } from '../../src/mocks/weather';

describe('ForecastList', () => {
  it('preserva cinco datas locais em ordem e valores zero', () => {
    render(<ForecastList forecast={mockWeatherData.forecast} unit="celsius" />);
    const cards = screen.getAllByRole('article');

    expect(cards).toHaveLength(5);
    for (const [index, day] of mockWeatherData.forecast.entries()) {
      const heading = within(cards[index]).getByRole('heading');
      expect(heading.querySelector('time')).toHaveAttribute('dateTime', day.date);
      expect(heading).toHaveTextContent(`${27 + index}/10`);
    }
    expect(within(cards[1]).getByText('0 %')).toBeVisible();
    expect(within(cards[1]).getByText('Céu limpo')).toBeVisible();
  });

  it('mantém a data e o cartão de um dia sem métricas', () => {
    const forecast = mockWeatherData.forecast.map((day, index) =>
      index === 2
        ? {
            ...day,
            minTemperatureC: null,
            maxTemperatureC: null,
            weatherCode: null,
            precipitationProbabilityMaxPercent: null,
          }
        : day,
    );
    render(<ForecastList forecast={forecast} unit="fahrenheit" />);

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(5);
    expect(within(cards[2]).getByRole('heading')).toHaveTextContent('29/10');
    expect(within(cards[2]).getAllByText('Indisponível')).toHaveLength(4);
    expect(within(cards[0]).getByText('81,5 °F')).toBeVisible();
  });
});
