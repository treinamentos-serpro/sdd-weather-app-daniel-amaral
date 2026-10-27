import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/mocks/weather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/services/weatherService')>()),
  getWeather: vi.fn(),
  searchCities: vi.fn(),
}));

const city = mockWeatherData.city;
const otherCity: City = { ...city, id: 'other', name: 'Outra cidade', latitude: 0 };
const otherWeather: WeatherData = { ...mockWeatherData, city: otherCity };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(searchCities).mockResolvedValue([city, otherCity]);
  vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
});

describe('useWeather', () => {
  it('inicia idle sem rede e retry inicial não faz nada', async () => {
    const { result } = renderHook(() => useWeather());
    expect(result.current).toMatchObject({
      status: 'idle',
      data: null,
      cities: [],
      error: null,
      query: '',
    });
    await act(() => result.current.retry());
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('busca com trim e permanece loading até carregar o clima da primeira cidade', async () => {
    const searchResponse = deferred<City[]>();
    const weatherResponse = deferred<WeatherData>();
    vi.mocked(searchCities).mockReturnValue(searchResponse.promise);
    vi.mocked(getWeather).mockReturnValue(weatherResponse.promise);
    const { result } = renderHook(() => useWeather());
    let request!: Promise<void>;
    act(() => {
      request = result.current.search('  Salvador  ');
    });
    expect(result.current).toMatchObject({ status: 'loading', query: 'Salvador', error: null });
    expect(searchCities).toHaveBeenCalledExactlyOnceWith('Salvador');
    await act(async () => {
      searchResponse.resolve([city, otherCity]);
    });
    expect(result.current.status).toBe('loading');
    expect(result.current.cities).toEqual([city, otherCity]);
    expect(getWeather).toHaveBeenCalledExactlyOnceWith(city);
    await act(async () => {
      weatherResponse.resolve(mockWeatherData);
      await request;
    });
    expect(result.current).toMatchObject({ status: 'success', data: mockWeatherData, error: null });
  });

  it.each(['', '   ', '\t\n'])('valida termo vazio %j sem rede', async (query) => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search(query));
    expect(result.current).toMatchObject({
      status: 'error',
      error: 'Digite o nome de uma cidade.',
      query: '',
      data: null,
      cities: [],
    });
    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('retorna empty sem forecast e remove dados e cidades da busca anterior', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Salvador'));
    vi.mocked(searchCities).mockResolvedValue([]);
    await act(() => result.current.search('Inexistente'));
    expect(result.current).toMatchObject({
      status: 'empty',
      data: null,
      cities: [],
      error: null,
      query: 'Inexistente',
    });
    expect(getWeather).toHaveBeenCalledTimes(1);
    await act(() => result.current.retry());
    expect(searchCities).toHaveBeenLastCalledWith('Inexistente');
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it('seleciona outra cidade mantendo lista e query e invalidando o snapshot anterior', async () => {
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Salvador'));
    const response = deferred<WeatherData>();
    vi.mocked(getWeather).mockReturnValue(response.promise);
    let request!: Promise<void>;
    act(() => {
      request = result.current.selectCity(otherCity);
    });
    expect(result.current).toMatchObject({
      status: 'loading',
      data: null,
      query: 'Salvador',
      cities: [city, otherCity],
    });
    await act(async () => {
      response.resolve(otherWeather);
      await request;
    });
    expect(result.current.data).toBe(otherWeather);
    expect(result.current.status).toBe('success');
  });

  it('expõe erro de busca e retry repete o geocoding', async () => {
    vi.mocked(searchCities).mockRejectedValueOnce(new Error('Falha de rede.'));
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search(' Salvador '));
    expect(result.current).toMatchObject({ status: 'error', error: 'Falha de rede.', data: null });
    expect(getWeather).not.toHaveBeenCalled();
    await act(() => result.current.retry());
    expect(searchCities).toHaveBeenNthCalledWith(2, 'Salvador');
    expect(result.current.status).toBe('success');
    expect(result.current.error).toBeNull();
  });

  it('retry após falha do forecast repete só o clima da mesma cidade', async () => {
    vi.mocked(getWeather).mockRejectedValueOnce(
      new WeatherServiceError('A requisição demorou demais.', undefined, 'timeout'),
    );
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.search('Salvador'));
    expect(result.current).toMatchObject({
      status: 'error',
      error: 'A requisição demorou demais.',
      cities: [city, otherCity],
      data: null,
    });
    await act(() => result.current.retry());
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenNthCalledWith(2, city);
    expect(result.current.status).toBe('success');
  });

  it('retry repete seleção explícita inclusive após sucesso', async () => {
    vi.mocked(getWeather).mockResolvedValue(otherWeather);
    const { result } = renderHook(() => useWeather());
    await act(() => result.current.selectCity(otherCity));
    await act(() => result.current.retry());
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenLastCalledWith(otherCity);
    expect(searchCities).not.toHaveBeenCalled();
  });

  it.each([
    'resolve',
    'reject',
  ] as const)('ignora busca antiga que termina com %s', async (outcome) => {
    const old = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValueOnce(old.promise).mockResolvedValue([otherCity]);
    vi.mocked(getWeather).mockResolvedValue(otherWeather);
    const { result } = renderHook(() => useWeather());
    let request!: Promise<void>;
    act(() => {
      request = result.current.search('Antiga');
    });
    await act(() => result.current.search('Nova'));
    await act(async () => {
      if (outcome === 'resolve') old.resolve([city]);
      else old.reject(new Error('Erro antigo'));
      await request;
    });
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'Nova',
      cities: [otherCity],
      data: otherWeather,
      error: null,
    });
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it.each([
    'resolve',
    'reject',
  ] as const)('ignora forecast antigo que termina com %s', async (outcome) => {
    const old = deferred<WeatherData>();
    vi.mocked(getWeather).mockReturnValueOnce(old.promise).mockResolvedValue(otherWeather);
    const { result } = renderHook(() => useWeather());
    let request!: Promise<void>;
    act(() => {
      request = result.current.search('Salvador');
    });
    await act(async () => {});
    await act(() => result.current.selectCity(otherCity));
    await act(async () => {
      if (outcome === 'resolve') old.resolve(mockWeatherData);
      else old.reject(new Error('Erro antigo'));
      await request;
    });
    expect(result.current).toMatchObject({ status: 'success', data: otherWeather, error: null });
    await act(() => result.current.retry());
    expect(getWeather).toHaveBeenLastCalledWith(otherCity);
  });

  it('busca vazia invalida uma operação ainda em andamento', async () => {
    const response = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValue(response.promise);
    const { result } = renderHook(() => useWeather());
    let request!: Promise<void>;
    act(() => {
      request = result.current.search('Antiga');
    });
    await act(() => result.current.search(''));
    await act(async () => {
      response.resolve([city]);
      await request;
    });
    expect(result.current.status).toBe('error');
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('não inicia forecast se geocoding resolver após desmontagem', async () => {
    const response = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValue(response.promise);
    const { result, unmount } = renderHook(() => useWeather());
    let request!: Promise<void>;
    act(() => {
      request = result.current.search('Salvador');
    });
    unmount();
    await act(async () => {
      response.resolve([city]);
      await request;
    });
    expect(getWeather).not.toHaveBeenCalled();
  });
});
