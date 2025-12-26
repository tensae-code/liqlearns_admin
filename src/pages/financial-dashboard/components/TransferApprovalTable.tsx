import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { MoneyTransfer } from '../types';

interface TransferApprovalTableProps {
  transfers: MoneyTransfer[];
  onApprove: (transferId: string, reason?: string) => void;
  onReject: (transferId: string, reason: string) => void;
  className?: string;
}

const TransferApprovalTable = ({ 
  transfers, 
  onApprove, 
  onReject, 
  className = '' 
}: TransferApprovalTableProps) => {
  const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: MoneyTransfer['status']) => {
    const statusConfig = {
      pending: { color: 'bg-warning/10 text-warning', icon: 'Clock', label: 'Pending' },
      approved: { color: 'bg-success/10 text-success', icon: 'CheckCircle', label: 'Approved' },
      rejected: { color: 'bg-error/10 text-error', icon: 'XCircle', label: 'Rejected' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon name={config.icon} size={12} />
        <span>{config.label}</span>
      </span>
    );
  };

  const handleApprove = (transferId: string) => {
    onApprove(transferId);
  };

  const handleRejectClick = (transferId: string) => {
    setSelectedTransfer(transferId);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (selectedTransfer && rejectReason.trim()) {
      onReject(selectedTransfer, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedTransfer(null);
    }
  };

  const pendingTransfers = transfers.filter(t => t.status === 'pending');

  return (
    <div className={`bg-card rounded-lg border border-border shadow-card ${className}`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
              Transfer Approvals
            </h3>
            <p className="font-body text-sm text-muted-foreground">
              {pendingTransfers.length} transfers pending approval
            </p>
          </div>
          <Button variant="outline" iconName="Download" iconPosition="left">
            Export
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-body font-medium text-sm text-muted-foreground">
                Sender
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-muted-foreground">
                Receiver
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-muted-foreground">
                Amount
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-muted-foreground">
                Purpose
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-muted-foreground">
                Date
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-muted-foreground">
                Status
              </th>
              <th className="text-left p-4 font-body font-medium text-sm text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((transfer) => (
              <tr key={transfer.id} className="border-b border-border hover:bg-muted/30">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={transfer.senderAvatar}
                      alt={`${transfer.senderName} profile photo showing professional headshot`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-body font-medium text-sm text-foreground">
                        {transfer.senderName}
                      </p>
                      <p className="font-caption text-xs text-muted-foreground">
                        ID: {transfer.senderId}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={transfer.receiverAvatar}
                      alt={`${transfer.receiverName} profile photo showing professional headshot`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-body font-medium text-sm text-foreground">
                        {transfer.receiverName}
                      </p>
                      <p className="font-caption text-xs text-muted-foreground">
                        ID: {transfer.receiverId}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-data font-medium text-sm text-foreground">
                    {formatCurrency(transfer.amount)}
                  </p>
                </td>
                <td className="p-4">
                  <p className="font-body text-sm text-foreground max-w-xs truncate">
                    {transfer.purpose}
                  </p>
                </td>
                <td className="p-4">
                  <p className="font-caption text-sm text-muted-foreground">
                    {formatDate(transfer.requestDate)}
                  </p>
                </td>
                <td className="p-4">
                  {getStatusBadge(transfer.status)}
                </td>
                <td className="p-4">
                  {transfer.status === 'pending' ? (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="success"
                        iconName="Check"
                        onClick={() => handleApprove(transfer.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        iconName="X"
                        onClick={() => handleRejectClick(transfer.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="font-caption text-xs text-muted-foreground">
                      {transfer.reviewDate ? formatDate(transfer.reviewDate) : 'N/A'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100]">
          <div className="bg-popover border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="font-heading text-lg font-semibold text-popover-foreground mb-4">
              Reject Transfer
            </h4>
            <p className="font-body text-sm text-muted-foreground mb-4">
              Please provide a reason for rejecting this transfer request.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-border rounded-lg resize-none h-24 font-body text-sm"
            />
            <div className="flex items-center justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedTransfer(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
              >
                Reject Transfer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferApprovalTable;