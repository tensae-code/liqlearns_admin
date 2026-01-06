import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Package, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { marketplaceService, MarketplaceProduct, PaymentMethod, ProductCategory } from '../services/marketplaceService';
import MarketplaceIcon from './MarketplaceIcon';

// Tag categories that replace old category system
const TAG_CATEGORIES = [
  { value: 'interactive', label: 'Interactive' },
  { value: 'template', label: 'Templates' },
  { value: 'tutorial', label: 'Tutorials' },
  { value: 'lecture', label: 'Lectures' },
  { value: 'reference', label: 'References' },
  { value: 'spaced-repetition', label: 'Flashcards' },
  { value: 'gamified', label: 'Gamified' },
  { value: 'memory', label: 'Memory' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Videos' }
];

interface EmbeddedMarketplaceProps {
  isEmbedded?: boolean;
  onAddToCart?: (productId: string) => void;
  onCheckout?: () => void;
  cartItemCount?: number;
}

const EmbeddedMarketplace: React.FC<EmbeddedMarketplaceProps> = ({ 
  isEmbedded = false,
  onAddToCart,
  onCheckout,
  cartItemCount = 0
}) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [allProducts, setAllProducts] = useState<MarketplaceProduct[]>([]);

  // Update category mapping to include tag-based detection
  const categoryMapping: { [key: string]: { name: string; icon: string } } = {
    ebook: { name: 'Books', icon: '📚' },
    video: { name: 'Videos', icon: '🎥' },
    audio: { name: 'Audio', icon: '🎧' },
    flashcards: { name: 'Flashcards', icon: '🎴' },
    worksheet: { name: 'Worksheets', icon: '📝' },
    guide: { name: 'Guides', icon: '📖' },
    notes: { name: 'Notes', icon: '📄' },
    other: { name: 'Other', icon: '📦' },
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, selectedPaymentMethod, selectedTag]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      if (selectedPaymentMethod !== 'all') filters.paymentMethod = selectedPaymentMethod;
      if (searchTerm) filters.searchTerm = searchTerm;
      if (selectedTag !== 'all') filters.tags = [selectedTag];

      const data = await marketplaceService.getActiveProducts(filters);
      setProducts(data);

      // Store all products for count calculation
      if (selectedTag === 'all' && selectedCategory === 'all' && !searchTerm) {
        setAllProducts(data);
      }

      // Calculate tag counts from all products
      const counts: Record<string, number> = {};
      const productsForCount = allProducts.length > 0 ? allProducts : data;
      TAG_CATEGORIES.forEach(cat => {
        counts[cat.value] = productsForCount.filter(p => p.tags?.includes(cat.value)).length;
      });
      setTagCounts(counts);
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

  const handlePurchase = async (productId: string, paymentMethod: PaymentMethod) => {
    if (!user) {
      alert('Please login to purchase');
      return;
    }

    try {
      setPurchaseLoading(true);
      await marketplaceService.purchaseProduct(productId, paymentMethod);
      alert('Purchase successful!');
    } catch (err: any) {
      alert(err.message || 'Purchase failed');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleTagFilter = (tagValue: string) => {
    if (selectedTag === tagValue) {
      setSelectedTag('all');
    } else {
      setSelectedTag(tagValue);
      setSelectedCategory('all');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {!isEmbedded && (
        <div className="bg-white shadow-sm border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Package className="w-8 h-8 text-orange-500" />
                  Marketplace Hub
                </h1>
                <p className="text-gray-600 mt-1">Discover educational materials by type</p>
              </div>
              <button 
                onClick={onCheckout}
                className="relative p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
              >
                Search
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 border-2 border-orange-500 text-orange-600 rounded-xl hover:bg-orange-50 transition-colors font-medium flex items-center gap-2"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tag Filter</label>
                    <select
                      value={selectedTag}
                      onChange={(e) => handleTagFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="all">All Tags</option>
                      {TAG_CATEGORIES.map(tag => (
                        <option key={tag.value} value={tag.value}>{tag.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod | 'all')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
      )}

      <main className={isEmbedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {/* Embedded Header */}
        {isEmbedded && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Package className="w-7 h-7 text-orange-500" />
                  Marketplace
                </h2>
                <p className="text-gray-600 mt-1 text-sm">Browse educational materials by type</p>
              </div>
              <button 
                onClick={onCheckout}
                className="relative p-3 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Embedded Search */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
              >
                Search
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium flex items-center gap-2 text-sm"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

            {/* Embedded Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tag Filter</label>
                    <select
                      value={selectedTag}
                      onChange={(e) => handleTagFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                    >
                      <option value="all">All Tags</option>
                      {TAG_CATEGORIES.map(tag => (
                        <option key={tag.value} value={tag.value}>{tag.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod | 'all')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
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
        )}

        {/* Tag-Based Categories Grid with Icons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {TAG_CATEGORIES.map((tag) => (
            <button
              key={tag.value}
              onClick={() => handleTagFilter(tag.value)}
              className={`rounded-lg border p-4 transition-all hover:shadow-lg ${
                selectedTag === tag.value
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' :'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <MarketplaceIcon 
                  type={tag.value} 
                  className={`w-6 h-6 ${
                    selectedTag === tag.value ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400'
                  }`}
                />
                <span className={`text-2xl font-bold ${
                  selectedTag === tag.value ? 'text-orange-600' : 'text-gray-900 dark:text-white'
                }`}>
                  {tagCounts[tag.value] || 0}
                </span>
              </div>
              <h3 className="font-semibold text-left text-sm">{tag.label}</h3>
              <p className="text-xs text-gray-500 text-left">tagged items</p>
            </button>
          ))}
        </div>

        {/* Products Grid with Tag Badges */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  setSelectedProduct(product);
                  setShowCheckout(true);
                }}
              >
                {/* Tag Badges */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.tags.slice(0, 2).map((tag: string) => (
                      <span 
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium"
                      >
                        <MarketplaceIcon type={tag} className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                    {product.tags.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs">
                        +{product.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Preview Image */}
                {product.preview_image_url && (
                  <img
                    src={product.preview_image_url}
                    alt={product.title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}

                {/* Product Info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-lg line-clamp-2">{product.title}</h4>
                  <MarketplaceIcon type={product.category} className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {product.description}
                </p>

                {/* Price and Category */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-600">
                    {product.price === 0 ? 'FREE' : `${product.price} AP`}
                  </span>
                  <span className="text-sm text-gray-500 capitalize">
                    {categoryMapping[product.category]?.name || product.category}
                  </span>
                </div>

                {/* Rating */}
                {product.rating_average > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-medium">{product.rating_average.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({product.total_sales} sales)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default EmbeddedMarketplace;