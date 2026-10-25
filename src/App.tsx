import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { LoanForm } from './components/LoanForm';
import { ResultSummary } from './components/ResultSummary';
import { ScheduleTable } from './components/ScheduleTable';
import { calculateLoan, yearlySummary, type LoanResult } from './lib/mortgage';
import { fromSearch, toSearch } from './lib/url';
import { DEFAULT_VALUES, validate, type FormField, type FormValues } from './lib/validation';

const PaymentChart = lazy(() => import('./components/PaymentChart'));

function initialValues(): FormValues {
  try {
    return fromSearch(window.location.search);
  } catch {
    return DEFAULT_VALUES;
  }
}

export default function App() {
  const [values, setValues] = useState<FormValues>(initialValues);

  // Состояние дублируется в адресной строке, поэтому расчёт можно открыть или отправить ссылкой.
  useEffect(() => {
    try {
      window.history.replaceState(null, '', toSearch(values) || window.location.pathname);
    } catch {
      // Адресная строка может быть недоступна (например, в iframe без доступа к истории). Расчёт работает и без неё.
    }
  }, [values]);

  const { errors, input } = useMemo(() => validate(values), [values]);

  const result = useMemo<LoanResult | null>(() => (input ? calculateLoan(input) : null), [input]);
  const baseline = useMemo<LoanResult | null>(() => {
    if (!input?.earlyRepayment) return null;
    return calculateLoan({ ...input, earlyRepayment: undefined });
  }, [input]);
  const years = useMemo(() => (result ? yearlySummary(result.schedule) : []), [result]);

  const handleChange = (field: FormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Ипотечный калькулятор</h1>
        <p>Расчёт платежей, переплаты и графика погашения. Укажите параметры слева, результат появится справа.</p>
      </header>

      <main className="layout">
        <LoanForm values={values} errors={errors} onChange={handleChange} onReset={() => setValues(DEFAULT_VALUES)} />

        <div className="results" aria-live="polite">
          {input && result ? (
            <>
              <ResultSummary input={input} result={result} baseline={baseline} />
              <Suspense fallback={<p className="muted">Загрузка диаграммы…</p>}>
                <PaymentChart years={years} />
              </Suspense>
              <ScheduleTable result={result} years={years} />
            </>
          ) : (
            <section className="empty">
              <h2>Исправьте параметры</h2>
              <p>Расчёт появится, когда все поля заполнены верно.</p>
            </section>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Расчёт ориентировочный и не является предложением банка. Точные условия уточняйте в банке.</p>
      </footer>
    </div>
  );
}
