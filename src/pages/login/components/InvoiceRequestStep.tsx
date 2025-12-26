import React, { useState } from 'react';
import { Mail, CheckCircle, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { supabase } from '../../../lib/supabase';

interface InvoiceRequestStepProps {
  userEmail: string;
  selectedPlan: string;
  billingCycle: 'monthly' | 'yearly';
  onInvoiceSent: () => void;
  onBackToPayment: () => void;
}

const InvoiceRequestStep: React.FC<InvoiceRequestStepProps> = ({
  userEmail,
  selectedPlan,
  billingCycle,
  onInvoiceSent,
  onBackToPayment,
}) => {
  const [email, setEmail] = useState(userEmail);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const handleSendInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter a valid email address');
      return;
    }

    setSending(true);
    setError('');

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get plan details
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', selectedPlan)
        .eq('is_active', true)
        .single();

      if (planError) throw planError;

      const price = billingCycle === 'monthly' ? planData.price_monthly : planData.price_yearly;

      // Send invoice email using edge function
      const { error: emailError } = await supabase.functions.invoke('send-email-invoice', {
        body: {
          to: email,
          userId: user.id,
          planName: selectedPlan,
          billingCycle,
          amount: price,
          currency: planData.currency || 'USD',
          additionalInfo,
        },
      });

      if (emailError) throw emailError;

      // Create a pending payment record
      await supabase.from('pending_invoices').insert({
        user_id: user.id,
        email,
        plan_name: selectedPlan,
        billing_cycle: billingCycle,
        amount: price,
        status: 'pending',
        additional_info: additionalInfo,
      });

      setSent(true);
      setTimeout(() => {
        onInvoiceSent();
      }, 3000);
    } catch (error: any) {
      console.error('Invoice request error:', error);
      setError(error.message || 'Failed to send invoice. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Invoice Sent Successfully!</h3>
          <p className="text-gray-600">
            We've sent a payment invoice to <span className="font-semibold">{email}</span>
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            Please check your email and complete the payment. Once verified, you'll be able to access your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSendInvoice} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Email Invoice</h3>
        <p className="text-gray-600">
          We'll send a payment invoice to your email address
        </p>
      </div>

      {/* Plan Summary */}
      <div className="bg-gradient-to-br from-orange-50 to-purple-50 rounded-2xl p-6 border border-orange-200">
        <h4 className="font-semibold text-gray-900 mb-3">Invoice Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <span className="font-semibold text-gray-900">{selectedPlan}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Billing:</span>
            <span className="font-semibold text-gray-900 capitalize">{billingCycle}</span>
          </div>
        </div>
      </div>

      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="text-base"
        />
        <p className="text-xs text-gray-500 mt-1">
          Invoice will be sent to this email address
        </p>
      </div>

      {/* Additional Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Information (Optional)
        </label>
        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="Add any notes or special instructions..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
        />
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h5 className="font-semibold text-blue-900 mb-2 text-sm">What happens next?</h5>
        <ul className="space-y-1 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>You'll receive an invoice email with payment instructions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Complete payment using your preferred method</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>We'll verify your payment and activate your account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>You'll receive a confirmation email once verified</span>
          </li>
        </ul>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 mb-1">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBackToPayment}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Card Payment
        </button>
        <Button
          type="submit"
          variant="default"
          className="flex-1"
          disabled={sending || !email}
        >
          {sending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Sending Invoice...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5 mr-2" />
              Send Invoice
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default InvoiceRequestStep;