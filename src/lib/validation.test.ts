import { describe, expect, it } from 'vitest';
import { DEFAULT_VALUES, parseNumber, validate, type FormValues } from './validation';

const values = (overrides: Partial<FormValues> = {}): FormValues => ({ ...DEFAULT_VALUES, ...overrides });

describe('parseNumber', () => {
  it('принимает пробелы внутри числа и запятую', () => {
    expect(parseNumber('6 000 000')).toBe(6_000_000);
    expect(parseNumber('12,5')).toBe(12.5);
  });

  it('возвращает NaN для пустой строки и текста', () => {
    expect(Number.isNaN(parseNumber(''))).toBe(true);
    expect(Number.isNaN(parseNumber('abc'))).toBe(true);
  });
});

describe('validate', () => {
  it('значения по умолчанию проходят проверку', () => {
    const result = validate(DEFAULT_VALUES);
    expect(result.errors).toEqual({});
    expect(result.input?.price).toBe(6_000_000);
    expect(result.input?.termYears).toBe(20);
  });

  it('взнос не может быть больше или равен стоимости', () => {
    const result = validate(values({ downPayment: '6000000' }));
    expect(result.errors.downPayment).toBeDefined();
    expect(result.input).toBeNull();
  });

  it('срок должен быть целым числом от 1 до 30', () => {
    expect(validate(values({ termYears: '31' })).errors.termYears).toBeDefined();
    expect(validate(values({ termYears: '2,5' })).errors.termYears).toBeDefined();
  });

  it('ставка 0 допустима, отрицательная и выше 50 — нет', () => {
    expect(validate(values({ rate: '0' })).errors.rate).toBeUndefined();
    expect(validate(values({ rate: '-1' })).errors.rate).toBeDefined();
    expect(validate(values({ rate: '51' })).errors.rate).toBeDefined();
  });

  it('досрочное погашение больше суммы кредита отклоняется', () => {
    const result = validate(values({ earlyAmount: '5000000' }));
    expect(result.errors.earlyAmount).toBeDefined();
  });

  it('месяц досрочного погашения должен попадать в срок кредита', () => {
    const result = validate(values({ earlyAmount: '100000', earlyMonth: '240' }));
    expect(result.errors.earlyMonth).toBeDefined();
  });

  it('досрочное погашение не учитывается для дифференцированного платежа', () => {
    const result = validate(values({ type: 'differentiated', earlyAmount: '100000', earlyMonth: '999' }));
    expect(result.errors).toEqual({});
    expect(result.input?.earlyRepayment).toBeUndefined();
  });
});
