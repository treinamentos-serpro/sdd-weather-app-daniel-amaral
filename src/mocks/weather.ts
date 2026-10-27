import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: '3450554',
    name: 'Salvador',
    administrativeArea: 'Bahia',
    country: 'Brasil',
    latitude: -12.9714,
    longitude: -38.5014,
  },
  timezone: 'America/Bahia',
  periodStart: '2026-10-27',
  current: {
    temperatureC: 25.4,
    apparentTemperatureC: 27.1,
    relativeHumidityPercent: 68,
    windSpeedKmh: 12.5,
    precipitationMm: 0.2,
    surfacePressureHpa: 1013.2,
    weatherCode: 2,
  },
  forecast: [
    {
      date: '2026-10-27',
      minTemperatureC: 18.2,
      maxTemperatureC: 27.5,
      weatherCode: 2,
      precipitationProbabilityMaxPercent: 20,
    },
    {
      date: '2026-10-28',
      minTemperatureC: 19.1,
      maxTemperatureC: 28.3,
      weatherCode: 0,
      precipitationProbabilityMaxPercent: 0,
    },
    {
      date: '2026-10-29',
      minTemperatureC: 18.7,
      maxTemperatureC: 26.4,
      weatherCode: 3,
      precipitationProbabilityMaxPercent: 35,
    },
    {
      date: '2026-10-30',
      minTemperatureC: 17.5,
      maxTemperatureC: 23.8,
      weatherCode: 61,
      precipitationProbabilityMaxPercent: 80,
    },
    {
      date: '2026-10-31',
      minTemperatureC: 16.9,
      maxTemperatureC: 25.2,
      weatherCode: 1,
      precipitationProbabilityMaxPercent: 10,
    },
  ],
};
