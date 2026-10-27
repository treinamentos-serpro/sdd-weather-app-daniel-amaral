export type Unit = 'celsius' | 'fahrenheit';

export type TemperatureUnit = Unit;

export interface City {
  id: string;
  name: string;
  administrativeArea: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number | null;
  apparentTemperatureC: number | null;
  relativeHumidityPercent: number | null;
  windSpeedKmh: number | null;
  precipitationMm: number | null;
  surfacePressureHpa: number | null;
  weatherCode: number | null;
}

export interface ForecastDay {
  /** Data local no formato ISO YYYY-MM-DD. */
  date: string;
  minTemperatureC: number | null;
  maxTemperatureC: number | null;
  weatherCode: number | null;
  precipitationProbabilityMaxPercent: number | null;
}

export interface WeatherData {
  city: City;
  timezone: string;
  /** Primeiro dia local da previsão no formato ISO YYYY-MM-DD. */
  periodStart: string;
  current: CurrentWeather;
  /** Cinco datas locais consecutivas, incluindo o primeiro dia do período. */
  forecast: ForecastDay[];
}

export type WeatherSnapshot = WeatherData;
