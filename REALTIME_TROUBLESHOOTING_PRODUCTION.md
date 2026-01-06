# Real-Time Connection Troubleshooting Guide (Production)

## 🔴 Problem: Real-Time Updates Not Working on Deployed Site

Your StudentDashboard component has **comprehensive debugging built-in**. This guide explains how to use it and what each status message means.

---

## ✅ Built-In Debugging Features (Already Implemented)

### 1. **Real-Time Status Indicator**
- **Location**: Top of dashboard, below welcome message
- **States**:
  - 🟢 **Live updates active** - Real-time working perfectly
  - 🟡 **Connecting...** - Attempting to establish connection  
  - 🔴 **Using manual refresh** - Polling fallback active (updates every 30 seconds)

### 2. **Debug Panel (Production Only)**
- **How to open**: Click the dropdown "Connection Details (for debugging)" 
- **What it shows**:
  ```
  Environment: production
  Supabase URL: https://qetfonluwxtosvhptlff.supabase.co  
  WebSocket Support: Yes
  Attempt Count: 3
  Last Updated: 10:30:45 AM
  Last Error: Channel closed (timeout)
  ```

---

## 🔍 Step-By-Step Troubleshooting (Follow This Order)

### **STEP 1: Check Real-Time Toggle in Supabase Dashboard**

**CRITICAL**: The toggle on the table is **necessary but not sufficient**.

1. Go to **Supabase Dashboard** → Your Project
2. Navigate to **Database** → **Replication**  
3. Find the **`student_profiles`** table
4. Toggle **"Enable Realtime"** to **ON** (must show green checkmark)

**If this is OFF**, real-time will never work, no matter what your code does.

---

### **STEP 2: Verify Environment Variables (Deployed Site)**

Real-time connections **require correct environment variables** on your hosting platform.

**Check in Browser Console** (on your deployed site):
```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 10))
```

**Expected Output**:
```
URL: https://qetfonluwxtosvhptlff.supabase.co
Key: eyJhbGciOi...
```

**If shows `undefined`**: Environment variables are **missing or misconfigured**.

**Fix**:
1. Open your hosting platform (Vercel/Netlify/etc.)
2. Add environment variables:
   ```
   VITE_SUPABASE_URL=https://qetfonluwxtosvhptlff.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. **Redeploy your site** (environment variables only apply after redeploy)

---

### **STEP 3: Check Browser Console for WebSocket Errors**

**Open DevTools** → **Console Tab**

**Look for**:
- `🔴 Setting up real-time subscription for user:` - Shows connection attempt
- `🔴 Real-time subscription status: SUBSCRIBED` - Connection successful ✅
- `❌ Real-time connection failed:` - Connection failed ❌
- `⚠️ Max retry attempts reached. Using polling fallback.` - Polling mode active

**If you see "SUBSCRIBED"**: Real-time is working. If stats aren't updating, the issue is elsewhere (check database triggers, RLS policies).

**If you see "CHANNEL_ERROR" or "TIMED_OUT"**: WebSocket connection blocked or Realtime not enabled in Supabase.

---

### **STEP 4: Verify Network Tab (WebSocket)**

1. Open **DevTools** → **Network** tab
2. Filter by **"WS"** (WebSocket)
3. You should see: `wss://qetfonluwxtosvhptlff.supabase.co/realtime/v1/websocket`

**If missing**: 
- Environment variables wrong
- WebSocket connections blocked by firewall/proxy
- Realtime not enabled in Supabase

---

### **STEP 5: Test with SQL Update**

**While watching the debug panel**, run this in **Supabase SQL Editor**:

```sql
UPDATE public.student_profiles 
SET xp = xp + 100, aura_points = aura_points + 50 
WHERE id = 'YOUR_USER_ID_HERE';
```

**Expected Behavior**:
- Console shows: `🔴 Real-time update received:`
- XP and Aura Points **auto-increment** (no page refresh)
- Debug panel shows "Last Updated" timestamp changing

**If nothing happens**:
- Real-time not working → Check debug panel "Last Error"
- Polling fallback active → Stats update after 30 seconds

---

## 📋 Common Error Messages & Solutions

### **Error**: "Channel closed"
**Meaning**: WebSocket connection dropped  
**Solutions**:
1. Check Supabase project status (Dashboard → Project Health)
2. Verify WebSocket support: `console.log(typeof WebSocket)`
3. Check firewall/proxy settings blocking WebSocket

---

### **Error**: "Connection error: invalid JWT"  
**Meaning**: `VITE_SUPABASE_ANON_KEY` is wrong or expired  
**Solution**: Copy correct anon key from Supabase Dashboard → Settings → API

---

### **Error**: "Polling error: connection refused"
**Meaning**: Can't reach Supabase at all  
**Solution**: 
1. Check `VITE_SUPABASE_URL` is correct
2. Verify Supabase project is not paused

---

### **Status**: "Using polling fallback (real-time failed)"
**Meaning**: Real-time couldn't connect, but **app still works** (updates every 30 seconds)  
**Impact**: Stats update with 30-second delay instead of instantly  
**Solution**: 
1. Enable Realtime in Supabase Dashboard
2. Fix environment variables
3. Redeploy site

---

## 🧪 Testing Real-Time (End-to-End)

### **Test 1: Connection Establishment**
1. Open deployed site
2. Check debug panel shows "Environment: production"
3. Wait for status to show 🟢 "Live updates active"
4. If stuck on 🟡 "Connecting..." for >10 seconds → Problem

### **Test 2: Live Update**
1. Keep dashboard open
2. Run SQL update (Step 5 above)
3. Watch XP number **increment without refresh**
4. Check Console logs for `🔴 Real-time update received:`

### **Test 3: Polling Fallback**
1. Disable Realtime in Supabase Dashboard
2. Wait 30 seconds
3. Run SQL update
4. Stats should update after 30 seconds (not instant)
5. Debug panel shows "Using polling fallback"

---

## 🚨 When to Use Polling Fallback Permanently

**Scenario**: Real-time keeps failing after all troubleshooting.

**Decision**: If you can't fix real-time, **polling fallback is reliable**:
- ✅ No code changes needed (already implemented)
- ✅ Updates every 30 seconds automatically
- ✅ No data loss
- ❌ Not "instant" updates (30-second delay)

**To verify polling is working**:
1. Check debug panel shows "Using polling fallback"
2. Run SQL update
3. Wait 30 seconds
4. Stats should update

---

## 🔧 Emergency Fixes

### **Fix 1: Force Refresh**
If dashboard shows stale data:
```javascript
// In browser console
window.location.reload()
```

### **Fix 2: Clear Cache**
If stats never update:
1. Open DevTools → Application → Storage → Clear site data
2. Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### **Fix 3: Manually Trigger Polling**
If automatic polling stops:
1. Close tab
2. Reopen deployed site
3. Polling restarts automatically

---

## ✅ Success Checklist

Your real-time is **working correctly** if:
- [ ] Status shows 🟢 "Live updates active"
- [ ] Debug panel shows "Last Error: null"
- [ ] WebSocket connection visible in Network tab
- [ ] SQL updates reflect **instantly** (< 2 seconds)
- [ ] Console shows `🔴 Real-time update received:`

If polling fallback is active:
- [ ] Status shows 🔴 "Using manual refresh"  
- [ ] Debug panel shows "Using polling fallback (real-time failed)"
- [ ] SQL updates reflect **after 30 seconds**
- [ ] No console errors (polling is silent)

---

## 📞 Still Not Working?

**Check these final items**:
1. **Supabase Project Status**: Dashboard → Project Health (not paused/suspended)
2. **RLS Policies**: Ensure `student_profiles` allows SELECT for authenticated users
3. **Database Triggers**: Check `user_profiles` has trigger for real-time events
4. **Browser Compatibility**: Try different browser (Chrome, Firefox, Safari)
5. **Network Restrictions**: Corporate firewalls may block WebSocket (port 443)

---

## 🎯 Key Takeaway

Your StudentDashboard **already has everything needed**:
- ✅ Comprehensive debugging UI
- ✅ Automatic retry logic  
- ✅ Polling fallback
- ✅ Error tracking

**The issue is NOT in your code** - it's either:
1. Realtime not enabled in Supabase Dashboard
2. Missing environment variables on deployed site
3. WebSocket connections blocked by network

**Follow the steps above in order** and you'll identify the exact issue.