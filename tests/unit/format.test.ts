import { describe, expect, it } from 'vitest';
import { getDayLabel, getShortDate } from '../../src/lib/format';

describe('format', () => {
  it('rotula os dois primeiros dias como hoje e amanhã', () => {
    expect(getDayLabel(0, '2026-10-27')).toBe('Hoje');
    expect(getDayLabel(1, '2026-10-28')).toBe('Amanhã');
  });

  it('usa o dia da semana para os demais índices', () => {
    expect(getDayLabel(2, '2026-10-29')).toBe('qui.');
  });

  it('formata a data curta como dia e mês em pt-BR', () => {
    expect(getShortDate('2026-10-27')).toBe('27/10');
  });
});
