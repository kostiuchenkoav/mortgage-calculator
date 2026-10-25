import type { EarlyRepaymentMode, LoanInput, PaymentType } from './mortgage';

/** Значения формы хранятся строками, как их вводит пользователь. */
export interface FormValues {
  price: string;
  downPayment: string;
  termYears: string;
  rate: string;
  type: PaymentType;
  earlyAmount: string;
  earlyMonth: string;
  earlyMode: EarlyRepaymentMode;
}

export type FormField = keyof FormValues;
export type FormErrors = Partial<Record<FormField, string>>;

export const DEFAULT_VALUES: FormValues = {
  price: '6000000',
  downPayment: '1200000',
  termYears: '20',
  rate: '12',
  type: 'annuity',
  earlyAmount: '0',
  earlyMonth: '12',
  earlyMode: 'term',
};

export const LIMITS = {
  price: { min: 100_000, max: 1_000_000_000 },
  termYears: { min: 1, max: 30 },
  rate: { min: 0, max: 50 },
} as const;

/**
 * Разбирает число из поля ввода. Принимает пробелы внутри числа и запятую как разделитель.
 * Возвращает NaN, если значение пустое или не является числом.
 */
export function parseNumber(value: string): number {
  const normalized = value.trim().replace(/\s+/g, '').replace(',', '.');
  if (normalized === '') return Number.NaN;
  return Number(normalized);
}

export interface ValidationResult {
  errors: FormErrors;
  input: LoanInput | null;
}

export function validate(values: FormValues): ValidationResult {
  const errors: FormErrors = {};

  const price = parseNumber(values.price);
  if (!Number.isFinite(price) || price < LIMITS.price.min || price > LIMITS.price.max) {
    errors.price = 'Стоимость от 100 000 до 1 000 000 000 ₽';
  }

  const downPayment = parseNumber(values.downPayment);
  if (!Number.isFinite(downPayment) || downPayment < 0 || (Number.isFinite(price) && downPayment >= price)) {
    errors.downPayment = 'Взнос не меньше 0 и меньше стоимости недвижимости';
  }

  const termYears = parseNumber(values.termYears);
  if (!Number.isInteger(termYears) || termYears < LIMITS.termYears.min || termYears > LIMITS.termYears.max) {
    errors.termYears = 'Срок от 1 до 30 лет, целым числом';
  }

  const rate = parseNumber(values.rate);
  if (!Number.isFinite(rate) || rate < LIMITS.rate.min || rate > LIMITS.rate.max) {
    errors.rate = 'Ставка от 0 до 50% годовых';
  }

  let earlyRepayment: LoanInput['earlyRepayment'];
  const earlyAmount = parseNumber(values.earlyAmount);
  if (values.type === 'annuity' && Number.isFinite(earlyAmount) && earlyAmount > 0) {
    const principal = Number.isFinite(price) && Number.isFinite(downPayment) ? price - downPayment : Number.NaN;
    if (Number.isFinite(principal) && earlyAmount > principal) {
      errors.earlyAmount = 'Сумма не больше суммы кредита';
    }

    const earlyMonth = parseNumber(values.earlyMonth);
    const maxMonth = Number.isInteger(termYears) ? termYears * 12 - 1 : 0;
    if (!Number.isInteger(earlyMonth) || earlyMonth < 1 || earlyMonth > maxMonth) {
      errors.earlyMonth = maxMonth >= 1 ? `Месяц от 1 до ${maxMonth}, целым числом` : 'Укажите срок кредита';
    }

    if (!errors.earlyAmount && !errors.earlyMonth) {
      earlyRepayment = { month: earlyMonth, amount: earlyAmount, mode: values.earlyMode };
    }
  } else if (values.type === 'annuity' && Number.isFinite(earlyAmount) === false) {
    errors.earlyAmount = 'Введите число или 0';
  }

  const hasErrors = Object.keys(errors).length > 0;
  if (hasErrors) return { errors, input: null };

  return {
    errors,
    input: {
      price,
      downPayment,
      termYears,
      annualRatePct: rate,
      type: values.type,
      earlyRepayment,
    },
  };
}
