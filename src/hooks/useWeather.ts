import { useCallback, useEffect, useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface WeatherState {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
}

type Operation = { type: 'search'; name: string } | { type: 'weather'; city: City };

export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    status: 'idle',
    data: null,
    cities: [],
    error: null,
    query: '',
  });
  const generation = useRef(0);
  const lastOperation = useRef<Operation | null>(null);

  useEffect(
    () => () => {
      generation.current += 1;
    },
    [],
  );

  const reportError = useCallback((cause: unknown, request: number) => {
    if (generation.current !== request) return;
    setState((previous) => ({
      ...previous,
      status: 'error',
      data: null,
      error: cause instanceof Error ? cause.message : 'Não foi possível consultar o clima.',
    }));
  }, []);

  const loadWeather = useCallback(async (city: City, request: number) => {
    lastOperation.current = { type: 'weather', city };
    const data = await getWeather(city);
    if (generation.current !== request) return;
    setState((previous) => ({ ...previous, status: 'success', data, error: null }));
  }, []);

  const search = useCallback(
    async (name: string) => {
      const request = ++generation.current;
      const query = name.trim();
      lastOperation.current = { type: 'search', name: query };
      setState({
        status: query ? 'loading' : 'error',
        data: null,
        cities: [],
        error: query ? null : 'Digite o nome de uma cidade.',
        query,
      });
      if (!query) return;

      try {
        const cities = await searchCities(query);
        if (generation.current !== request) return;
        setState((previous) => ({
          ...previous,
          cities,
          status: cities.length ? 'loading' : 'empty',
        }));
        if (cities.length) await loadWeather(cities[0], request);
      } catch (cause) {
        reportError(cause, request);
      }
    },
    [loadWeather, reportError],
  );

  const selectCity = useCallback(
    async (city: City) => {
      const request = ++generation.current;
      setState((previous) => ({ ...previous, status: 'loading', data: null, error: null }));
      try {
        await loadWeather(city, request);
      } catch (cause) {
        reportError(cause, request);
      }
    },
    [loadWeather, reportError],
  );

  const retry = useCallback(async () => {
    const operation = lastOperation.current;
    if (operation?.type === 'search') await search(operation.name);
    else if (operation?.type === 'weather') await selectCity(operation.city);
  }, [search, selectCity]);

  return { ...state, search, selectCity, retry };
}

export default useWeather;
