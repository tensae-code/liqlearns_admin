import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, CreditCard, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { marketplaceService, CartItem } from '../../services/marketplaceService';
import { stripeService } from '../../services/stripeService';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadCartItems();
  }, [user?.id]);

  const loadCartItems = async () => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const items = await marketplaceService.getCartItems(user.id);
      setCartItems(items);
      
      if (items.length === 0) {
        // Redirect back if cart is empty
        setTimeout(() => navigate('/role-based-dashboard-hub'), 2000);
      }
    } catch (err: any) {
      console.error('Error loading cart:', err);
      setError(err.message || 'Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    try {
      await marketplaceService.removeFromCart(cartItemId);
      await loadCartItems();
    } catch (err: any) {
      alert(err.message || 'Failed to remove item');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.product?.price || 0), 0);
  };

  const handleCheckout = async () => {
    if (!user?.id || cartItems.length === 0) return;

    try {
      setProcessingPayment(true);
      setError(null);

      // Create line items for Stripe
      const lineItems = cartItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product?.title || 'Product',
            description: item.product?.description || '',
            images: item.product?.previewImageUrl ? [item.product.previewImageUrl] : []
          },
          unit_amount: Math.round((item.product?.price || 0) * 100) // Convert to cents
        },
        quantity: item.quantity || 1
      }));

      // Create Stripe checkout session
      const { sessionId, url } = await stripeService.createCheckoutSession({
        lineItems,
        successUrl: `${window.location.origin}/checkout/success`,
        cancelUrl: `${window.location.origin}/checkout`
      });

      // Redirect to Stripe checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Payment processing failed. Please try again.');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Redirecting to marketplace...</p>
          <button
            onClick={() => navigate('/role-based-dashboard-hub')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/role-based-dashboard-hub')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Marketplace
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Payment Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-orange-500" />
                Order Items ({cartItems.length})
              </h2>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {item.product?.previewImageUrl && (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.previewImageUrl}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.product?.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {item.product?.description}
                      </p>
                      <p className="text-lg font-bold text-orange-600">
                        ${item.product?.price?.toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors h-fit"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (0%)</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processingPayment || cartItems.length === 0}
                className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Complete Purchase
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}