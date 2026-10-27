import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../src/components/UnitToggle';
import type { Unit } from '../../src/types/weather';

describe('UnitToggle', () => {
  it.each<{ unit: Unit; active: string; inactive: string }>([
    { unit: 'celsius', active: '°C', inactive: '°F' },
    { unit: 'fahrenheit', active: '°F', inactive: '°C' },
  ])('indica a unidade $unit no grupo acessível', ({ unit, active, inactive }) => {
    render(<UnitToggle unit={unit} onChange={vi.fn()} />);
    const group = screen.getByRole('group', { name: 'Unidade de temperatura' });

    expect(within(group).getAllByRole('button')).toHaveLength(2);
    expect(within(group).getByRole('button', { name: active, pressed: true })).toBeVisible();
    expect(within(group).getByRole('button', { name: inactive, pressed: false })).toBeVisible();
  });

  it('envia a unidade correspondente ao clicar em cada botão', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '°F' }));
    await user.click(screen.getByRole('button', { name: '°C' }));

    expect(onChange).toHaveBeenNthCalledWith(1, 'fahrenheit');
    expect(onChange).toHaveBeenNthCalledWith(2, 'celsius');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('mantém a seleção controlada pela prop unit', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(screen.getByRole('button', { name: '°C', pressed: true })).toBeInTheDocument();

    rerender(<UnitToggle unit="fahrenheit" onChange={onChange} />);
    expect(screen.getByRole('button', { name: '°F', pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°C', pressed: false })).toBeInTheDocument();
  });

  it('permite Tab, Shift+Tab e ativação por Enter e Espaço', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole('button', { name: '°C' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenNthCalledWith(1, 'celsius');

    await user.tab();
    expect(screen.getByRole('button', { name: '°F' })).toHaveFocus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenNthCalledWith(2, 'fahrenheit');

    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: '°C' })).toHaveFocus();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('não submete um formulário ao trocar a unidade', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event) => event.preventDefault());
    const onChange = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <UnitToggle unit="celsius" onChange={onChange} />
      </form>,
    );

    await user.click(screen.getByRole('button', { name: '°F' }));
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
