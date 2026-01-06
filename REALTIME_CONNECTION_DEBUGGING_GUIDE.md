# Real-Time Notifications Connection Debugging Guide

## Problem: Real-Time Connection Failed

This guide helps diagnose and fix real-time notification connection failures in Supabase Realtime.

---

## Root Causes & Solutions

### 1. Realtime Not Enabled for `notifications` Table

**Most Common Issue**: The `notifications` table must have Realtime explicitly enabled in Supabase.

**Fix in Supabase Dashboard**:
1. Go to Database → Replication
2. Find the `notifications` table
3. Enable replication for this table
4. Click "Save" or "Enable Replication"

**Verify via SQL**:
```sql
-- Check if realtime is enabled for notifications table
SELECT schemaname, tablename, 
       'INSERT' = ANY(string_to_array(substring(obj_description(c.oid), 'replica_identity:\s*(\w+)'), ',')) as has_insert_trigger
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'notifications' AND n.nspname = 'public';

-- Enable realtime for notifications table (if not enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

---

### 2. Row Level Security (RLS) Blocking Access

**Issue**: Even with Realtime enabled, RLS policies can block real-time subscriptions.

**Check Current RLS Policies**:
```sql
-- View existing RLS policies on notifications table
SELECT * FROM pg_policies WHERE tablename = 'notifications';
```

**Required RLS Policy for Realtime**:
```sql
-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to receive their own notifications via Realtime
CREATE POLICY "Users can receive their own notifications via Realtime"
ON notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for inserting notifications (system/admin only)
CREATE POLICY "System can insert notifications"
ON notifications
FOR INSERT
WITH CHECK (true);  -- Adjust based on your security requirements
```

---

### 3. Incorrect Channel Filter Syntax

**Issue**: Filter syntax must be exact for postgres_changes.

**Correct Syntax**:
```typescript
// ✅ CORRECT - Simple equality filter
filter: `user_id=eq.${userId}`

// ❌ INCORRECT - Wrong operators
filter: `user_id=${userId}`  // Missing =eq.
filter: `user_id==eq.${userId}`  // Double equals
filter: `user_id==${userId}`  // Wrong format
```

---

### 4. Channel Subscription Lifecycle Issues

**Issue**: Not properly managing channel state and cleanup.

**Solution Already Implemented** in gamificationService.ts:
```typescript
// ✅ Proper channel subscription with status monitoring
const channel = supabase.channel(`notifications:${userId}`);

channel.on('postgres_changes', { /* config */ }, callback);

// Subscribe with status callback
channel.subscribe((status) => {
  console.log('🔔 Realtime channel status:', status);
  // status can be: 'SUBSCRIBED', 'TIMED_OUT', 'CLOSED', 'CHANNEL_ERROR'
});

// Proper cleanup in useEffect
return () => {
  channel.unsubscribe();
};
```

---

## Testing Real-Time Connection

### Manual Test in Supabase SQL Editor

```sql
-- 1. Insert a test notification for your user
INSERT INTO notifications (user_id, type, title, message, data, is_read)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with your actual user ID
  'test',
  'Test Notification',
  'This is a test notification',
  '{"test": true}'::jsonb,
  false
);

-- 2. Check if it was inserted
SELECT * FROM notifications WHERE user_id = 'YOUR_USER_ID_HERE' ORDER BY created_at DESC LIMIT 1;
```

If your browser console shows the notification after insert, Realtime is working!

---

## Debugging Tools

### Browser Console Monitoring

Add these logs to your RealTimeNotifications component:

```typescript
useEffect(() => {
  if (!user) return;

  console.log('🔌 Initializing Realtime for user:', user.id);

  const channel = subscribeToNotifications(user.id, (notification) => {
    console.log('📨 Notification received:', notification);
    console.log('📊 Channel state:', channel.state);
  });

  // Monitor channel state changes
  const stateChangeHandler = (state: string) => {
    console.log('🔄 Channel state changed:', state);
  };

  // Add connection monitoring
  const connectionCheckInterval = setInterval(() => {
    console.log('📡 Current channel state:', channel.state);
    console.log('📡 Connection status:', channel.socket?.connectionState());
  }, 5000);

  return () => {
    clearInterval(connectionCheckInterval);
    console.log('🔌 Disconnecting from realtime channel');
    channel.unsubscribe();
  };
}, [user]);
```

---

## Supabase Client Configuration

### Verify Supabase Client Setup

Check your `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    // Optional: Configure Realtime parameters
    params: {
      eventsPerSecond: 10,  // Rate limiting
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

---

## Production Checklist

Before deploying:

- [ ] Realtime enabled for `notifications` table
- [ ] RLS policies allow SELECT for user's own notifications
- [ ] RLS policies allow INSERT for system/admin
- [ ] Channel filter syntax is correct (`user_id=eq.${userId}`)
- [ ] Environment variables are set correctly
- [ ] Channel cleanup happens in useEffect return
- [ ] Status monitoring is implemented
- [ ] Error handling catches subscription failures

---

## Common Error Messages

### "Realtime is not enabled"
**Solution**: Enable Realtime in Supabase Dashboard → Database → Replication

### "403 Forbidden" or "Permission denied"
**Solution**: Check RLS policies - user must have SELECT permission

### "Channel timed out"
**Solution**: 
- Check internet connection
- Verify Supabase project is not paused
- Check firewall/proxy settings

### "subscription failed"
**Solution**: Verify table name, schema, and filter syntax

---

## Additional Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Postgres Changes Documentation](https://supabase.com/docs/guides/realtime/postgres-changes)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## Quick Fix Summary

**Most likely fix for "Real-time connection failed":**

1. Go to Supabase Dashboard
2. Navigate to Database → Replication
3. Find `notifications` table
4. Enable replication
5. Refresh your app

If that doesn't work, check RLS policies next.