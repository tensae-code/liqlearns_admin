import React from 'react';
import Icon from '../../../components/AppIcon';
import { FinancialSummary } from '../types';

interface FinancialSummaryCardsProps {
  summary: FinancialSummary;
  className?: string;
}

const FinancialSummaryCards = ({ summary, className = '' }: FinancialSummaryCardsProps) => {
  const summaryCards = [
    {
      title: 'Total Platform Earnings',
      value: summary.totalPlatformEarnings,
      icon: 'TrendingUp',
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: `+${summary.weeklyGrowth}%`,
      changeType: 'positive' as const
    },
    {
      title: 'Pending Transfers',
      value: summary.pendingTransfers,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: `${summary.pendingTransfers} requests`,
      changeType: 'neutral' as const
    },
    {
      title: 'Monthly Commissions',
      value: summary.monthlyCommissions,
      icon: 'DollarSign',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+12.5%',
      changeType: 'positive' as const
    },
    {
      title: 'Approved Transfers',
      value: summary.approvedTransfers,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: `${summary.approvedTransfers} completed`,
      changeType: 'positive' as const
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {summaryCards.map((card, index) => (
        <div key={index} className="bg-card rounded-lg border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <Icon name={card.icon} size={24} className={card.color} />
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
              card.changeType === 'positive' ?'bg-success/10 text-success' 
                : card.changeType === 'negative' ?'bg-error/10 text-error' :'bg-muted text-muted-foreground'
            }`}>
              {card.change}
            </div>
          </div>
          
          <div>
            <h3 className="font-body text-sm text-muted-foreground mb-1">
              {card.title}
            </h3>
            <p className="font-heading text-2xl font-bold text-foreground">
              {card.title.includes('Earnings') || card.title.includes('Commissions') 
                ? formatCurrency(card.value)
                : card.value.toLocaleString()
              }
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FinancialSummaryCards;