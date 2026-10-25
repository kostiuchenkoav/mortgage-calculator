import { useState } from 'react';
import type { LoanResult, YearSummary } from '../lib/mortgage';
import { formatRub } from '../lib/format';

interface ScheduleTableProps {
  result: LoanResult;
  years: YearSummary[];
}

/** Таблица по годам по умолчанию и помесячная по кнопке. Это же текстовая альтернатива диаграммы. */
export function ScheduleTable({ result, years }: ScheduleTableProps) {
  const [monthly, setMonthly] = useState(false);

  return (
    <section className="schedule" aria-labelledby="schedule-title">
      <div className="schedule-header">
        <h2 id="schedule-title">{monthly ? 'График платежей по месяцам' : 'Итоги по годам'}</h2>
        <button type="button" className="secondary" aria-pressed={monthly} onClick={() => setMonthly((value) => !value)}>
          {monthly ? 'Показать по годам' : 'Показать по месяцам'}
        </button>
      </div>

      <div className="table-wrap">
        {monthly ? (
          <table>
            <caption className="visually-hidden">График платежей по месяцам</caption>
            <thead>
              <tr>
                <th scope="col">Месяц</th>
                <th scope="col">Платёж</th>
                <th scope="col">Основной долг</th>
                <th scope="col">Проценты</th>
                <th scope="col">Досрочно</th>
                <th scope="col">Остаток</th>
              </tr>
            </thead>
            <tbody>
              {result.schedule.map((row) => (
                <tr key={row.month}>
                  <th scope="row">{row.month}</th>
                  <td>{formatRub(row.payment)}</td>
                  <td>{formatRub(row.principal)}</td>
                  <td>{formatRub(row.interest)}</td>
                  <td>{row.extra > 0 ? formatRub(row.extra) : '-'}</td>
                  <td>{formatRub(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <caption className="visually-hidden">Итоги по годам</caption>
            <thead>
              <tr>
                <th scope="col">Год</th>
                <th scope="col">Основной долг</th>
                <th scope="col">Проценты</th>
                <th scope="col">Досрочно</th>
                <th scope="col">Остаток долга</th>
              </tr>
            </thead>
            <tbody>
              {years.map((year) => (
                <tr key={year.year}>
                  <th scope="row">{year.year}</th>
                  <td>{formatRub(year.principal)}</td>
                  <td>{formatRub(year.interest)}</td>
                  <td>{year.extra > 0 ? formatRub(year.extra) : '-'}</td>
                  <td>{formatRub(year.balanceEnd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
