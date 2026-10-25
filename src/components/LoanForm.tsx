import type { ReactNode } from 'react';
import type { FormErrors, FormField, FormValues } from '../lib/validation';
import { parseNumber } from '../lib/validation';
import { formatRub } from '../lib/format';

interface LoanFormProps {
  values: FormValues;
  errors: FormErrors;
  onChange: (field: FormField, value: string) => void;
  onReset: () => void;
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function LoanForm({ values, errors, onChange, onReset }: LoanFormProps) {
  const price = parseNumber(values.price);
  const downPayment = parseNumber(values.downPayment);
  const downShare =
    Number.isFinite(price) && Number.isFinite(downPayment) && price > 0 && downPayment >= 0
      ? Math.round((downPayment / price) * 1000) / 10
      : null;
  const isAnnuity = values.type === 'annuity';

  return (
    <form className="form" aria-label="Параметры кредита" onSubmit={(event) => event.preventDefault()}>
      <fieldset>
        <legend>Кредит</legend>

        <Field id="price" label="Стоимость недвижимости, ₽" error={errors.price}>
          <input
            id="price"
            type="text"
            inputMode="numeric"
            value={values.price}
            aria-invalid={Boolean(errors.price)}
            aria-describedby={errors.price ? 'price-error' : undefined}
            onChange={(event) => onChange('price', event.target.value)}
          />
        </Field>

        <Field
          id="downPayment"
          label="Первоначальный взнос, ₽"
          hint={downShare !== null ? `${downShare}% от стоимости` : undefined}
          error={errors.downPayment}
        >
          <input
            id="downPayment"
            type="text"
            inputMode="numeric"
            value={values.downPayment}
            aria-invalid={Boolean(errors.downPayment)}
            aria-describedby={errors.downPayment ? 'downPayment-error' : downShare !== null ? 'downPayment-hint' : undefined}
            onChange={(event) => onChange('downPayment', event.target.value)}
          />
        </Field>

        <Field id="termYears" label="Срок, лет" hint="От 1 до 30 лет" error={errors.termYears}>
          <input
            id="termYears"
            type="text"
            inputMode="numeric"
            value={values.termYears}
            aria-invalid={Boolean(errors.termYears)}
            aria-describedby={errors.termYears ? 'termYears-error' : 'termYears-hint'}
            onChange={(event) => onChange('termYears', event.target.value)}
          />
        </Field>

        <Field id="rate" label="Процентная ставка, % годовых" error={errors.rate}>
          <input
            id="rate"
            type="text"
            inputMode="decimal"
            value={values.rate}
            aria-invalid={Boolean(errors.rate)}
            aria-describedby={errors.rate ? 'rate-error' : undefined}
            onChange={(event) => onChange('rate', event.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset>
        <legend>Тип платежа</legend>
        <div className="radio-group" role="radiogroup" aria-label="Тип платежа">
          <label>
            <input
              type="radio"
              name="type"
              value="annuity"
              checked={isAnnuity}
              onChange={() => onChange('type', 'annuity')}
            />
            Аннуитетный: одинаковый платёж
          </label>
          <label>
            <input
              type="radio"
              name="type"
              value="differentiated"
              checked={!isAnnuity}
              onChange={() => onChange('type', 'differentiated')}
            />
            Дифференцированный: платёж уменьшается
          </label>
        </div>
      </fieldset>

      <fieldset disabled={!isAnnuity}>
        <legend>Досрочное погашение</legend>
        {!isAnnuity && <p className="hint">Досрочное погашение доступно для аннуитетного платежа.</p>}

        <Field id="earlyAmount" label="Сумма досрочного погашения, ₽" error={errors.earlyAmount}>
          <input
            id="earlyAmount"
            type="text"
            inputMode="numeric"
            value={values.earlyAmount}
            aria-invalid={Boolean(errors.earlyAmount)}
            aria-describedby={errors.earlyAmount ? 'earlyAmount-error' : undefined}
            onChange={(event) => onChange('earlyAmount', event.target.value)}
          />
        </Field>

        <Field id="earlyMonth" label="Месяц внесения" error={errors.earlyMonth}>
          <input
            id="earlyMonth"
            type="text"
            inputMode="numeric"
            value={values.earlyMonth}
            aria-invalid={Boolean(errors.earlyMonth)}
            aria-describedby={errors.earlyMonth ? 'earlyMonth-error' : undefined}
            onChange={(event) => onChange('earlyMonth', event.target.value)}
          />
        </Field>

        <div className="radio-group" role="radiogroup" aria-label="Что уменьшить после погашения">
          <label>
            <input
              type="radio"
              name="earlyMode"
              value="term"
              checked={values.earlyMode === 'term'}
              onChange={() => onChange('earlyMode', 'term')}
            />
            Сократить срок (платёж прежний)
          </label>
          <label>
            <input
              type="radio"
              name="earlyMode"
              value="payment"
              checked={values.earlyMode === 'payment'}
              onChange={() => onChange('earlyMode', 'payment')}
            />
            Уменьшить платёж (срок прежний)
          </label>
        </div>
      </fieldset>

      <div className="form-footer">
        <p className="hint">Стоимость кредита: {formatRub(Math.max(0, (price || 0) - (downPayment || 0)))}</p>
        <button type="button" className="secondary" onClick={onReset}>
          Сбросить
        </button>
      </div>
    </form>
  );
}
