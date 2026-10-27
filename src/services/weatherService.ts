import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    options?: ErrorOptions,
    readonly code: 'invalid-response' | 'timeout' | 'network' = 'invalid-response',
  ) {
    super(message, options);
    this.name = 'WeatherServiceError';
  }
}

const timeoutMessage =
  'A solicitação excedeu o tempo limite de 10 segundos. Verifique sua conexão e tente novamente.';
const networkMessage =
  'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.';
const searchResponseMessage = 'Não foi possível buscar cidades. Tente novamente mais tarde.';
const weatherResponseMessage = 'Não foi possível consultar o clima. Tente novamente mais tarde.';

function isAbortError(value: unknown): boolean {
  return isRecord(value) && value.name === 'AbortError';
}

async function requestWithTimeout<T>(
  url: string,
  readResponse: (response: Response) => Promise<T> | T,
): Promise<T> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const timeoutRequest = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new WeatherServiceError(timeoutMessage, undefined, 'timeout'));
    }, 10_000);
  });

  const request = Promise.resolve()
    .then(() => fetch(url, { signal: controller.signal }))
    .then(readResponse)
    .catch((cause) => {
      if (cause instanceof WeatherServiceError) throw cause;
      if (isAbortError(cause)) {
        throw new WeatherServiceError(timeoutMessage, { cause }, 'timeout');
      }
      throw new WeatherServiceError(networkMessage, { cause }, 'network');
    });

  try {
    return await Promise.race([request, timeoutRequest]);
  } finally {
    if (timeout !== null) clearTimeout(timeout);
  }
}

export async function fetchWithTimeout(url: string): Promise<Response> {
  return requestWithTimeout(url, (response) => response);
}

async function fetchJsonWithTimeout(url: string, operationMessage: string): Promise<unknown> {
  return requestWithTimeout(url, async (response) => {
    if (!response.ok) {
      throw new WeatherServiceError(operationMessage, undefined, 'invalid-response');
    }

    try {
      return await response.json();
    } catch (cause) {
      if (isAbortError(cause)) throw cause;
      throw new WeatherServiceError(operationMessage, { cause }, 'invalid-response');
    }
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeCity(result: unknown): City {
  if (
    !isRecord(result) ||
    typeof result.name !== 'string' ||
    result.name.trim() === '' ||
    typeof result.latitude !== 'number' ||
    !Number.isFinite(result.latitude) ||
    Math.abs(result.latitude) > 90 ||
    typeof result.longitude !== 'number' ||
    !Number.isFinite(result.longitude) ||
    Math.abs(result.longitude) > 180
  ) {
    throw new WeatherServiceError(searchResponseMessage);
  }

  const administrativeArea = typeof result.admin1 === 'string' ? result.admin1 : null;
  const country = typeof result.country === 'string' ? result.country : null;
  const id =
    (typeof result.id === 'number' && Number.isFinite(result.id)) ||
    (typeof result.id === 'string' && result.id.trim() !== '')
      ? String(result.id)
      : JSON.stringify([
          result.name,
          administrativeArea,
          country,
          result.latitude,
          result.longitude,
        ]);

  return {
    id,
    name: result.name,
    administrativeArea,
    country,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (query === '') return [];

  const data = await fetchJsonWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`,
    searchResponseMessage,
  );

  if (!isRecord(data) || data.error) {
    throw new WeatherServiceError(searchResponseMessage);
  }
  if (!('results' in data)) return [];
  if (!Array.isArray(data.results)) {
    throw new WeatherServiceError(searchResponseMessage);
  }

  return data.results.map(normalizeCity);
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function percentage(value: unknown): number | null {
  const number = finiteNumber(value);
  return number !== null && number >= 0 && number <= 100 ? number : null;
}

function isISODate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
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
  const data = await fetchJsonWithTimeout(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    weatherResponseMessage,
  );
  if (
    !isRecord(data) ||
    data.error ||
    !isRecord(data.current) ||
    !isRecord(data.daily) ||
    typeof data.timezone !== 'string' ||
    data.timezone.trim() === ''
  ) {
    throw new WeatherServiceError(weatherResponseMessage);
  }
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: data.timezone });
  } catch (cause) {
    throw new WeatherServiceError(weatherResponseMessage, { cause });
  }

  const { current, daily } = data;
  const dates: unknown = daily.time;
  if (
    !Array.isArray(dates) ||
    dates.length === 0 ||
    !dates.every(isISODate) ||
    dates.some((date, index) => index > 0 && date <= dates[index - 1])
  ) {
    throw new WeatherServiceError(weatherResponseMessage);
  }
  const periodStart = dates[0];
  const currentWeather: CurrentWeather = {
    temperatureC: finiteNumber(current.temperature_2m),
    apparentTemperatureC: finiteNumber(current.apparent_temperature),
    relativeHumidityPercent: percentage(current.relative_humidity_2m),
    windSpeedKmh: finiteNumber(current.wind_speed_10m),
    precipitationMm: finiteNumber(current.precipitation),
    surfacePressureHpa: finiteNumber(current.surface_pressure),
    weatherCode: finiteNumber(current.weather_code),
  };
  const dailyValue = (field: string, index: number): unknown =>
    index >= 0 && Array.isArray(daily[field]) ? daily[field][index] : undefined;

  const forecast: ForecastDay[] = Array.from({ length: 5 }, (_, offset) => {
    const day = new Date(`${periodStart}T00:00:00Z`);
    day.setUTCDate(day.getUTCDate() + offset);
    const date = day.toISOString().slice(0, 10);
    const index = dates.indexOf(date);
    const precipitationProbability = dailyValue('precipitation_probability_max', index);
    return {
      date,
      minTemperatureC: finiteNumber(dailyValue('temperature_2m_min', index)),
      maxTemperatureC: finiteNumber(dailyValue('temperature_2m_max', index)),
      weatherCode: finiteNumber(dailyValue('weather_code', index)),
      precipitationProbabilityMaxPercent: percentage(precipitationProbability),
    };
  });

  return { city, timezone: data.timezone, periodStart, current: currentWeather, forecast };
}
