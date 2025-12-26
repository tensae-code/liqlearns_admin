import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { BarcodeWallet } from '../types';

interface BarcodeWalletGeneratorProps {
  wallets: BarcodeWallet[];
  onGenerateWallet: (userId: string, userName: string) => void;
  onToggleWallet: (walletId: string) => void;
  className?: string;
}

const BarcodeWalletGenerator = ({ 
  wallets, 
  onGenerateWallet, 
  onToggleWallet, 
  className = '' 
}: BarcodeWalletGeneratorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newUserName, setNewUserName] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const filteredWallets = wallets.filter(wallet =>
    wallet.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wallet.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateWallet = () => {
    if (newUserId.trim() && newUserName.trim()) {
      onGenerateWallet(newUserId.trim(), newUserName.trim());
      setNewUserId('');
      setNewUserName('');
      setShowGenerator(false);
    }
  };

  const generateQRCode = (walletAddress: string) => {
    // Mock QR code generation - in real app, use QR code library
    return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(walletAddress)}`;
  };

  return (
    <div className={`bg-card rounded-lg border border-border shadow-card ${className}`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
              Barcode Wallet Management
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              Generate and manage payment wallets with QR codes
            </p>
          </div>
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={() => setShowGenerator(true)}
          >
            Generate Wallet
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            type="search"
            placeholder="Search by user name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Icon 
            name="Search" 
            size={16} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
          />
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="p-6">
        {filteredWallets.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Wallet" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="font-body text-sm text-muted-foreground">
              {searchTerm ? 'No wallets found matching your search' : 'No wallets generated yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWallets.map((wallet) => (
              <div key={wallet.id} className="border border-border rounded-lg p-4 hover:shadow-card transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-body font-medium text-sm text-foreground">
                      {wallet.userName}
                    </p>
                    <p className="font-caption text-xs text-muted-foreground">
                      ID: {wallet.userId}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    wallet.isActive ? 'bg-success' : 'bg-error'
                  }`} />
                </div>

                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  <div className="p-2 bg-white rounded-lg border">
                    <Image
                      src={generateQRCode(wallet.walletAddress)}
                      alt={`QR code for ${wallet.userName} wallet containing payment address ${wallet.walletAddress}`}
                      className="w-20 h-20"
                    />
                  </div>
                </div>

                {/* Wallet Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="font-caption text-xs text-muted-foreground">Balance:</span>
                    <span className="font-data text-xs font-medium text-foreground">
                      {formatCurrency(wallet.balance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-caption text-xs text-muted-foreground">Created:</span>
                    <span className="font-caption text-xs text-muted-foreground">
                      {formatDate(wallet.createdDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-caption text-xs text-muted-foreground">Address:</span>
                    <span className="font-data text-xs text-muted-foreground truncate max-w-24">
                      {wallet.walletAddress}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={wallet.isActive ? "destructive" : "success"}
                    iconName={wallet.isActive ? "Pause" : "Play"}
                    onClick={() => onToggleWallet(wallet.id)}
                    fullWidth
                  >
                    {wallet.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Wallet Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100]">
          <div className="bg-popover border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="font-heading text-lg font-semibold text-popover-foreground mb-4">
              Generate New Wallet
            </h4>
            
            <div className="space-y-4">
              <Input
                label="User ID"
                type="text"
                placeholder="Enter user ID"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                required
              />
              <Input
                label="User Name"
                type="text"
                placeholder="Enter user name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowGenerator(false);
                  setNewUserId('');
                  setNewUserName('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleGenerateWallet}
                disabled={!newUserId.trim() || !newUserName.trim()}
              >
                Generate Wallet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeWalletGenerator;