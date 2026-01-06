# Real-Time Connection Debugging Guide

## Problem
Real-time updates show "Live updates active" on Rocket AI preview but "offline" on deployed website.

## Root Causes

### 1. Environment Variable Issues
**Symptom**: Connection fails immediately on deployed site
**Cause**: Missing or incorrect `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`

**Fix**:
1. Verify environment variables on your deployment platform (Vercel/Netlify/etc)
2. Ensure variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Rebuild and redeploy after setting variables

### 2. Supabase Realtime Not Enabled
**Symptom**: WebSocket connection times out or returns CHANNEL_ERROR
**Cause**: Realtime feature not enabled in Supabase project

**Fix**:
1. Go to Supabase Dashboard → Project Settings → API
2. Scroll to "Realtime" section
3. Ensure "Enable Realtime" is toggled ON
4. Check that your table (`student_profiles`) has "Realtime" enabled

### 3. Domain Whitelist Restrictions
**Symptom**: Connection works on localhost but fails on deployed domain
**Cause**: Deployed domain not whitelisted in Supabase

**Fix**:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your deployed domain to "Site URL" and "Redirect URLs"
3. Example: `https://yourdomain.com` or `https://your-app.vercel.app`

### 4. WebSocket Protocol Mismatch
**Symptom**: Browser console shows WebSocket connection refused
**Cause**: HTTPS/WSS protocol mismatch

**Fix**:
- Ensure your Supabase URL uses `https://` (not `http://`)
- Browser automatically converts `https://` to `wss://` for WebSocket
- Mixed content (HTTP page trying WSS connection) will fail

### 5. Network/Firewall Restrictions
**Symptom**: Connection works on some networks but not others
**Cause**: Corporate firewall or network policy blocking WebSocket

**Fix**:
- Test on different networks (mobile data, different WiFi)
- Check if polling fallback activates (indicated by "Using manual refresh")
- Contact network admin if corporate firewall is blocking WebSocket

## Debugging Steps

### Step 1: Check Browser Console
Open browser developer tools (F12) and look for:
```
🔴 Setting up real-time subscription for user: [user-id]
🌐 Environment: production
🔗 Supabase URL: [your-supabase-url]
🔌 WebSocket supported: true
```

### Step 2: Verify Connection Status
Look for status updates in console:
```
✅ Real-time connection established successfully
🌐 Connected at: [timestamp]
```

If you see errors:
```
❌ Real-time connection failed: CHANNEL_ERROR
🔗 Supabase URL: [url]
🔌 WebSocket support: true
```

### Step 3: Use Debug Panel
On the deployed site, expand "Connection Details (for debugging)" to see:
- Environment (should be "production")
- Supabase URL (should match your project)
- WebSocket Support (should be "Yes")
- Attempt Count (number of connection attempts)
- Last Error (specific error message)

### Step 4: Test WebSocket Support
Run this in browser console on your deployed site:
```javascript
const ws = new WebSocket('wss://echo.websocket.org');
ws.onopen = () => console.log('✅ WebSocket WORKS');
ws.onerror = () => console.error('❌ WebSocket BLOCKED');
```

### Step 5: Verify Supabase Realtime
Test direct Supabase connection:
```javascript
const { createClient } = supabase;
const client = createClient('YOUR_URL', 'YOUR_KEY');
const channel = client.channel('test');
channel.subscribe((status) => console.log('Status:', status));
```

## Solutions by Status Message

### "Live updates active" ✅
Everything working correctly. No action needed.

### "Connecting..." 🟡 (stays yellow)
**Issue**: WebSocket handshake not completing
**Solutions**:
1. Check Supabase Realtime is enabled
2. Verify environment variables are correct
3. Check domain is whitelisted
4. Wait for retry attempts (3 total)

### "Using manual refresh" 🔴
**Issue**: WebSocket failed, using polling fallback
**Solutions**:
1. Enable Supabase Realtime
2. Check firewall/network restrictions
3. Verify environment variables
4. Polling will update every 30 seconds (slower but functional)

## Common Error Messages

### "Failed to construct 'WebSocket': The URL '[url]' is invalid"
- Environment variable `VITE_SUPABASE_URL` is missing or malformed
- Check deployment platform environment variables

### "WebSocket connection to 'wss://...' failed: Error in connection establishment"
- Domain not whitelisted in Supabase
- Network/firewall blocking WebSocket
- Supabase Realtime not enabled

### "CHANNEL_ERROR"
- Supabase Realtime not enabled on project or table
- Invalid channel configuration
- Authentication issue with Supabase

### "TIMED_OUT"
- Network too slow or unstable
- Firewall delaying WebSocket handshake
- Supabase project overloaded (rare)

## Testing Real-Time Updates

### Manual Test Steps:
1. Open your deployed dashboard in Tab 1
2. Watch the connection status indicator
3. Open Supabase SQL Editor in Tab 2
4. Run this query:
```sql
UPDATE student_profiles 
SET xp = xp + 100 
WHERE id = 'YOUR_USER_ID';
```
5. In Tab 1, XP should update automatically within 1-2 seconds

### Expected Behavior:
- ✅ XP updates without page refresh
- ✅ Console shows "🔴 Real-time update received"
- ✅ Status stays "🟢 Live updates active"

### If Not Working:
- ❌ XP doesn't update → Check console for errors
- ❌ Status shows "🔴 Using manual refresh" → Check Supabase Realtime enabled
- ❌ Console shows connection errors → Check environment variables and domain whitelist

## Quick Fix Checklist

- [ ] Environment variables set correctly on deployment platform
- [ ] Supabase Realtime enabled in project settings
- [ ] Deployed domain whitelisted in Supabase authentication settings
- [ ] HTTPS (not HTTP) for deployed site
- [ ] Browser developer console shows connection logs
- [ ] WebSocket support verified in browser
- [ ] Firewall/network not blocking WebSocket

## Contact Points

If issue persists after following this guide:
1. Check Supabase status page: https://status.supabase.com
2. Review Supabase docs: https://supabase.com/docs/guides/realtime
3. Test on different network/device to isolate issue
4. Contact deployment platform support if environment variables not working

## Polling Fallback

If real-time fails after 3 retries, system automatically switches to polling:
- Updates every 30 seconds instead of instantly
- Shows "🔴 Using manual refresh" status
- Still functional, just slower
- Refresh button available to manually update