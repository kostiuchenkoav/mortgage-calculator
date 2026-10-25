import { DEFAULT_VALUES, type FormValues } from './validation';
import type { EarlyRepaymentMode, PaymentType } from './mortgage';

/** Короткие имена параметров в адресной строке. */
const KEYS: Record<keyof FormValues, string> = {
  price: 'p',
  downPayment: 'd',
  termYears: 't',
  rate: 'r',
  type: 'type',
  earlyAmount: 'ea',
  earlyMonth: 'em',
  earlyMode: 'emode',
};

const TYPES: PaymentType[] = ['annuity', 'differentiated'];
const MODES: EarlyRepaymentMode[] = ['term', 'payment'];

/**
 * Превращает значения формы в строку запроса. В адресной строке остаются только
 * параметры, которые отличаются от значений по умолчанию, поэтому ссылка короткая.
 */
export function toSearch(values: FormValues): string {
  const params = new URLSearchParams();
  for (const field of Object.keys(KEYS) as Array<keyof FormValues>) {
    if (values[field] !== DEFAULT_VALUES[field]) params.set(KEYS[field], values[field]);
  }
  const search = params.toString();
  return search ? `?${search}` : '';
}

/** Читает значения формы из строки запроса. Неизвестные значения заменяются значениями по умолчанию. */
export function fromSearch(search: string): FormValues {
  const params = new URLSearchParams(search);
  const values: FormValues = { ...DEFAULT_VALUES };

  for (const field of Object.keys(KEYS) as Array<keyof FormValues>) {
    const raw = params.get(KEYS[field]);
    if (raw === null) continue;
    if (field === 'type') {
      if ((TYPES as string[]).includes(raw)) values.type = raw as PaymentType;
    } else if (field === 'earlyMode') {
      if ((MODES as string[]).includes(raw)) values.earlyMode = raw as EarlyRepaymentMode;
    } else {
      values[field] = raw;
    }
  }
  return values;
}
