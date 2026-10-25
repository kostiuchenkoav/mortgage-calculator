import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach } from 'vitest';
import App from './App';

describe('Ипотечный калькулятор', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('показывает расчёт для параметров по умолчанию', async () => {
    render(<App />);
    expect(await screen.findByText('Ежемесячный платёж')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Итоги по годам' })).toBeInTheDocument();
  });

  it('переключает таблицу между годами и месяцами', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Показать по месяцам' }));
    expect(screen.getByRole('heading', { name: 'График платежей по месяцам' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Показать по годам' }));
    expect(screen.getByRole('heading', { name: 'Итоги по годам' })).toBeInTheDocument();
  });

  it('пересчитывает результат при изменении процентной ставки', async () => {
    const user = userEvent.setup();
    render(<App />);
    const rate = screen.getByLabelText(/Процентная ставка/);
    await user.clear(rate);
    await user.type(rate, '5');
    expect(rate).toHaveValue('5');
    expect(window.location.search).toContain('r=5');
  });

  it('показывает ошибку при некорректной сумме', async () => {
    const user = userEvent.setup();
    render(<App />);
    const price = screen.getByLabelText(/Стоимость/);
    await user.clear(price);
    await user.type(price, 'abc');
    expect(await screen.findByText('Исправьте параметры')).toBeInTheDocument();
  });

  it('восстанавливает параметры из адресной строки', async () => {
    window.history.replaceState(null, '', '/?p=3000000&d=0&t=10&r=8');
    render(<App />);
    const summary = await screen.findByRole('region', { name: 'Результат' });
    expect(within(summary).getByText('Ежемесячный платёж')).toBeInTheDocument();
    expect(screen.getByLabelText(/Стоимость/)).toHaveValue('3000000');
  });
});
