import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Package } from 'lucide-react';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear cart after successful payment
    const timer = setTimeout(() => {
      navigate('/role-based-dashboard-hub');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your items will be available in your account shortly.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/role-based-dashboard-hub')}
            className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Package className="w-5 h-5" />
            View My Purchases
          </button>
          
          <p className="text-sm text-gray-500">
            Redirecting to dashboard in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}