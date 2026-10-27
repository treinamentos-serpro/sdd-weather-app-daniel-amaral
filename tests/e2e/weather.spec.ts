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
  let forecastRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: {} }),
  );
  await page.route('https://api.open-meteo.com/**', (route) => {
    forecastRequests += 1;
    return route.fulfill({ json: forecastResponse });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toHaveCount(0);
  expect(forecastRequests).toBe(0);
});

test('valida busca vazia ou composta somente por espaços sem consultar as APIs', async ({ page }) => {
  let geocodingRequests = 0;
  let forecastRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', (route) => {
    geocodingRequests += 1;
    return route.fulfill({ json: { results: [city] } });
  });
  await page.route('https://api.open-meteo.com/**', (route) => {
    forecastRequests += 1;
    return route.fulfill({ json: forecastResponse });
  });

  await page.goto('/');
  const search = page.getByRole('searchbox', { name: 'Cidade' });
  const submit = page.getByRole('button', { name: 'Buscar', exact: true });

  for (const query of ['', '   ']) {
    await search.fill(query);
    await submit.click();
    await expect(page.getByRole('alert')).toContainText('Digite o nome de uma cidade.');
    expect(geocodingRequests).toBe(0);
    expect(forecastRequests).toBe(0);
  }
});

test('preserva caracteres especiais e codifica o termo como um único parâmetro', async ({
  page,
}) => {
  const query = "São João-d'Aliança 東京 &name=outro";
  const result = { ...city, name: query };
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: { results: [result] } }),
  );
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({ json: forecastResponse }),
  );
  const geocodingRequest = page.waitForRequest((request) =>
    request.url().startsWith('https://geocoding-api.open-meteo.com/'),
  );

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill(`  ${query}  `);
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  const request = await geocodingRequest;
  const requestUrl = new URL(request.url());
  expect(requestUrl.searchParams.get('name')).toBe(query);
  expect([...requestUrl.searchParams.keys()]).toContain('name');
  expect([...requestUrl.searchParams.keys()]).not.toContain('outro');
  await expect(page.getByRole('heading', { name: query, exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: query, exact: true })).toBeVisible();
});

test('mantém cinco dias e marca como indisponíveis os campos de forecast ausentes', async ({
  page,
}) => {
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: { results: [city] } }),
  );
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({
      json: {
        timezone: 'America/Bahia',
        current: { temperature_2m: 21, weather_code: 0 },
        daily: {
          time: dates.slice(0, 2),
          temperature_2m_min: [15],
          temperature_2m_max: [25],
          weather_code: [0],
          precipitation_probability_max: [0],
        },
      },
    }),
  );

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Salvador');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  const currentWeather = page.getByRole('region', { name: 'Salvador', exact: true });
  await expect(currentWeather.getByText('21,0 °C', { exact: true })).toBeVisible();
  await expect(currentWeather.getByText('Sensação térmica: Indisponível')).toBeVisible();
  const cards = page.getByRole('article');
  await expect(cards).toHaveCount(5);
  await expect(cards.nth(0).getByText('15,0 °C', { exact: true })).toBeVisible();
  await expect(cards.nth(0).getByText('25,0 °C', { exact: true })).toBeVisible();
  await expect(cards.nth(0).getByText('0 %', { exact: true })).toBeVisible();
  await expect(cards.nth(4).getByText('Indisponível').first()).toBeVisible();
  await expect(page.getByText(/NaN|undefined|null/)).toHaveCount(0);
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
  await expect(alert).toContainText('Não foi possível consultar o clima');
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
