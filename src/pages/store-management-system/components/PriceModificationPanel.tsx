import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { PriceModification } from '../types';

interface PriceModificationPanelProps {
  modifications: PriceModification[];
  onCreateModification: (modification: Omit<PriceModification, 'id' | 'modifiedDate' | 'sellerNotified'>) => void;
  onNotifySeller: (modificationId: string) => void;
}

const PriceModificationPanel = ({
  modifications,
  onCreateModification,
  onNotifySeller
}: PriceModificationPanelProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    originalPrice: 0,
    newPrice: 0,
    reason: '',
    modifiedBy: 'Administrator'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.productName && formData.newPrice > 0 && formData.reason.trim()) {
      onCreateModification(formData);
      setFormData({
        productId: '',
        productName: '',
        originalPrice: 0,
        newPrice: 0,
        reason: '',
        modifiedBy: 'Administrator'
      });
      setShowCreateForm(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(price);
  };

  const getPriceChangeColor = (original: number, newPrice: number) => {
    if (newPrice > original) return 'text-success';
    if (newPrice < original) return 'text-error';
    return 'text-muted-foreground';
  };

  const getPriceChangeIcon = (original: number, newPrice: number) => {
    if (newPrice > original) return 'TrendingUp';
    if (newPrice < original) return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-semibold text-lg text-foreground">
              Price Modifications
            </h2>
            <p className="font-body text-sm text-muted-foreground mt-1">
              {modifications.length} price changes made this month
            </p>
          </div>
          <Button
            variant="default"
            iconName="Plus"
            onClick={() => setShowCreateForm(true)}
          >
            New Modification
          </Button>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border w-full max-w-md">
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Create Price Modification
                </h3>

                <div className="space-y-4">
                  <Input
                    label="Product Name"
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                    placeholder="Enter product name"
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Original Price (ETB)"
                      type="number"
                      value={formData.originalPrice || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      required
                    />
                    <Input
                      label="New Price (ETB)"
                      type="number"
                      value={formData.newPrice || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPrice: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-body text-sm font-medium text-foreground mb-2">
                      Reason for Modification
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Explain why the price is being modified..."
                      className="w-full p-3 border border-border rounded-lg bg-input text-foreground font-body text-sm resize-none"
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="default">
                    Create Modification
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modifications List */}
      <div className="divide-y divide-border">
        {modifications.map((modification) => (
          <div key={modification.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-base text-foreground">
                  {modification.productName}
                </h3>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  {modification.reason}
                </p>

                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-2">
                    <Icon name="User" size={14} className="text-muted-foreground" />
                    <span className="font-body text-sm text-foreground">
                      Modified by {modification.modifiedBy}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Calendar" size={14} className="text-muted-foreground" />
                    <span className="font-body text-sm text-muted-foreground">
                      {modification.modifiedDate.toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Change Display */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <Icon 
                    name={getPriceChangeIcon(modification.originalPrice, modification.newPrice)} 
                    size={16} 
                    className={getPriceChangeColor(modification.originalPrice, modification.newPrice)} 
                  />
                  <span className={`font-heading font-semibold text-lg ${getPriceChangeColor(modification.originalPrice, modification.newPrice)}`}>
                    {formatPrice(modification.newPrice)}
                  </span>
                </div>
                <div className="font-body text-sm text-muted-foreground line-through">
                  {formatPrice(modification.originalPrice)}
                </div>
                <div className={`font-body text-xs mt-1 ${getPriceChangeColor(modification.originalPrice, modification.newPrice)}`}>
                  {modification.newPrice > modification.originalPrice ? '+' : ''}
                  {formatPrice(modification.newPrice - modification.originalPrice)}
                </div>
              </div>
            </div>

            {/* Notification Status */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Icon 
                  name={modification.sellerNotified ? "CheckCircle" : "AlertCircle"} 
                  size={16} 
                  className={modification.sellerNotified ? "text-success" : "text-warning"} 
                />
                <span className="font-body text-sm text-foreground">
                  Seller {modification.sellerNotified ? 'notified' : 'not notified'}
                </span>
              </div>

              {!modification.sellerNotified && (
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Send"
                  onClick={() => onNotifySeller(modification.id)}
                >
                  Notify Seller
                </Button>
              )}
            </div>
          </div>
        ))}

        {modifications.length === 0 && (
          <div className="p-12 text-center">
            <Icon name="DollarSign" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
              No price modifications
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              No price modifications have been made yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceModificationPanel;