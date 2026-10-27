import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchWithTimeout,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const cityResult = {
  id: 3448439,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  latitude: -23.5475,
  longitude: -46.6361,
};

function mockResponse(body: unknown, status = 200) {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const city: City = {
  id: '3448439',
  name: 'São Paulo',
  administrativeArea: 'São Paulo',
  country: 'Brasil',
  latitude: -23.5475,
  longitude: -46.6361,
};

function weatherResponse() {
  return {
    timezone: 'America/Sao_Paulo',
    current: {
      temperature_2m: 25.2,
      apparent_temperature: 26.1,
      relative_humidity_2m: 64,
      wind_speed_10m: 12.5,
      precipitation: 0,
      surface_pressure: 1013.2,
      weather_code: 3,
    },
    daily: {
      time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
      temperature_2m_min: [18, 19, 20, 21, 22],
      temperature_2m_max: [25, 26, 27, 28, 29],
      weather_code: [0, 1, 2, 3, 61],
      precipitation_probability_max: [0, 10, 20, 30, 80],
    },
  };
}

describe('getWeather', () => {
  it('envia os parâmetros do forecast e mapeia todas as métricas pelos índices', async () => {
    const body = weatherResponse();
    const fetchMock = mockResponse(body);
    const weather = await getWeather(city);
    expect(weather.city).toBe(city);
    expect(weather.timezone).toBe(body.timezone);
    expect(weather.periodStart).toBe('2026-10-29');
    expect(weather.current).toEqual({
      temperatureC: 25.2,
      apparentTemperatureC: 26.1,
      relativeHumidityPercent: 64,
      windSpeedKmh: 12.5,
      precipitationMm: 0,
      surfacePressureHpa: 1013.2,
      weatherCode: 3,
    });
    expect(weather.forecast).toEqual(
      body.daily.time.map((date, index) => ({
        date,
        minTemperatureC: body.daily.temperature_2m_min[index],
        maxTemperatureC: body.daily.temperature_2m_max[index],
        weatherCode: body.daily.weather_code[index],
        precipitationProbabilityMaxPercent: body.daily.precipitation_probability_max[index],
      })),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      latitude: String(city.latitude),
      longitude: String(city.longitude),
      current:
        'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure,weather_code',
      daily: 'temperature_2m_min,temperature_2m_max,weather_code,precipitation_probability_max',
      timezone: 'auto',
      forecast_days: '5',
      temperature_unit: 'celsius',
      timeformat: 'iso8601',
      wind_speed_unit: 'kmh',
      precipitation_unit: 'mm',
    });
  });

  it('normaliza métricas inválidas sem deslocar os índices seguintes', async () => {
    const body = weatherResponse();
    mockResponse({
      ...body,
      current: { temperature_2m: 0, relative_humidity_2m: 101, weather_code: 0 },
      daily: {
        ...body.daily,
        temperature_2m_min: [0, null, 20],
        temperature_2m_max: [NaN, '26', Infinity, 28],
        precipitation_probability_max: [0, -1, 101, 100],
      },
    });
    const weather = await getWeather(city);
    expect(weather.current).toEqual({
      temperatureC: 0,
      apparentTemperatureC: null,
      relativeHumidityPercent: null,
      windSpeedKmh: null,
      precipitationMm: null,
      surfacePressureHpa: null,
      weatherCode: 0,
    });
    expect(weather.forecast.map((day) => day.minTemperatureC)).toEqual([0, null, 20, null, null]);
    expect(weather.forecast.map((day) => day.maxTemperatureC)).toEqual([
      null,
      null,
      null,
      28,
      null,
    ]);
    expect(weather.forecast.map((day) => day.precipitationProbabilityMaxPercent)).toEqual([
      0,
      null,
      null,
      100,
      null,
    ]);
  });

  it('mantém probabilidade de precipitação null como indisponível', async () => {
    const body = weatherResponse();
    mockResponse({
      ...body,
      daily: {
        ...body.daily,
        precipitation_probability_max: [null, 10, 20, 30, 80],
      },
    });

    const weather = await getWeather(city);

    expect(weather.forecast[0].precipitationProbabilityMaxPercent).toBeNull();
  });

  it('mantém cinco datas consecutivas e preenche dias ausentes com null', async () => {
    mockResponse({
      timezone: 'Pacific/Kiritimati',
      current: {},
      daily: {
        time: ['2026-12-30', '2027-01-01'],
        temperature_2m_min: [10, 12],
      },
    });
    const weather = await getWeather(city);
    expect(weather.current).toEqual({
      temperatureC: null,
      apparentTemperatureC: null,
      relativeHumidityPercent: null,
      windSpeedKmh: null,
      precipitationMm: null,
      surfacePressureHpa: null,
      weatherCode: null,
    });
    expect(weather.forecast.map((day) => day.date)).toEqual([
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
      '2027-01-03',
    ]);
    expect(weather.forecast.map((day) => day.minTemperatureC)).toEqual([10, null, 12, null, null]);
    expect(weather.forecast[1]).toEqual({
      date: '2026-12-31',
      minTemperatureC: null,
      maxTemperatureC: null,
      weatherCode: null,
      precipitationProbabilityMaxPercent: null,
    });
    expect(weather.forecast.map((day) => day.precipitationProbabilityMaxPercent)).toEqual([
      null,
      null,
      null,
      null,
      null,
    ]);
  });

  it('limita a saída a cinco dias mesmo se o provedor enviar mais', async () => {
    const body = weatherResponse();
    body.daily.time.push('2026-11-03');
    mockResponse(body);
    expect((await getWeather(city)).forecast).toHaveLength(5);
  });

  it.each([
    { current: undefined },
    { daily: undefined },
    { current: null },
    { daily: null },
    { current: [] },
    { daily: [] },
    { timezone: undefined },
    { timezone: '' },
    { timezone: 'Fuso/Inexistente' },
    { daily: {} },
    { daily: { time: [] } },
    { daily: { time: ['2026-02-30'] } },
    { daily: { time: ['2026-10-29', '2026-10-29'] } },
    { daily: { time: ['2026-10-30', '2026-10-29'] } },
    { error: true },
  ])('rejeita resposta incompleta ou inválida: %j', async (override) => {
    mockResponse({ ...weatherResponse(), ...override });
    await expect(getWeather(city)).rejects.toThrow(WeatherServiceError);
  });

  it.each([400, 429, 500])('rejeita HTTP %s', async (status) => {
    mockResponse({}, status);
    await expect(getWeather(city)).rejects.toMatchObject({
      message: 'Não foi possível consultar o clima. Tente novamente mais tarde.',
      code: 'invalid-response',
    });
  });

  it('rejeita JSON malformado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('JSON inválido')));
    await expect(getWeather(city)).rejects.toThrow(WeatherServiceError);
  });

  it('converte falhas de rede offline em erro amigável', async () => {
    const error = new TypeError('Failed to fetch');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.',
      code: 'network',
      cause: error,
    });
  });

  it('classifica resposta HTTP inválida sem expor o status técnico', async () => {
    mockResponse({ error: 'Detalhes internos do provedor' }, 503);
    const failure = getWeather(city);
    await expect(failure).rejects.toMatchObject({
      message: 'Não foi possível consultar o clima. Tente novamente mais tarde.',
      code: 'invalid-response',
    });
  });
});

describe('searchCities', () => {
  it.each(['', '   ', '\t\n'])('retorna lista vazia sem chamar a rede para %j', async (name) => {
    const fetchMock = mockResponse({});
    await expect(searchCities(name)).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('codifica o termo com trim e mapeia os resultados para City', async () => {
    const fetchMock = mockResponse({ results: [cityResult] });
    const name = "São João-d'Oeste 東京 &name=outro";

    await expect(searchCities(`  ${name}  `)).resolves.toEqual([
      {
        id: '3448439',
        name: 'São Paulo',
        administrativeArea: 'São Paulo',
        country: 'Brasil',
        latitude: -23.5475,
        longitude: -46.6361,
      },
    ]);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=10&language=pt&format=json`,
      { signal: expect.any(AbortSignal) },
    );
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get('name')).toBe(name);
  });

  it.each([
    {},
    { results: [] },
  ])('retorna lista vazia quando não há resultados: %j', async (body) => {
    mockResponse(body);
    await expect(searchCities('Inexistente')).resolves.toEqual([]);
  });

  it('preserva campos opcionais ausentes e distingue locais sem ID', async () => {
    mockResponse({
      results: [
        { name: 'Cidade', latitude: 0, longitude: 0 },
        { name: 'Cidade', latitude: 1, longitude: 0 },
      ],
    });
    const cities = await searchCities('Cidade');
    expect(cities).toHaveLength(2);
    expect(cities[0]).toMatchObject({
      administrativeArea: null,
      country: null,
      latitude: 0,
      longitude: 0,
    });
    expect(cities[0].id).not.toBe(cities[1].id);
  });

  it.each([
    400, 429, 500,
  ])('lança WeatherServiceError para HTTP %s sem ler o corpo', async (status) => {
    const json = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status, json }));
    await expect(searchCities('Cidade')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      code: 'invalid-response',
    });
    expect(json).not.toHaveBeenCalled();
  });

  it.each([
    null,
    [],
    { error: true, reason: 'Detalhes privados do provedor' },
    { results: null },
    { results: {} },
    { results: [null] },
    { results: [{ ...cityResult, name: ' ' }] },
    { results: [{ ...cityResult, latitude: 91 }] },
    { results: [{ ...cityResult, longitude: -181 }] },
    { results: [{ ...cityResult, latitude: null }] },
    { results: [{ ...cityResult, longitude: '0' }] },
  ])('rejeita resposta inválida: %j', async (body) => {
    mockResponse(body);
    await expect(searchCities('Cidade')).rejects.toThrow(WeatherServiceError);
  });

  it('rejeita JSON malformado com WeatherServiceError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('JSON inválido')));
    await expect(searchCities('Cidade')).rejects.toThrow(WeatherServiceError);
  });

  it('converte falha de rede offline sem retornar lista vazia', async () => {
    const error = new TypeError('Failed to fetch');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));
    await expect(searchCities('Cidade')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.',
      code: 'network',
      cause: error,
    });
  });
});

describe('fetchWithTimeout', () => {
  it('retorna a resposta e limpa o temporizador após sucesso', async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const response = new Response('{}');
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchWithTimeout('https://example.com')).resolves.toBe(response);
    const signal = fetchMock.mock.calls[0][1]?.signal;
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(signal?.aborted).toBe(false);
  });

  it.each([
    [
      'AbortError',
      'A solicitação excedeu o tempo limite de 10 segundos. Verifique sua conexão e tente novamente.',
      'timeout',
    ],
    [
      'TypeError',
      'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.',
      'network',
    ],
  ])('converte %s e limpa o temporizador', async (name, message, code) => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const cause = Object.assign(new Error('Detalhes internos'), { name });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(cause));

    await expect(fetchWithTimeout('https://example.com')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message,
      code,
      cause,
    });
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['search', 'weather'])('aborta %s exatamente após 10 segundos', async (operation) => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    let requestSignal: AbortSignal | null | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(
        (_url, init) =>
          new Promise<Response>((_resolve, reject) => {
            requestSignal = init?.signal;
            requestSignal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }),
      ),
    );

    const request = operation === 'search' ? searchCities('Cidade') : getWeather(city);
    const rejection = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message:
        'A solicitação excedeu o tempo limite de 10 segundos. Verifique sua conexão e tente novamente.',
      code: 'timeout',
    });
    await vi.advanceTimersByTimeAsync(9_999);
    expect(requestSignal?.aborted).toBe(false);
    expect(clearTimeoutSpy).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(requestSignal?.aborted).toBe(true);
    await rejection;
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('mantém o timeout ativo enquanto lê o corpo JSON', async () => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | null | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation((_url, init) => {
        requestSignal = init?.signal;
        return Promise.resolve({
          ok: true,
          json: () =>
            new Promise((_resolve, reject) => {
              requestSignal?.addEventListener('abort', () => {
                reject(new DOMException('Aborted', 'AbortError'));
              });
            }),
        } as Response);
      }),
    );

    const request = searchCities('Cidade');
    const rejection = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      code: 'timeout',
      message:
        'A solicitação excedeu o tempo limite de 10 segundos. Verifique sua conexão e tente novamente.',
    });

    await vi.advanceTimersByTimeAsync(10_000);
    expect(requestSignal?.aborted).toBe(true);
    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });
});
