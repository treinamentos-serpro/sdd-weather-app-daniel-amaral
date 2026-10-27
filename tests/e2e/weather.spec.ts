import { expect, test, type Page } from '@playwright/test';

const city = {
  id: 1,
  name: 'Salvador',
  admin1: 'Bahia',
  country: 'Brasil',
  latitude: -12.9714,
  longitude: -38.5014,
};

const dates = ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'];

const forecastResponse = {
  timezone: 'America/Bahia',
  current: {
    temperature_2m: 0,
    apparent_temperature: 0,
    relative_humidity_2m: 70,
    wind_speed_10m: 10,
    precipitation: 0,
    surface_pressure: 1013,
    weather_code: 0,
  },
  daily: {
    time: dates,
    temperature_2m_min: [0, 1, 2, 3, 4],
    temperature_2m_max: [10, 11, 12, 13, 14],
    weather_code: [0, 1, 2, 3, 61],
    precipitation_probability_max: [0, 10, 20, 30, 40],
  },
};

async function mockWeatherApis(
  page: Page,
  geocodingResponse: { results?: typeof city[] } = { results: [city] },
) {
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: geocodingResponse }),
  );
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({ json: forecastResponse }),
  );
}

test('busca uma cidade, mostra a previsão e converte a temperatura para Fahrenheit', async ({
  page,
}) => {
  await mockWeatherApis(page);

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Salvador');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Salvador' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  const currentWeather = page.getByRole('region', { name: 'Salvador', exact: true });
  await expect(currentWeather.getByText('0,0 °C', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: '°F', exact: true }).click();

  await expect(currentWeather.getByText('32,0 °F', { exact: true })).toBeVisible();
});

test('mostra o estado vazio quando o geocoding não retorna results', async ({ page }) => {
  await mockWeatherApis(page, {});

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
});

test('recupera erro HTTP do forecast por meio da ação de nova tentativa', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: { results: [city] } }),
  );
  await page.route('https://api.open-meteo.com/**', (route) => {
    forecastRequests += 1;
    return forecastRequests === 1
      ? route.fulfill({ status: 503, json: {} })
      : route.fulfill({ json: forecastResponse });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Salvador');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  const alert = page.getByRole('alert');
  await expect(alert).toContainText('Erro ao consultar o clima');
  await expect(alert).toContainText('HTTP 503');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();

  await expect(page.getByRole('region', { name: 'Salvador', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  expect(forecastRequests).toBe(2);
});

test('renderiza clima e previsão no viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockWeatherApis(page);

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Salvador');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  const currentWeather = page.getByRole('region', { name: 'Salvador', exact: true });
  const forecast = page.getByRole('region', { name: 'Previsão de 5 dias' });
  await expect(currentWeather.getByRole('heading', { name: 'Salvador' })).toBeVisible();
  await expect(currentWeather.getByText('0,0 °C', { exact: true })).toBeVisible();
  await expect(forecast.getByRole('article')).toHaveCount(5);
});
