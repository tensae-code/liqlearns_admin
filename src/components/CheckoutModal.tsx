import React, { useState, useEffect } from 'react';
import { X, CreditCard, Trash2, AlertCircle } from 'lucide-react';
import { marketplaceService, CartItem } from '../services/marketplaceService';
import { stripeService } from '../services/stripeService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export default function CheckoutModal({ isOpen, onClose, userId, onSuccess }: CheckoutModalProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadCartItems();
    }
  }, [isOpen, userId]);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await marketplaceService.getCartItems(userId);
      setCartItems(items);
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
    if (!userId || cartItems.length === 0) return;

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

      // Create Stripe checkout session with modal success URL
      const { sessionId, url } = await stripeService.createCheckoutSession({
        lineItems,
        successUrl: `${window.location.origin}${window.location.pathname}?checkout=success`,
        cancelUrl: `${window.location.origin}${window.location.pathname}`
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading checkout...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
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
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Order Items ({cartItems.length})</h3>
                  
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
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {item.product?.title}
                          </h4>
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

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

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
            </>
          )}
        </div>
      </div>
    </div>
  );
}