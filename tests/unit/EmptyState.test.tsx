import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';

describe('EmptyState', () => {
  it('mostra título e dica em uma região acessível', () => {
    render(<EmptyState />);
    const region = screen.getByRole('region', { name: 'Nenhuma cidade encontrada' });

    expect(
      within(region).getByRole('heading', { name: 'Nenhuma cidade encontrada' }),
    ).toBeVisible();
    expect(
      within(region).getByText('Verifique a grafia ou tente buscar pelo nome de outra cidade.'),
    ).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('mantém identificadores únicos ao renderizar mais de uma instância', () => {
    render(
      <>
        <EmptyState />
        <EmptyState />
      </>,
    );

    const regions = screen.getAllByRole('region', { name: 'Nenhuma cidade encontrada' });
    expect(regions[0].getAttribute('aria-labelledby')).not.toBe(
      regions[1].getAttribute('aria-labelledby'),
    );
  });
});
