import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { YearSummary } from '../lib/mortgage';
import { formatRub } from '../lib/format';

interface PaymentChartProps {
  years: YearSummary[];
}

/** Загружается отдельным чанком через React.lazy: основной бандл остаётся лёгким. */
export default function PaymentChart({ years }: PaymentChartProps) {
  const data = years.map((year) => ({
    name: `${year.year} г.`,
    'Основной долг': Math.round(year.principal),
    Проценты: Math.round(year.interest),
  }));

  return (
    <figure className="chart">
      <figcaption>Структура платежей по годам: основной долг и проценты</figcaption>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
            <YAxis tickFormatter={(value: number) => `${Math.round(value / 1000)} тыс.`} tick={{ fontSize: 12 }} width={70} />
            <Tooltip formatter={(value: number) => formatRub(value)} />
            <Legend />
            <Bar dataKey="Основной долг" stackId="payment" fill="#0f766e" />
            <Bar dataKey="Проценты" stackId="payment" fill="#dc2626" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
