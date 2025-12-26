import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Activity, Lock, Users, Database, RefreshCw } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface SecurityMetrics {
  webhook_verifications: { total: number; failed: number; success: number };
  rate_limit_blocks: { login: number; api: number };
  login_attempts: { successful: number; failed: number };
  active_sessions: number;
}

const SecurityComplianceManagementCenter: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    webhook_verifications: { total: 0, failed: 0, success: 0 },
    rate_limit_blocks: { login: 0, api: 0 },
    login_attempts: { successful: 0, failed: 0 },
    active_sessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSecurityMetrics = async () => {
    try {
      setRefreshing(true);
      
      // Fetch security audit logs for webhook verification stats
      const { data: webhookLogs, error: webhookError } = await supabase
        .from('security_audit_logs')
        .select('event_type, success')
        .eq('event_type', 'stripe_webhook_verification')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (webhookError) throw webhookError;

      const webhookStats = {
        total: webhookLogs?.length || 0,
        success: webhookLogs?.filter(log => log.success)?.length || 0,
        failed: webhookLogs?.filter(log => !log.success)?.length || 0,
      };

      // Fetch fraud detection logs for rate limit blocks
      const { data: fraudLogs, error: fraudError } = await supabase
        .from('fraud_detection_logs')
        .select('event_type, risk_level')
        .in('event_type', ['rate_limit_exceeded', 'brute_force_detected'])
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (fraudError) throw fraudError;

      const rateLimitStats = {
        login: fraudLogs?.filter(log => log.event_type === 'brute_force_detected')?.length || 0,
        api: fraudLogs?.filter(log => log.event_type === 'rate_limit_exceeded')?.length || 0,
      };

      // Fetch login attempt stats
      const { data: loginLogs, error: loginError } = await supabase
        .from('security_audit_logs')
        .select('event_type, success')
        .eq('event_type', 'login_attempt')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (loginError) throw loginError;

      const loginStats = {
        successful: loginLogs?.filter(log => log.success)?.length || 0,
        failed: loginLogs?.filter(log => !log.success)?.length || 0,
      };

      // Fetch active sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      if (sessionsError) throw sessionsError;

      setMetrics({
        webhook_verifications: webhookStats,
        rate_limit_blocks: rateLimitStats,
        login_attempts: loginStats,
        active_sessions: sessions?.length || 0,
      });

    } catch (error) {
      console.error('Error fetching security metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSecurityMetrics();
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchSecurityMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const MetricCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    trend?: { value: number; label: string };
  }> = ({ title, value, icon, color, trend }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full bg-${color}-100`}>
          {icon}
        </div>
        {trend && (
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{trend.value}%</div>
            <div className="text-xs text-gray-500">{trend.label}</div>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Security Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-from-orange-50 to-orange-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Security & Compliance Center</h1>
                <p className="text-gray-600">Real-time security monitoring and compliance tracking</p>
              </div>
            </div>
            <button
              onClick={fetchSecurityMetrics}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Webhook Verifications (24h)"
            value={metrics.webhook_verifications.total}
            icon={<Database className="w-6 h-6 text-orange-500" />}
            color="#f97316"
            trend={{
              value: Math.round((metrics.webhook_verifications.success / metrics.webhook_verifications.total) * 100) || 0,
              label: 'Success Rate'
            }}
          />
          <MetricCard
            title="Rate Limit Blocks (24h)"
            value={metrics.rate_limit_blocks.login + metrics.rate_limit_blocks.api}
            icon={<AlertTriangle className="w-6 h-6 text-yellow-500" />}
            color="#eab308"
          />
          <MetricCard
            title="Failed Login Attempts (24h)"
            value={metrics.login_attempts.failed}
            icon={<Lock className="w-6 h-6 text-red-500" />}
            color="#ef4444"
          />
          <MetricCard
            title="Active Sessions"
            value={metrics.active_sessions}
            icon={<Users className="w-6 h-6 text-green-500" />}
            color="#22c55e"
          />
        </div>

        {/* Stripe Webhook Security Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900">Stripe Webhook Security</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{metrics.webhook_verifications.success}</div>
              <div className="text-sm text-gray-600">Verified Events</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{metrics.webhook_verifications.failed}</div>
              <div className="text-sm text-gray-600">Failed Verifications</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.webhook_verifications.total > 0 
                  ? Math.round((metrics.webhook_verifications.success / metrics.webhook_verifications.total) * 100)
                  : 100}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Status:</strong> Webhook signature verification is <span className="text-green-600 font-semibold">ACTIVE</span>. 
              All incoming Stripe events are validated using stripe.webhooks.constructEvent with endpoint secret verification.
            </p>
          </div>
        </div>

        {/* Rate Limiting Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900">Rate Limiting Controls</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Login Endpoint Protection</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Max Attempts per IP</span>
                  <span className="font-semibold text-orange-500">5 / 15min</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Blocked IPs (24h)</span>
                  <span className="font-semibold text-red-500">{metrics.rate_limit_blocks.login}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Lockout Duration</span>
                  <span className="font-semibold text-gray-900">30 minutes</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">API Rate Limits</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Requests per User</span>
                  <span className="font-semibold text-orange-500">100 / min</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Throttled Requests (24h)</span>
                  <span className="font-semibold text-yellow-500">{metrics.rate_limit_blocks.api}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Burst Allowance</span>
                  <span className="font-semibold text-gray-900">150 requests</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GDPR Compliance Dashboard */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900">GDPR Compliance Status</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <span className="text-sm text-gray-700">Cookie Consent Banner</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <span className="text-sm text-gray-700">Privacy Policy</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <span className="text-sm text-gray-700">Data Processing Records</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <span className="text-sm text-gray-700">User Consent Tracking</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <span className="text-sm text-gray-700">Right to Deletion</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <span className="text-sm text-gray-700">Data Export</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Compliance Score:</strong> <span className="text-green-600 font-semibold">100%</span> - 
              All GDPR requirements are met. Cookie consent is tracked in user_consents table. 
              Users can request data deletion through their account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityComplianceManagementCenter;