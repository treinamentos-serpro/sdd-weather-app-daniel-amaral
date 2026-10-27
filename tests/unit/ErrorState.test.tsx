import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ErrorState from '../../src/components/states/ErrorState';

describe('ErrorState', () => {
  it.each([
    ['timeout', 'O tempo limite de espera foi excedido. Tente novamente.'],
    ['network', 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.'],
    ['invalid-response', 'O serviço retornou dados inválidos. Tente novamente mais tarde.'],
  ] as const)('anuncia mensagem específica para %s', (kind, message) => {
    render(<ErrorState kind={kind} />);

    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(screen.getByRole('heading', { name: 'Erro ao consultar o clima' })).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('permite mensagem de apresentação personalizada sem interpretá-la como HTML', () => {
    render(<ErrorState message="Falha ao buscar <script>dados</script>." operation="search" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao buscar <script>dados</script>.');
    expect(screen.getByRole('heading', { name: 'Erro ao buscar cidades' })).toBeVisible();
  });

  it('oferece mensagem de rede por padrão', () => {
    render(<ErrorState />);
    expect(screen.getByRole('alert')).toHaveTextContent('Verifique sua conexão');
  });

  it('aciona retry uma vez por clique', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Falha na consulta." onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledExactlyOnceWith();
  });

  it('permite foco por Tab e retry por Enter e Espaço', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledTimes(1);
    await user.keyboard(' ');
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it('não submete o formulário ao tentar novamente', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event) => event.preventDefault());
    const onRetry = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <ErrorState onRetry={onRetry} />
      </form>,
    );

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
