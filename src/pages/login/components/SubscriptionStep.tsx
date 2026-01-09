/*import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { CheckCircle, Star, Zap, Crown } from 'lucide-react';

interface SubscriptionStepProps {
  selectedPlan: string;
  onPlanSelect: (plan: string) => void;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: {
    courses?: string;
    storage?: string;
    [key: string]: any;
  };
  is_active: boolean;
}

const SubscriptionStep: React.FC<SubscriptionStepProps> = ({ selectedPlan, onPlanSelect }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    // Update selected plan details when selection changes
    if (selectedPlan && plans.length > 0) {
      const plan = plans.find(p => p.name.toLowerCase() === selectedPlan);
      setSelectedPlanDetails(plan || null);
    }
  }, [selectedPlan, plans]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('basic')) return <Star className="w-6 h-6 text-orange-500" />;
    if (name.includes('standard') || name.includes('premium')) return <Zap className="w-6 h-6 text-blue-500" />;
    if (name.includes('ambassador')) return <Crown className="w-6 h-6 text-purple-500" />;
    return <Star className="w-6 h-6 text-gray-500" />;
  };

  const calculateSavings = (monthly: number, yearly: number) => {
    const monthlyCost = monthly * 12;
    const savings = ((monthlyCost - yearly) / monthlyCost) * 100;
    return Math.round(savings);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h3>
        <p className="text-gray-600">Select the plan that best fits your learning journey</p>
      </div>

      {/* Billing Toggle *//*}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-xl border border-gray-200 p-1 bg-gray-50">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
              billingCycle === 'monthly' ?'bg-white text-orange-600 shadow-sm' :'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-all relative ${
              billingCycle === 'yearly' ?'bg-white text-orange-600 shadow-sm' :'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              Save {plans.length > 0 ? calculateSavings(plans[0].price_monthly, plans[0].price_yearly) : 10}%
            </span>
          </button>
        </div>
      </div>

      {/* Two-Column Layout: Left Sidebar + Right Card *//*}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar: Plan Options *//*}
        <div className="lg:col-span-2 space-y-4">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => onPlanSelect(plan.name.toLowerCase())}
              className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
                selectedPlan === plan.name.toLowerCase()
                  ? 'border-orange-500 bg-orange-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    selectedPlan === plan.name.toLowerCase()
                      ? 'bg-orange-100' :'bg-gray-100'
                  }`}>
                    {getPlanIcon(plan.name)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {plan.features.courses || 'Unlimited'} courses • {plan.features.storage || '1GB'} storage
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ${billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly}
                  </p>
                  <p className="text-sm text-gray-600">
                    {billingCycle === 'yearly' ? 'per year' : 'per month'}
                  </p>
                  {billingCycle === 'yearly' && (
                    <p className="text-xs text-green-600 mt-1">
                      Save {calculateSavings(plan.price_monthly, plan.price_yearly)}%
                    </p>
                  )}
                </div>
              </div>

              {/* Feature List *//*}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {Object.entries(plan.features).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="capitalize">{key}: {String(value)}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Right Card: Selected Plan Details *//*}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-gradient-to-br from-orange-50 to-purple-50 rounded-2xl p-6 border border-orange-200 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Package Details</h3>
            
            {selectedPlanDetails ? (
              <div className="space-y-4">
                {/* Plan Name and Icon *//*}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    {getPlanIcon(selectedPlanDetails.name)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedPlanDetails.name}</h4>
                    <p className="text-sm text-gray-600">Selected Plan</p>
                  </div>
                </div>

                {/* Pricing Summary *//*}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      {billingCycle === 'yearly' ? 'Annual' : 'Monthly'} Price
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${billingCycle === 'yearly' 
                        ? selectedPlanDetails.price_yearly 
                        : selectedPlanDetails.price_monthly}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Monthly equivalent</span>
                        <span>${(selectedPlanDetails.price_yearly / 12).toFixed(2)}/mo</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-green-600 font-medium">
                        <span>You save</span>
                        <span>
                          {calculateSavings(
                            selectedPlanDetails.price_monthly,
                            selectedPlanDetails.price_yearly
                          )}% 
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Features Summary *//*}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h5 className="font-semibold text-gray-900 mb-3">What's Included</h5>
                  <div className="space-y-2">
                    {Object.entries(selectedPlanDetails.features).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">
                          <span className="capitalize font-medium">{key}</span>: {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trial Notice *//*}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">3-Day Free Trial</span>
                    <br />
                    Try all features risk-free. Cancel anytime during trial period.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Select a plan to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStep;