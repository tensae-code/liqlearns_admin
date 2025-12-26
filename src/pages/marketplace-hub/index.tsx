import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Star, Award, Package, Eye, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { marketplaceService, MarketplaceProduct, PaymentMethod, ProductCategory } from '../../services/marketplaceService';

const MarketplaceHub: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedPaymentMethod]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      if (selectedPaymentMethod !== 'all') filters.paymentMethod = selectedPaymentMethod;
      if (searchTerm) filters.searchTerm = searchTerm;

      const data = await marketplaceService.getActiveProducts(filters);
      setProducts(data);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load marketplace products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadProducts();
  };

  const handleAddToCart = (product: MarketplaceProduct) => {
    if (!user) {
      alert('Please login to add to cart');
      return;
    }

    // Add to cart logic here
    setCartCount(prev => prev + 1);
  };

  const handlePurchase = async (productId: string, paymentMethod: PaymentMethod) => {
    if (!user) {
      alert('Please login to purchase');
      return;
    }

    try {
      await marketplaceService.purchaseProduct(productId, paymentMethod);
      alert('Purchase successful!');
      setCartCount(prev => prev + 1);
    } catch (err: any) {
      alert(err.message || 'Purchase failed');
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'ebook', label: 'E-Books' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'flashcards', label: 'Flashcards' },
    { value: 'worksheet', label: 'Worksheets' },
    { value: 'guide', label: 'Guides' },
    { value: 'notes', label: 'Notes' }
  ];

  const filteredProducts = products;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-8 h-8 text-purple-500" />
                Marketplace Hub
              </h1>
              <p className="text-gray-600 mt-1">Discover educational materials from students and teachers</p>
            </div>
            <button className="relative p-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 border-2 border-purple-500 text-purple-600 rounded-xl hover:bg-purple-50 transition-colors font-medium flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as ProductCategory | 'all')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod | 'all')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Payment Methods</option>
                    <option value="aura_points">Aura Points (Students)</option>
                    <option value="ethiopian_birr">Ethiopian Birr (Teachers)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {/* Products Grid - Updated with Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-300"
            >
              <div className="h-56 overflow-hidden relative">
                <img 
                  src={product.image_url || '/api/placeholder/400/300'}
                  alt={product.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {/* Completion Rate Badge */}
                <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
                  <Award className="w-3 h-3" />
                  <span>95% Complete</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 flex-1">{product.title}</h3>
                  <span className="text-xl font-bold text-purple-600">${product.price}</span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                {/* Trust Indicators */}
                <div className="space-y-2 mb-4 border-t border-gray-100 pt-4">
                  {/* Tutor Rating */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`w-4 h-4 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600 font-medium">4.8</span>
                    </div>
                    <span className="text-gray-500">(127 reviews)</span>
                  </div>

                  {/* Active Learners */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-blue-600">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">127 active learners</span>
                    </div>
                  </div>

                  {/* Completion Rate */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-medium">95% completion rate</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                  <button className="px-4 py-3 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                    <Eye className="w-5 h-5 text-purple-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHub;