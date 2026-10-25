import { describe, expect, it } from 'vitest';
import { formatMonths, formatRub, formatYears, plural } from './format';

describe('formatRub', () => {
  it('выводит рубли без копеек с символом ₽', () => {
    const text = formatRub(1_234_567.8);
    expect(text).toContain('₽');
    expect(text.replace(/\s/g, '')).toBe('1234568₽');
  });
});

describe('plural', () => {
  it('склоняет слова по правилам русского языка', () => {
    const forms: [string, string, string] = ['год', 'года', 'лет'];
    expect(plural(1, forms)).toBe('год');
    expect(plural(2, forms)).toBe('года');
    expect(plural(5, forms)).toBe('лет');
    expect(plural(21, forms)).toBe('год');
    expect(plural(11, forms)).toBe('лет');
    expect(plural(112, forms)).toBe('лет');
  });

  it('формирует подписи срока', () => {
    expect(formatYears(20)).toBe('20 лет');
    expect(formatMonths(3)).toBe('3 месяца');
  });
});
