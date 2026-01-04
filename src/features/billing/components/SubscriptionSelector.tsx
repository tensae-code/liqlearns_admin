import { useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

type Billing = 'monthly' | 'yearly';
type Plan = { id: string; name: string; price: number; features: string[] };

const PLANS: Plan[] = [
  { id: 'basic', name: 'Basic', price: 0.50, features: ['10 courses/mo', '1GB storage', 'Email support'] },
  { id: 'standard', name: 'Standard', price: 0.55, features: ['10 courses/mo', '5GB storage', 'Basic support'] },
  { id: 'pro', name: 'Pro', price: 0.60, features: ['50 courses/mo', '10GB storage', 'Priority support'] },
  { id: 'premium', name: 'Premium', price: 0.65, features: ['Unlimited courses', '20GB storage', 'Premium support'] },
  { id: 'elite', name: 'Elite', price: 0.70, features: ['Unlimited courses', 'Unlimited storage', 'VIP support'] },
];

export default function SubscriptionSelector() {
  const [billing, setBilling] = useState<Billing>('monthly');
  const [activePlan, setActivePlan] = useState<string>('basic');

  const isYearly = billing === 'yearly';
  const active = PLANS.find(p => p.id === activePlan)!;
  const finalPrice = isYearly ? active.price * 0.9 : active.price; // 10% off yearly

  return (
    <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Sidebar */}
      <aside className="lg:col-span-1">
        <div className="sticky top-4 space-y-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setActivePlan(plan.id)}
              className={cn(
                'w-full text-left rounded-lg border p-4 transition-all',
                plan.id === activePlan
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
              )}
            >
              <h3 className="font-semibold">{plan.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ${(isYearly ? plan.price * 0.9 : plan.price).toFixed(2)}/mo
              </p>
            </button>
          ))}
        </div>
      </aside>

      {/* Right Panel */}
      <main className="lg:col-span-2">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-6">
          {/* Billing Toggle */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <span className="text-sm font-medium">Billing</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">Monthly</span>
              <button
                onClick={() => setBilling(isYearly ? 'monthly' : 'yearly')}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  isYearly ? 'bg-indigo-600' : 'bg-gray-300'
                )}
              >
                <div 
                  className={cn(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                    isYearly ? 'translate-x-6' : 'translate-x-0.5'
                  )} 
                />
              </button>
              <span className="text-sm">Yearly (Save 10%)</span>
            </div>
          </div>

          {/* Plan Details */}
          <div>
            <h2 className="text-2xl font-bold">{active.name} Plan</h2>
            <p className="text-3xl font-extrabold mt-2">
              ${finalPrice.toFixed(2)}
              <span className="text-sm font-normal text-gray-500">/month</span>
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-3">
            {active.features.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckIcon className="h-5 w-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">{f}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={() => (window.location.href = `/checkout?plan=${activePlan}&billing=${billing}`)}
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-500 transition-colors"
          >
            Subscribe to {active.name}
          </button>
        </div>
      </main>
    </div>
  );
}