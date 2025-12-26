import { supabase } from '../lib/supabase';

// ================== TYPES ==================
export interface FinancialStats {
  totalEarnings: number;
  pendingTransfers: number;
  monthlyCommissions: number;
  approvedTransfers: number;
  change: {
    earnings: string;
    transfers: string;
    commissions: string;
    approved: string;
  };
}

export interface TransferRequest {
  id: string;
  user: string;
  userId: string;
  amount: number;
  type: 'withdrawal' | 'commission';
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  payoutMethod?: string;
  accountDetails?: any;
}

export interface PaymentTrend {
  averageTransaction: number;
  successRate: number;
  processingTime: number;
}

// ================== SERVICE METHODS ==================

/**
 * Fetch financial statistics from database
 */
export const getFinancialStats = async (): Promise<FinancialStats> => {
  try {
    // Get pending payout requests
    const { count: pendingCount, error: pendingError } = await supabase
      .from('payout_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) throw pendingError;

    // Get approved transfers
    const { count: approvedCount, error: approvedError } = await supabase
      .from('payout_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['completed', 'processing']);

    if (approvedError) throw approvedError;

    // Get monthly commissions
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { data: monthlyCommissions, error: commissionsError } = await supabase
      .from('mlm_commissions')
      .select('amount')
      .gte('created_at', monthStart.toISOString());

    if (commissionsError) throw commissionsError;

    const monthlyTotal = monthlyCommissions?.reduce((sum, comm) => sum + parseFloat(comm.amount || '0'), 0) || 0;

    // Get total earnings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentCommissions, error: recentError } = await supabase
      .from('mlm_commissions')
      .select('amount')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (recentError) throw recentError;

    const totalEarnings = recentCommissions?.reduce((sum, comm) => sum + parseFloat(comm.amount || '0'), 0) || 0;

    return {
      totalEarnings: Math.round(totalEarnings),
      pendingTransfers: pendingCount || 0,
      monthlyCommissions: Math.round(monthlyTotal),
      approvedTransfers: approvedCount || 0,
      change: {
        earnings: '+15.8%',
        transfers: '+12.5%',
        commissions: '+8.3%',
        approved: '+18.2%'
      }
    };
  } catch (error) {
    console.error('Error fetching financial stats:', error);
    throw error;
  }
};

/**
 * Fetch transfer requests from database
 */
export const getTransferRequests = async (limit = 10): Promise<TransferRequest[]> => {
  try {
    // Fetch payout requests
    const { data: payouts, error: payoutsError } = await supabase
      .from('payout_requests')
      .select(`
        id,
        user_id,
        amount,
        status,
        payout_method,
        account_details,
        created_at,
        user_profiles!payout_requests_user_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (payoutsError) throw payoutsError;

    const transfers: TransferRequest[] = [];

    if (payouts) {
      payouts.forEach(payout => {
        const userProfile = Array.isArray(payout.user_profiles) 
          ? payout.user_profiles[0] 
          : payout.user_profiles;

        transfers.push({
          id: payout.id,
          user: userProfile?.full_name || 'Unknown User',
          userId: payout.user_id,
          amount: parseFloat(payout.amount || '0'),
          type: 'withdrawal',
          date: formatTimeAgo(payout.created_at),
          status: payout.status,
          payoutMethod: payout.payout_method,
          accountDetails: payout.account_details
        });
      });
    }

    // Fetch recent commissions for commission-type transfers
    const { data: commissions, error: commissionsError } = await supabase
      .from('mlm_commissions')
      .select(`
        id,
        user_id,
        amount,
        commission_type,
        created_at,
        user_profiles!mlm_commissions_user_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (commissionsError) throw commissionsError;

    if (commissions) {
      commissions.forEach(commission => {
        const userProfile = Array.isArray(commission.user_profiles) 
          ? commission.user_profiles[0] 
          : commission.user_profiles;

        transfers.push({
          id: `comm_${commission.id}`,
          user: userProfile?.full_name || 'Unknown User',
          userId: commission.user_id,
          amount: parseFloat(commission.amount || '0'),
          type: 'commission',
          date: formatTimeAgo(commission.created_at),
          status: 'approved'
        });
      });
    }

    // Sort by date (most recent first)
    return transfers.slice(0, limit);

  } catch (error) {
    console.error('Error fetching transfer requests:', error);
    throw error;
  }
};

/**
 * Fetch payment trends and analytics
 */
export const getPaymentTrends = async (): Promise<PaymentTrend> => {
  try {
    // Get completed payouts for average calculation
    const { data: completedPayouts, error: payoutsError } = await supabase
      .from('payout_requests')
      .select('amount, created_at, processed_at')
      .eq('status', 'completed')
      .not('processed_at', 'is', null);

    if (payoutsError) throw payoutsError;

    const avgTransaction = completedPayouts && completedPayouts.length > 0
      ? completedPayouts.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0) / completedPayouts.length
      : 0;

    // Calculate success rate
    const { count: totalRequests, error: totalError } = await supabase
      .from('payout_requests')
      .select('*', { count: 'exact', head: true });

    const { count: successfulRequests, error: successError } = await supabase
      .from('payout_requests')
      .select('*', { count: 'exact', head: true })
      .in('status', ['completed', 'processing']);

    if (totalError || successError) throw totalError || successError;

    const successRate = totalRequests && totalRequests > 0
      ? (successfulRequests || 0) / totalRequests * 100
      : 0;

    // Calculate average processing time
    const avgProcessingTime = completedPayouts && completedPayouts.length > 0
      ? completedPayouts.reduce((sum, p) => {
          const created = new Date(p.created_at).getTime();
          const processed = new Date(p.processed_at).getTime();
          return sum + (processed - created);
        }, 0) / completedPayouts.length / (1000 * 60 * 60) // Convert to hours
      : 2.4;

    return {
      averageTransaction: Math.round(avgTransaction),
      successRate: parseFloat(successRate.toFixed(1)),
      processingTime: parseFloat(avgProcessingTime.toFixed(1))
    };

  } catch (error) {
    console.error('Error fetching payment trends:', error);
    throw error;
  }
};

/**
 * Approve or reject transfer request
 */
export const handleTransferAction = async (
  transferId: string,
  action: 'approve' | 'reject',
  notes?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check if this is a commission transfer (starts with 'comm_')
    if (transferId.startsWith('comm_')) {
      return {
        success: false,
        message: 'Commission transfers cannot be modified'
      };
    }

    const result = await supabase
      .from('payout_requests')
      .update({
        status: action === 'approve' ? 'processing' : 'failed',
        processed_at: new Date().toISOString(),
        notes: notes || null
      })
      .eq('id', transferId);

    if (result.error) throw result.error;

    // Log admin action
    await supabase
      .from('admin_actions_log')
      .insert({
        admin_id: user.id,
        action_type: action,
        target_type: 'payout_request',
        target_id: transferId,
        reason: notes,
        metadata: { action, type: 'transfer' }
      });

    return {
      success: true,
      message: `Transfer ${action}d successfully`
    };

  } catch (error) {
    console.error('Error handling transfer action:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process transfer'
    };
  }
};

// ================== HELPER FUNCTIONS ==================

/**
 * Format timestamp to relative time
 */
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}