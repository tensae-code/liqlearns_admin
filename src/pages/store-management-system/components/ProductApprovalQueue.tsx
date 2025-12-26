import React, { useState } from 'react';

import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { Product, BulkAction } from '../types';

interface ProductApprovalQueueProps {
  products: Product[];
  onApprove: (productId: string) => void;
  onReject: (productId: string, reason: string) => void;
  onBulkAction: (action: BulkAction) => void;
  onProductClick: (product: Product) => void;
}

const ProductApprovalQueue: React.FC<ProductApprovalQueueProps> = ({
  products,
  onApprove,
  onReject,
  onBulkAction,
  onProductClick
}) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectingProduct, setRejectingProduct] = useState<string | null>(null);

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleBulkApprove = () => {
    if (selectedProducts.length > 0) {
      onBulkAction({
        type: 'approve',
        productIds: selectedProducts
      });
      setSelectedProducts([]);
    }
  };

  const handleBulkReject = () => {
    if (selectedProducts.length > 0 && rejectionReason.trim()) {
      onBulkAction({
        type: 'reject',
        productIds: selectedProducts,
        reason: rejectionReason
      });
      setSelectedProducts([]);
      setRejectionReason('');
    }
  };

  const handleReject = (productId: string) => {
    if (rejectionReason.trim()) {
      onReject(productId, rejectionReason);
      setShowRejectModal(null);
      setRejectionReason('');
    }
  };

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'approved': return 'text-success bg-success/10';
      case 'rejected': return 'text-error bg-error/10';
      case 'under_review': return 'text-warning bg-warning/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(price);
  };

  const getLevelBadgeColor = (level: string) => {
    const colors = {
      'Beginner': 'bg-blue-100 text-blue-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-green-100 text-green-800',
      'Expert': 'bg-purple-100 text-purple-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden max-w-full">
      {/* Header with Bulk Actions */}
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-heading font-semibold text-lg text-foreground truncate">
              Product Approval Queue
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-1">
              {products.length} products pending review
            </p>
          </div>

          {selectedProducts.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-body text-sm text-muted-foreground whitespace-nowrap">
                {selectedProducts.length} selected
              </span>
              <Button
                variant="success"
                size="sm"
                iconName="Check"
                onClick={handleBulkApprove}
              >
                Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                iconName="X"
                onClick={() => setShowRejectModal('bulk')}
              >
                Reject
              </Button>
            </div>
          )}
        </div>

        {/* Select All Checkbox */}
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="selectAll"
            checked={selectedProducts.length === products.length && products.length > 0}
            onChange={handleSelectAll}
            className="w-4 h-4 text-primary bg-input border-border rounded focus:ring-primary focus:ring-2 flex-shrink-0"
          />
          <label htmlFor="selectAll" className="font-body text-sm text-foreground select-none">
            Select all products
          </label>
        </div>
      </div>

      {/* Product Grid - FIXED: Added max-w-full and proper overflow handling */}
      <div className="max-w-full overflow-x-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-6">
          {products.map((product) => (
            <div
              key={product.id}
              className={`relative group bg-background border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer max-w-full ${
                selectedProducts.includes(product.id) ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onProductClick(product)}
            >
              {/* Checkbox - Fixed positioning */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleProductSelect(product.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 text-primary border-border rounded focus:ring-primary focus:ring-offset-0 flex-shrink-0"
                />
              </div>

              {/* Product Image - Fixed dimensions */}
              <div className="w-full h-40 sm:h-48 overflow-hidden bg-muted">
                <img
                  src={product.images[0]}
                  alt={product.imageAlts[0]}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Details - FIXED: Proper overflow and text wrapping */}
              <div className="p-3 sm:p-4 space-y-3 min-w-0">
                <div className="min-w-0 w-full space-y-1">
                  <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground break-words line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-muted-foreground break-words line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Seller Info - FIXED: Better overflow handling */}
                <div className="flex items-start gap-2 pt-2 border-t border-border min-w-0">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="font-body text-xs text-muted-foreground">Seller</p>
                    <p className="font-body font-medium text-sm text-foreground truncate">{product.sellerName}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded border whitespace-nowrap flex-shrink-0 ${getLevelBadgeColor(product.sellerLevel)}`}>
                    {product.sellerLevel}
                  </span>
                </div>

                {/* Price Info - FIXED: Better responsive layout */}
                <div className="flex items-center gap-3 flex-wrap min-w-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs text-muted-foreground">Proposed</p>
                    <p className="font-heading font-bold text-sm sm:text-base text-foreground truncate">
                      ETB {product.proposedPrice.toFixed(2)}
                    </p>
                  </div>
                  {product.price !== product.proposedPrice && (
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs text-muted-foreground">Original</p>
                      <p className="font-body text-xs sm:text-sm text-muted-foreground line-through truncate">
                        ETB {product.price.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status - FIXED: Better responsive layout */}
                <div className="flex items-center justify-between pt-2 border-t border-border gap-2 flex-wrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                    product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    product.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                    product.status === 'approved'? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Action Buttons - FIXED: Better layout */}
                {product.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        onApprove(product.id);
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRejectModal(product.id);
                        setRejectingProduct(product.id);
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border w-full max-w-md mx-4">
            <div className="p-4 sm:p-6">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                Reject Product{showRejectModal === 'bulk' ? 's' : ''}
              </h3>
              <p className="font-body text-sm text-muted-foreground mb-4">
                Please provide a reason for rejection:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-3 border border-border rounded-lg bg-input text-foreground font-body text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectionReason('');
                    setRejectingProduct(null);
                  }}
                  className="flex-1 min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (showRejectModal === 'bulk') {
                      handleBulkReject();
                    } else if (rejectingProduct) {
                      handleReject(rejectingProduct);
                    }
                  }}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 min-w-[100px]"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductApprovalQueue;