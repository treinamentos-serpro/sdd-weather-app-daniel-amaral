import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('oferece região de busca, campo com label e botão acessíveis', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeEnabled();
    expect(screen.getByLabelText('Cidade')).toHaveAttribute('type', 'search');
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeEnabled();
  });

  it('envia pelo botão sem buscar durante a digitação', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), '  São Paulo  ');
    expect(onSearch).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São Paulo');
  });

  it('envia por Enter preservando Unicode, hífen, apóstrofo e espaços internos', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(
      screen.getByRole('searchbox', { name: 'Cidade' }),
      "  São  João-d'Aliança  {Enter}",
    );

    expect(onSearch).toHaveBeenCalledExactlyOnceWith("São  João-d'Aliança");
  });

  it.each(['', '   '])('rejeita entrada vazia %j com erro associado ao campo', async (value) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });

    if (value) await user.type(input, value);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Digite o nome de uma cidade.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Digite o nome de uma cidade.');
    expect(input).toHaveFocus();
  });

  it('limpa o erro ao editar e permite uma nova busca válida', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });

    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.type(input, 'Recife');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');

    await user.keyboard('{Enter}');
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Recife');
  });

  it('bloqueia campo, botão e submissão quando disabled, permitindo reativação', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const { rerender } = render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    await user.type(input, 'Recife');

    rerender(<SearchBar onSearch={onSearch} disabled />);

    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    fireEvent.submit(screen.getByRole('search', { name: 'Buscar cidade' }));
    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(<SearchBar onSearch={onSearch} disabled={false} />);
    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toHaveAttribute(
      'aria-busy',
      'false',
    );
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Recife');
  });

  it('permite acessar campo e botão com teclado', async () => {
    const user = userEvent.setup();
    render(<SearchBar onSearch={vi.fn()} />);

    await user.tab();
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveFocus();
  });
});
