const rubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

const percent = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

/** Сумма в рублях без копеек: 1 234 567 ₽. */
export function formatRub(value: number): string {
  return rubles.format(Math.round(value));
}

/** Процент: 12,5%. */
export function formatPercent(value: number): string {
  return `${percent.format(value)}%`;
}

/** Склонение слова по числу: 1 год, 2 года, 5 лет. */
export function plural(count: number, forms: [string, string, string]): string {
  const n = Math.abs(count) % 100;
  const last = n % 10;
  if (n > 10 && n < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

export function formatYears(years: number): string {
  return `${years} ${plural(years, ['год', 'года', 'лет'])}`;
}

export function formatMonths(months: number): string {
  return `${months} ${plural(months, ['месяц', 'месяца', 'месяцев'])}`;
}
