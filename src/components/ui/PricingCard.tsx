import React from 'react';
import { CheckIcon } from 'lucide-react';

interface PricingCardProps {
  title: string;
  price: number;
  period: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  onClick: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period,
  features,
  cta,
  highlighted = false,
  onClick
}) => {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border ${
        highlighted
          ? 'border-indigo-600 shadow-xl scale-105'
          : 'border-gray-200 dark:border-gray-700'
      } bg-white dark:bg-gray-800 p-6 transition-all duration-300 hover:shadow-lg h-full`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
          Most Popular
        </span>
      )}
      
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        
        <div className="mt-2 mb-6">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            ${price}
          </span>
          <span className="text-base font-medium text-gray-500 dark:text-gray-400">
            /{period}
          </span>
        </div>
        
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <button
        onClick={onClick}
        className={`w-full rounded-lg py-3 font-semibold transition-all duration-200 ${
          highlighted
            ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md hover:shadow-lg'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
        }`}
      >
        {cta}
      </button>
    </div>
  );
};

export default PricingCard;