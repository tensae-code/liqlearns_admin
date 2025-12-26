import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WeeklyPayment } from '../types';

interface WeeklyPaymentChartProps {
  data: WeeklyPayment[];
  className?: string;
}

const WeeklyPaymentChart = ({ data, className = '' }: WeeklyPaymentChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-modal">
          <p className="font-body font-medium text-sm text-popover-foreground mb-2">
            {`Week: ${label}`}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="font-body text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-card rounded-lg border border-border p-6 shadow-card ${className}`}>
      <div className="mb-6">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
          Weekly Payment Distribution
        </h3>
        <p className="font-body text-sm text-muted-foreground">
          Commission breakdown by payment type over the last 8 weeks
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="week" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="directReferral" 
              name="Direct Referral" 
              fill="var(--color-primary)" 
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="matchBonus" 
              name="Match Bonus" 
              fill="var(--color-accent)" 
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="teamLeaderBonus" 
              name="Team Leader Bonus" 
              fill="var(--color-success)" 
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyPaymentChart;