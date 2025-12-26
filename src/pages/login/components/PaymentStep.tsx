import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Loader2, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';

// Load Stripe with public key - FIXED: Use correct env variable name
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentStepProps {
  selectedPlan: string;
  billingCycle: 'monthly' | 'yearly';
  userEmail: string;
  onPaymentSuccess: () => void;
  onPaymentFailure: (error: string) => void;
  onRequestInvoice: () => void;
}

const PaymentForm: React.FC<Omit<PaymentStepProps, 'onRequestInvoice'>> = ({
  selectedPlan,
  billingCycle,
  userEmail,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const [planDetails, setPlanDetails] = useState<any>(null);

  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', selectedPlan)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        setPlanDetails(data);
      } catch (error) {
        console.error('Error fetching plan details:', error);
      }
    };

    if (selectedPlan) {
      fetchPlanDetails();
    }
  }, [selectedPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!cardComplete) {
      setPaymentError('Please complete your card information');
      return;
    }

    setProcessing(true);
    setPaymentError('');

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the price ID based on billing cycle
      const priceId = billingCycle === 'monthly' 
        ? planDetails?.stripe_price_id_monthly 
        : planDetails?.stripe_price_id_yearly;

      if (!priceId) {
        throw new Error('Price ID not found for selected plan');
      }

      // Create success and cancel URLs
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/login?payment=success`;
      const cancelUrl = `${baseUrl}/login?payment=cancelled`;

      // Call create-checkout-session edge function with required parameters
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke(
        'create-checkout-session',
        {
          body: {
            priceId,
            userId: user.id,
            email: userEmail,
            successUrl,
            cancelUrl,
            metadata: {
              planName: selectedPlan,
              billingCycle,
            },
          },
        }
      );

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        throw new Error(sessionError.message || 'Failed to create checkout session');
      }

      if (!sessionData?.sessionUrl) {
        throw new Error('No checkout session URL returned');
      }

      // Redirect to Stripe Checkout using the returned URL
      window.location.href = sessionData.sessionUrl;
      
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Payment failed. Please try again.');
      onPaymentFailure(error.message || 'Payment failed');
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        '::placeholder': {
          color: '#9ca3af',
        },
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSmoothing: 'antialiased',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  const price = billingCycle === 'monthly' 
    ? planDetails?.price_monthly 
    : planDetails?.price_yearly;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Details</h3>
        <p className="text-gray-600">
          Complete your payment for {selectedPlan} plan
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <span className="text-lg font-bold text-blue-900">
            ${price} {billingCycle === 'yearly' ? '/year' : '/month'}
          </span>
        </div>
      </div>

      {/* Card Input */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 focus-within:border-orange-500 transition-colors">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Card Information
        </label>
        <CardElement
          options={cardElementOptions}
          onChange={(e) => {
            setCardComplete(e.complete);
            setPaymentError('');
          }}
        />
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-green-800">
          <p className="font-semibold mb-1">Secure Payment</p>
          <p>Your payment information is encrypted and secure. We use Stripe for payment processing.</p>
        </div>
      </div>

      {/* Error Message */}
      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 mb-1">Payment Error</p>
            <p className="text-sm text-red-700">{paymentError}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        fullWidth
        disabled={!stripe || processing || !cardComplete}
        className="relative"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pay ${price}
          </>
        )}
      </Button>

      {/* Trial Notice */}
      <div className="text-center text-sm text-gray-600">
        <p>
          Your card will be charged ${price} {billingCycle === 'yearly' ? 'annually' : 'monthly'}
        </p>
        <p className="mt-1">You can cancel anytime from your account settings</p>
      </div>
    </form>
  );
};

const PaymentStep: React.FC<PaymentStepProps> = (props) => {
  return (
    <div className="space-y-6">
      <Elements stripe={stripePromise}>
        <PaymentForm {...props} />
      </Elements>

      {/* Alternative Payment Option */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={props.onRequestInvoice}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
      >
        <Mail className="w-5 h-5" />
        Request Email Invoice
      </button>
    </div>
  );
};

export default PaymentStep;