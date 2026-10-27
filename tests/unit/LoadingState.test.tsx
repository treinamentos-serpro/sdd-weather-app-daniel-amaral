import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LoadingState from '../../src/components/states/LoadingState';

describe('LoadingState', () => {
  it('anuncia consulta meteorológica por padrão', () => {
    render(<LoadingState />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados meteorológicos…');
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true');
  });

  it('distingue busca de cidades e consulta meteorológica', () => {
    const { rerender } = render(<LoadingState operation="search" />);
    expect(screen.getByRole('status')).toHaveTextContent('Buscando cidades…');

    rerender(<LoadingState operation="weather" />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados meteorológicos…');
    expect(screen.queryByText('Buscando cidades…')).not.toBeInTheDocument();
  });
});
