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

export async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (cause) {
    if (isRecord(cause) && cause.name === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais.', { cause }, 'timeout');
    }
    throw new WeatherServiceError('Falha de rede.', { cause }, 'network');
  } finally {
    clearTimeout(timeout);
  }
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
    throw new WeatherServiceError('Resposta inválida ao buscar cidades.');
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

  const response = await fetchWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`,
  );
  if (!response.ok) {
    throw new WeatherServiceError(`Não foi possível buscar cidades (HTTP ${response.status}).`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (cause) {
    throw new WeatherServiceError('Resposta inválida ao buscar cidades.', {
      cause,
    });
  }

  if (!isRecord(data) || data.error) {
    throw new WeatherServiceError('Resposta inválida ao buscar cidades.');
  }
  if (!('results' in data)) return [];
  if (!Array.isArray(data.results)) {
    throw new WeatherServiceError('Resposta inválida ao buscar cidades.');
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
  const response = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) {
    throw new WeatherServiceError(`Não foi possível consultar o clima (HTTP ${response.status}).`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (cause) {
    throw new WeatherServiceError('Resposta inválida ao consultar o clima.', { cause });
  }
  if (
    !isRecord(data) ||
    data.error ||
    !isRecord(data.current) ||
    !isRecord(data.daily) ||
    typeof data.timezone !== 'string' ||
    data.timezone.trim() === ''
  ) {
    throw new WeatherServiceError('Resposta incompleta ou inválida ao consultar o clima.');
  }
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: data.timezone });
  } catch (cause) {
    throw new WeatherServiceError('Fuso horário inválido na resposta do clima.', { cause });
  }

  const { current, daily } = data;
  const dates: unknown = daily.time;
  if (
    !Array.isArray(dates) ||
    dates.length === 0 ||
    !dates.every(isISODate) ||
    dates.some((date, index) => index > 0 && date <= dates[index - 1])
  ) {
    throw new WeatherServiceError('Período inválido na resposta do clima.');
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
      precipitationProbabilityMaxPercent: percentage(
        precipitationProbability === null ? 0 : precipitationProbability,
      ),
    };
  });

  return { city, timezone: data.timezone, periodStart, current: currentWeather, forecast };
}
