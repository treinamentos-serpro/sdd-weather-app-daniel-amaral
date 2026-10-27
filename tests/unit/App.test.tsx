import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { formatTemperature } from '../../src/lib/temperature';
import { mockWeatherData } from '../../src/mocks/weather';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
  vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
});

async function submitSearch(name = 'Salvador') {
  const user = userEvent.setup();
  const input = screen.getByRole('searchbox', { name: 'Cidade' });
  await user.clear(input);
  await user.type(input, `${name}{Enter}`);
  return user;
}

describe('App', () => {
  it('inicia idle em Celsius, sem mock, controles de demonstração ou rede', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'WeatherView', level: 1 })).toBeVisible();
    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Consulte o clima de uma cidade' })).toBeVisible();
    expect(screen.getByRole('button', { name: '°C', pressed: true })).toBeVisible();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Estado da demonstração' })).not.toBeInTheDocument();
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('busca a cidade e renderiza clima atual e cinco dias da resposta', async () => {
    const data = { ...mockWeatherData, city: { ...mockWeatherData.city, name: 'Recife' } };
    vi.mocked(searchCities).mockResolvedValue([data.city]);
    vi.mocked(getWeather).mockResolvedValue(data);
    render(<App />);
    await submitSearch('  Recife  ');
    expect(await screen.findByRole('region', { name: 'Recife' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByText('25,4 °C')).toBeVisible();
    expect(screen.queryByRole('region', { name: 'Salvador' })).not.toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledExactlyOnceWith('Recife');
    expect(getWeather).toHaveBeenCalledExactlyOnceWith(data.city);
  });

  it('mostra loading para busca e forecast, sem dados antigos e com busca desabilitada', async () => {
    render(<App />);
    await submitSearch();
    await screen.findByRole('region', { name: 'Salvador' });
    let resolveSearch!: (cities: (typeof mockWeatherData.city)[]) => void;
    let resolveWeather!: (data: WeatherData) => void;
    vi.mocked(searchCities).mockReturnValue(
      new Promise((resolve) => {
        resolveSearch = resolve;
      }),
    );
    vi.mocked(getWeather).mockReturnValue(
      new Promise((resolve) => {
        resolveWeather = resolve;
      }),
    );
    await submitSearch('Recife');
    expect(screen.getByRole('status')).toHaveTextContent('Buscando cidades');
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    await act(async () => {
      resolveSearch([mockWeatherData.city]);
    });
    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados meteorológicos');
    await act(async () => {
      resolveWeather(mockWeatherData);
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('mostra empty sem previsão antiga nem nova consulta de forecast', async () => {
    render(<App />);
    await submitSearch();
    await screen.findByRole('region', { name: 'Salvador' });
    vi.mocked(searchCities).mockResolvedValue([]);
    await submitSearch('Inexistente');
    expect(await screen.findByRole('region', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it.each([
    'search',
    'weather',
  ])('mostra erro de %s e retry executa a operação real', async (operation) => {
    if (operation === 'search')
      vi.mocked(searchCities).mockRejectedValueOnce(new Error('Falha de rede.'));
    else vi.mocked(getWeather).mockRejectedValueOnce(new Error('A requisição demorou demais.'));
    render(<App />);
    const user = await submitSearch();
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      operation === 'search' ? 'Erro ao buscar cidades' : 'Erro ao consultar o clima',
    );
    expect(alert).toHaveTextContent(
      operation === 'search' ? 'Falha de rede.' : 'A requisição demorou demais.',
    );
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('region', { name: 'Salvador' })).toBeVisible();
    expect(screen.getByRole('main')).toHaveFocus();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledTimes(operation === 'search' ? 2 : 1);
    expect(getWeather).toHaveBeenCalledTimes(operation === 'search' ? 1 : 2);
  });

  it('converte todas as temperaturas sem rede e preserva unidade nas novas buscas', async () => {
    render(<App />);
    const user = await submitSearch();
    await screen.findByRole('region', { name: 'Salvador' });
    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(screen.getByText('77,7 °F')).toBeVisible();
    expect(screen.getByText('Sensação térmica: 80,8 °F')).toBeVisible();
    expect(
      screen.getByText('Clima de Salvador e previsão de cinco dias em Fahrenheit.'),
    ).toHaveAttribute('aria-live', 'polite');
    for (const [index, day] of mockWeatherData.forecast.entries()) {
      const card = within(screen.getAllByRole('article')[index]);
      expect(card.getByText(formatTemperature(day.minTemperatureC, 'fahrenheit'))).toBeVisible();
      expect(card.getByText(formatTemperature(day.maxTemperatureC, 'fahrenheit'))).toBeVisible();
    }
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(1);
    await submitSearch('Outra cidade');
    await screen.findByRole('region', { name: 'Salvador' });
    expect(screen.getByText('77,7 °F')).toBeVisible();
  });

  it('permite trocar unidade durante loading e aplica a unidade vigente ao receber dados', async () => {
    let resolve!: (data: WeatherData) => void;
    vi.mocked(getWeather).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    render(<App />);
    const user = await submitSearch();
    await user.click(screen.getByRole('button', { name: '°F' }));
    await act(async () => {
      resolve(mockWeatherData);
    });
    expect(screen.getByText('77,7 °F')).toBeVisible();
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it('valida busca vazia sem rede e reinicia em Celsius e idle após remontagem', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Digite o nome de uma cidade.');
    expect(searchCities).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '°F' }));
    unmount();
    render(<App />);
    expect(screen.getByRole('button', { name: '°C', pressed: true })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Consulte o clima de uma cidade' })).toBeVisible();
  });
});
