/**
 * Расчёт ипотеки. Все суммы в рублях, ставка годовая в процентах.
 * Функции чистые: не меняют входные данные и не зависят от интерфейса.
 */

export type PaymentType = 'annuity' | 'differentiated';

/**
 * Досрочное погашение:
 * - term: платёж остаётся прежним, срок сокращается;
 * - payment: срок остаётся прежним, платёж пересчитывается.
 */
export type EarlyRepaymentMode = 'term' | 'payment';

export interface EarlyRepayment {
  /** Номер месяца, в который вносится сумма (от 1). */
  month: number;
  amount: number;
  mode: EarlyRepaymentMode;
}

export interface LoanInput {
  price: number;
  downPayment: number;
  termYears: number;
  annualRatePct: number;
  type: PaymentType;
  earlyRepayment?: EarlyRepayment;
}

export interface ScheduleRow {
  month: number;
  /** Плановый платёж: проценты и основной долг за месяц. */
  payment: number;
  principal: number;
  interest: number;
  /** Досрочное погашение в этом месяце (0, если его не было). */
  extra: number;
  /** Остаток долга после платежа. */
  balance: number;
}

export interface LoanResult {
  principal: number;
  termMonths: number;
  schedule: ScheduleRow[];
  /** Сумма всех выплат: плановые платежи и досрочные погашения. */
  totalPaid: number;
  totalInterest: number;
  firstPayment: number;
  lastPayment: number;
  /** Фактическое число месяцев до полного погашения. */
  actualMonths: number;
}

export interface YearSummary {
  year: number;
  principal: number;
  interest: number;
  extra: number;
  balanceEnd: number;
}

const EPSILON = 0.005;

export function monthlyRate(annualRatePct: number): number {
  return annualRatePct / 100 / 12;
}

/** Аннуитетный платёж: одинаковая сумма каждый месяц. */
export function annuityPayment(principal: number, annualRatePct: number, months: number): number {
  if (months <= 0) throw new RangeError('Срок должен быть больше нуля');
  const rate = monthlyRate(annualRatePct);
  if (rate === 0) return principal / months;
  return (principal * rate) / (1 - Math.pow(1 + rate, -months));
}

/** Строит график платежей и считает итоги. */
export function calculateLoan(input: LoanInput): LoanResult {
  const principal = input.price - input.downPayment;
  const termMonths = input.termYears * 12;
  const rate = monthlyRate(input.annualRatePct);
  const early = input.type === 'annuity' ? input.earlyRepayment : undefined;

  let balance = principal;
  let payment = input.type === 'annuity' ? annuityPayment(principal, input.annualRatePct, termMonths) : 0;
  const schedule: ScheduleRow[] = [];

  for (let month = 1; month <= termMonths && balance > EPSILON; month++) {
    const interest = balance * rate;
    let principalPart: number;

    if (input.type === 'differentiated') {
      principalPart = principal / termMonths;
    } else {
      principalPart = payment - interest;
    }
    // В последнем месяце гасится весь остаток, чтобы не осталось хвоста из-за округления.
    if (month === termMonths || principalPart > balance) principalPart = balance;

    balance -= principalPart;
    const row: ScheduleRow = {
      month,
      payment: principalPart + interest,
      principal: principalPart,
      interest,
      extra: 0,
      balance,
    };

    if (early && early.month === month && balance > EPSILON) {
      const extra = Math.min(early.amount, balance);
      balance -= extra;
      row.extra = extra;
      row.balance = balance;
      if (early.mode === 'payment' && balance > EPSILON && month < termMonths) {
        payment = annuityPayment(balance, input.annualRatePct, termMonths - month);
      }
    }

    schedule.push(row);
  }

  const totalPaid = schedule.reduce((sum, row) => sum + row.payment + row.extra, 0);

  return {
    principal,
    termMonths,
    schedule,
    totalPaid,
    totalInterest: totalPaid - principal,
    firstPayment: schedule[0]?.payment ?? 0,
    lastPayment: schedule[schedule.length - 1]?.payment ?? 0,
    actualMonths: schedule.length,
  };
}

/** Сводка по годам: для диаграммы и компактной таблицы. */
export function yearlySummary(schedule: ScheduleRow[]): YearSummary[] {
  const years: YearSummary[] = [];
  for (const row of schedule) {
    const year = Math.ceil(row.month / 12);
    let summary = years[years.length - 1];
    if (!summary || summary.year !== year) {
      summary = { year, principal: 0, interest: 0, extra: 0, balanceEnd: row.balance };
      years.push(summary);
    }
    summary.principal += row.principal;
    summary.interest += row.interest;
    summary.extra += row.extra;
    summary.balanceEnd = row.balance;
  }
  return years;
}
