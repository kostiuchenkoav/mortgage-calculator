import { describe, expect, it } from 'vitest';
import { annuityPayment, calculateLoan, yearlySummary, type LoanInput } from './mortgage';

const base: LoanInput = {
  price: 1_000_000,
  downPayment: 0,
  termYears: 1,
  annualRatePct: 12,
  type: 'annuity',
};

describe('annuityPayment', () => {
  it('совпадает с эталонным значением для 1 000 000 ₽ на 12 месяцев под 12%', () => {
    expect(annuityPayment(1_000_000, 12, 12)).toBeCloseTo(88_848.79, 2);
  });

  it('при нулевой ставке делит сумму на число месяцев', () => {
    expect(annuityPayment(120_000, 0, 12)).toBeCloseTo(10_000, 6);
  });

  it('выбрасывает ошибку для нулевого срока', () => {
    expect(() => annuityPayment(1000, 10, 0)).toThrow(RangeError);
  });
});

describe('calculateLoan: аннуитет', () => {
  it('платёж постоянный, долг погашен полностью', () => {
    const result = calculateLoan(base);
    expect(result.schedule).toHaveLength(12);
    expect(result.firstPayment).toBeCloseTo(88_848.79, 2);
    expect(result.lastPayment).toBeCloseTo(88_848.79, 2);
    expect(result.schedule[11].balance).toBeCloseTo(0, 6);
  });

  it('переплата равна сумме выплат минус сумма кредита', () => {
    const result = calculateLoan(base);
    expect(result.totalPaid).toBeCloseTo(88_848.79 * 12, 1);
    expect(result.totalInterest).toBeCloseTo(result.totalPaid - 1_000_000, 6);
  });

  it('учитывает первоначальный взнос', () => {
    const result = calculateLoan({ ...base, downPayment: 200_000 });
    expect(result.principal).toBe(800_000);
    expect(result.firstPayment).toBeCloseTo(annuityPayment(800_000, 12, 12), 6);
  });
});

describe('calculateLoan: дифференцированный платёж', () => {
  it('первый платёж больше последнего, основной долг равными долями', () => {
    const result = calculateLoan({ ...base, type: 'differentiated' });
    expect(result.firstPayment).toBeCloseTo(93_333.33, 2);
    expect(result.lastPayment).toBeCloseTo(84_166.67, 2);
    expect(result.schedule.every((row) => Math.abs(row.principal - 1_000_000 / 12) < 0.01)).toBe(true);
    expect(result.schedule[11].balance).toBeCloseTo(0, 6);
  });
});

describe('calculateLoan: досрочное погашение', () => {
  const longLoan: LoanInput = { ...base, termYears: 20, annualRatePct: 10, price: 5_000_000 };

  it('режим term сокращает срок и уменьшает переплату, платёж не меняется', () => {
    const without = calculateLoan(longLoan);
    const withExtra = calculateLoan({
      ...longLoan,
      earlyRepayment: { month: 12, amount: 500_000, mode: 'term' },
    });
    expect(withExtra.actualMonths).toBeLessThan(without.actualMonths);
    expect(withExtra.totalInterest).toBeLessThan(without.totalInterest);
    expect(withExtra.schedule[0].payment).toBeCloseTo(without.schedule[0].payment, 6);
    expect(withExtra.schedule[withExtra.schedule.length - 1].balance).toBeCloseTo(0, 6);
  });

  it('режим payment сохраняет срок и уменьшает платёж после внесения', () => {
    const without = calculateLoan(longLoan);
    const withExtra = calculateLoan({
      ...longLoan,
      earlyRepayment: { month: 12, amount: 500_000, mode: 'payment' },
    });
    expect(withExtra.actualMonths).toBe(without.actualMonths);
    expect(withExtra.schedule[12].payment).toBeLessThan(withExtra.schedule[11].payment);
    expect(withExtra.totalInterest).toBeLessThan(without.totalInterest);
  });

  it('сумма больше остатка гасит кредит досрочно и не даёт отрицательный баланс', () => {
    const result = calculateLoan({
      ...longLoan,
      earlyRepayment: { month: 1, amount: 10_000_000, mode: 'term' },
    });
    expect(result.actualMonths).toBe(1);
    expect(result.schedule[0].balance).toBeCloseTo(0, 6);
    // Внесён весь остаток после первого платежа, а не заявленные 10 000 000 ₽.
    expect(result.schedule[0].extra).toBeCloseTo(result.principal - result.schedule[0].principal, 6);
  });

  it('для дифференцированного платежа досрочное погашение не применяется', () => {
    const result = calculateLoan({
      ...longLoan,
      type: 'differentiated',
      earlyRepayment: { month: 12, amount: 500_000, mode: 'term' },
    });
    expect(result.schedule.every((row) => row.extra === 0)).toBe(true);
  });
});

describe('yearlySummary', () => {
  it('суммирует месяцы по годам', () => {
    const result = calculateLoan({ ...base, termYears: 2 });
    const years = yearlySummary(result.schedule);
    expect(years.map((y) => y.year)).toEqual([1, 2]);
    const totalPrincipal = years.reduce((sum, y) => sum + y.principal, 0);
    expect(totalPrincipal).toBeCloseTo(result.principal, 4);
    expect(years[1].balanceEnd).toBeCloseTo(0, 6);
  });
});
