import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';
import { MLMLeg, CommissionStructure } from '../types';

interface MLMCompensationViewProps {
  legs: MLMLeg[];
  commissionStructure: CommissionStructure[];
  className?: string;
}

const MLMCompensationView = ({ 
  legs, 
  commissionStructure, 
  className = '' 
}: MLMCompensationViewProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalVolume = legs.reduce((sum, leg) => sum + leg.totalVolume, 0);
  const totalMatchBonus = legs.reduce((sum, leg) => sum + leg.matchBonus, 0);

  const pieData = legs.map(leg => ({
    name: `Leg ${leg.name}`,
    value: leg.totalVolume,
    color: leg.color
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-modal">
          <p className="font-body font-medium text-sm text-popover-foreground">
            {data.name}
          </p>
          <p className="font-body text-sm text-muted-foreground">
            Volume: {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* MLM Legs Overview */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-card">
        <div className="mb-6">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
            MLM 4-Leg Performance
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            Volume distribution and match bonus calculations across all legs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leg Details */}
          <div className="space-y-4">
            {legs.map((leg) => (
              <div key={leg.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: leg.color }}
                  />
                  <div>
                    <p className="font-body font-medium text-sm text-foreground">
                      Leg {leg.name}
                    </p>
                    <p className="font-caption text-xs text-muted-foreground">
                      {leg.activeMembers} active members
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-data font-medium text-sm text-foreground">
                    {formatCurrency(leg.totalVolume)}
                  </p>
                  <p className={`font-caption text-xs ${
                    leg.weeklyGrowth >= 0 ? 'text-success' : 'text-error'
                  }`}>
                    {leg.weeklyGrowth >= 0 ? '+' : ''}{leg.weeklyGrowth}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="font-body text-sm text-muted-foreground mb-1">Total Volume</p>
            <p className="font-heading text-xl font-bold text-foreground">
              {formatCurrency(totalVolume)}
            </p>
          </div>
          <div className="text-center">
            <p className="font-body text-sm text-muted-foreground mb-1">Match Bonus</p>
            <p className="font-heading text-xl font-bold text-success">
              {formatCurrency(totalMatchBonus)}
            </p>
          </div>
          <div className="text-center">
            <p className="font-body text-sm text-muted-foreground mb-1">Active Members</p>
            <p className="font-heading text-xl font-bold text-foreground">
              {legs.reduce((sum, leg) => sum + leg.activeMembers, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Commission Structure */}
      <div className="bg-card rounded-lg border border-border p-6 shadow-card">
        <div className="mb-6">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
            Commission Structure
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            MLM compensation levels and requirements
          </p>
        </div>

        <div className="space-y-4">
          {commissionStructure.map((level, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                  <Icon name="Award" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-body font-medium text-sm text-foreground">
                    {level.level}
                  </p>
                  <p className="font-caption text-xs text-muted-foreground">
                    {level.description}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-data font-bold text-lg text-primary">
                  {level.percentage}%
                </p>
                <p className="font-caption text-xs text-muted-foreground">
                  {level.requirements}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MLMCompensationView;