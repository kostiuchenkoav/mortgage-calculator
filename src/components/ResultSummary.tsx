import type { LoanInput, LoanResult } from '../lib/mortgage';
import { formatMonths, formatRub, formatYears } from '../lib/format';

interface ResultSummaryProps {
  input: LoanInput;
  result: LoanResult;
  /** Тот же кредит без досрочного погашения: нужен для сравнения. */
  baseline: LoanResult | null;
}

export function ResultSummary({ input, result, baseline }: ResultSummaryProps) {
  const early = input.earlyRepayment;
  const isAnnuity = input.type === 'annuity';
  const savings = baseline ? baseline.totalInterest - result.totalInterest : 0;
  const monthsSaved = baseline ? baseline.actualMonths - result.actualMonths : 0;
  // Строка после месяца досрочного погашения: в ней виден новый платёж в режиме «уменьшить платёж».
  const nextRow = early ? result.schedule[early.month] : undefined;

  return (
    <section className="summary" aria-labelledby="summary-title">
      <h2 id="summary-title">Результат</h2>

      <dl className="stats">
        {isAnnuity ? (
          <div className="stat stat--main">
            <dt>Ежемесячный платёж</dt>
            <dd>{formatRub(result.firstPayment)}</dd>
          </div>
        ) : (
          <>
            <div className="stat stat--main">
              <dt>Первый платёж</dt>
              <dd>{formatRub(result.firstPayment)}</dd>
            </div>
            <div className="stat stat--main">
              <dt>Последний платёж</dt>
              <dd>{formatRub(result.lastPayment)}</dd>
            </div>
          </>
        )}
        <div className="stat">
          <dt>Сумма кредита</dt>
          <dd>{formatRub(result.principal)}</dd>
        </div>
        <div className="stat">
          <dt>Переплата по процентам</dt>
          <dd>{formatRub(result.totalInterest)}</dd>
        </div>
        <div className="stat">
          <dt>Всего выплат</dt>
          <dd>{formatRub(result.totalPaid)}</dd>
        </div>
        <div className="stat">
          <dt>Срок погашения</dt>
          <dd>
            {formatMonths(result.actualMonths)}
            {result.actualMonths >= 12 && ` (${formatYears(Math.floor(result.actualMonths / 12))})`}
          </dd>
        </div>
      </dl>

      {early && baseline && (
        <div className="early-note" role="status">
          <p>
            С досрочным погашением на {formatRub(early.amount)} на {early.month}-м месяце переплата уменьшилась на{' '}
            <strong>{formatRub(savings)}</strong>.
          </p>
          {early.mode === 'term' && monthsSaved > 0 && (
            <p>Срок сократился на {formatMonths(monthsSaved)}.</p>
          )}
          {early.mode === 'payment' && nextRow && (
            <p>Платёж после погашения: {formatRub(nextRow.payment)} в месяц.</p>
          )}
        </div>
      )}
    </section>
  );
}
