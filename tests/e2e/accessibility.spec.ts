import { expect, test } from '@playwright/test';
import { mockWeatherData } from '../../src/mocks/weather';

const geocodingResponse = {
  results: [
    {
      id: mockWeatherData.city.id,
      name: mockWeatherData.city.name,
      admin1: mockWeatherData.city.administrativeArea,
      country: mockWeatherData.city.country,
      latitude: mockWeatherData.city.latitude,
      longitude: mockWeatherData.city.longitude,
    },
  ],
};
const forecastResponse = {
  timezone: mockWeatherData.timezone,
  current: {
    temperature_2m: mockWeatherData.current.temperatureC,
    apparent_temperature: mockWeatherData.current.apparentTemperatureC,
    relative_humidity_2m: mockWeatherData.current.relativeHumidityPercent,
    wind_speed_10m: mockWeatherData.current.windSpeedKmh,
    precipitation: mockWeatherData.current.precipitationMm,
    surface_pressure: mockWeatherData.current.surfacePressureHpa,
    weather_code: mockWeatherData.current.weatherCode,
  },
  daily: {
    time: mockWeatherData.forecast.map((day) => day.date),
    temperature_2m_min: mockWeatherData.forecast.map((day) => day.minTemperatureC),
    temperature_2m_max: mockWeatherData.forecast.map((day) => day.maxTemperatureC),
    weather_code: mockWeatherData.forecast.map((day) => day.weatherCode),
    precipitation_probability_max: mockWeatherData.forecast.map(
      (day) => day.precipitationProbabilityMaxPercent,
    ),
  },
};

test.beforeEach(async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: geocodingResponse }),
  );
  await page.route('https://api.open-meteo.com/**', (route) =>
    route.fulfill({ json: forecastResponse }),
  );
});

for (const width of [320, 768, 1024, 1440]) {
  test(`layout sem overflow em ${width}px, incluindo texto longo e estados`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    let mode: 'success' | 'empty' | 'error' | 'loading' = 'success';
    let release!: () => void;
    await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
      if (mode === 'loading')
        await new Promise<void>((resolve) => {
          release = resolve;
        });
      await route.fulfill({
        status: mode === 'error' ? 500 : 200,
        json: mode === 'empty' ? {} : geocodingResponse,
      });
    });
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Consulte o clima de uma cidade' }),
    ).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    for (const state of ['loading', 'success', 'empty', 'error'] as const) {
      mode = state;
      await page.getByRole('searchbox').fill('Cidade'.repeat(40));
      await page.getByRole('button', { name: 'Buscar', exact: true }).click();
      if (state === 'loading') await expect(page.getByRole('status')).toBeVisible();
      if (state === 'success') await expect(page.getByRole('article')).toHaveCount(5);
      if (state === 'empty')
        await expect(page.getByRole('region', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
      if (state === 'error') await expect(page.getByRole('alert')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      if (state === 'loading') {
        await expect.poll(() => typeof release).toBe('function');
        mode = 'success';
        release();
        await expect(page.getByRole('article')).toHaveCount(5);
      }
    }

    mode = 'success';
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await page.getByRole('button', { name: '°F', exact: true }).click();
    await expect(page.getByRole('article')).toHaveCount(5);
    for (const card of await page.getByRole('article').all()) {
      expect(
        await card.evaluate((element) => element.scrollWidth - element.clientWidth),
      ).toBeLessThanOrEqual(1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );

    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  });
}

test('teclado: skip link, validação, unidade, retry e foco visível', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();

  const input = page.getByRole('searchbox', { name: 'Cidade' });
  await input.focus();
  await page.keyboard.press('Enter');
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAccessibleDescription('Digite o nome de uma cidade.');
  await input.fill('Salvador');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Salvador', exact: true })).toBeVisible();
  await input.focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Buscar', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  const celsius = page.getByRole('button', { name: '°C', exact: true });
  await expect(celsius).toBeFocused();
  expect(await celsius.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe('none');
  expect(
    await celsius.evaluate((element) => getComputedStyle(element).textDecorationLine),
  ).toContain('underline');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: '°F', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('[aria-live="polite"]')).toContainText('Fahrenheit');

  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ status: 500, json: {} }),
  );
  await input.fill('Outra cidade');
  await input.press('Enter');
  const retry = page.getByRole('button', { name: 'Tentar novamente' });
  await expect(retry).toBeVisible();
  await page.unroute('https://geocoding-api.open-meteo.com/**');
  await page.route('https://geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: geocodingResponse }),
  );
  await retry.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await expect(page.getByText('77,7 °F', { exact: true })).toBeVisible();
});

test('contraste de texto, borda do input e indicador de foco', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox').fill('Salvador');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await page.getByRole('region', { name: 'Salvador', exact: true }).waitFor();
  const failures = await page.evaluate(() => {
    function rgba(color: string): number[] {
      return color.match(/[\d.]+/g)?.map(Number) ?? [];
    }
    function blend(foreground: number[], background: number[]): number[] {
      const alpha = foreground[3] ?? 1;
      return background.map((channel, index) => foreground[index] * alpha + channel * (1 - alpha));
    }
    function background(element: Element | null): number[] {
      const ancestors: Element[] = [];
      for (let node = element; node; node = node.parentElement) ancestors.unshift(node);
      // Base mais clara do gradiente, para não superestimar contraste.
      return ancestors.reduce(
        (color, node) => blend(rgba(getComputedStyle(node).backgroundColor), color),
        [17, 22, 42],
      );
    }
    function luminance(color: number[]): number {
      return color.reduce((sum, channel, index) => {
        const value = channel / 255;
        const linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        return sum + linear * [0.2126, 0.7152, 0.0722][index];
      }, 0);
    }
    function contrast(first: number[], second: number[]): number {
      const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
      return (values[0] + 0.05) / (values[1] + 0.05);
    }
    const failures: string[] = [];
    for (const element of document.querySelectorAll('h1,h2,h3,p,dt,dd,label,button,input,footer')) {
      const style = getComputedStyle(element);
      const bg = background(element);
      const color = blend(rgba(style.color), bg);
      const ratio = contrast(color, bg);
      const large =
        Number.parseFloat(style.fontSize) >= 24 ||
        (Number.parseFloat(style.fontSize) >= 18.66 &&
          Number.parseInt(style.fontWeight, 10) >= 700);
      if (ratio < (large ? 3 : 4.5)) failures.push(`${element.textContent}: ${ratio.toFixed(2)}`);
      if (element instanceof HTMLInputElement) {
        const border = blend(rgba(style.borderColor), bg);
        const placeholder = blend(rgba(getComputedStyle(element, '::placeholder').color), bg);
        if (contrast(border, bg) < 3) failures.push('Borda do campo < 3:1');
        if (contrast(placeholder, bg) < 4.5) failures.push('Placeholder < 4,5:1');
        const ring = rgba(style.getPropertyValue('--tw-ring-color'));
        if (contrast(ring, background(element.parentElement)) < 3) failures.push('Foco < 3:1');
      }
    }
    return failures;
  });
  expect(failures).toEqual([]);
});

test('movimento reduzido desativa spinner sem remover a mensagem', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://api.open-meteo.com/**', () => {});
  await page.goto('/');
  await page.getByRole('searchbox').fill('Salvador');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Carregando dados meteorológicos');
  await expect(page.getByRole('status').locator('[aria-hidden="true"]')).toHaveCSS(
    'animation-name',
    'none',
  );
});
