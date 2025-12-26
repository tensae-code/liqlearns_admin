# 📧 Email Edge Function Debugging Guide

## 🚨 Problem: Email not sending, no errors in Resend

This guide helps debug when the `send-email-otp` Edge Function isn't working as expected.

---

## 📋 Quick Diagnostic Checklist

### 1. **Check Edge Function Deployment**
```bash
# Verify function is deployed
supabase functions list

# Expected output should show:
# - send-email-otp
```

### 2. **Verify Environment Variables**
Go to Supabase Dashboard → Edge Functions → Settings → Secrets

Required secrets:
- ✅ `GMAIL_USER`: liqlearns@gmail.com
- ✅ `GMAIL_APP_PASSWORD`: [Your Gmail App Password]

**How to get Gmail App Password:**
1. Go to https://myaccount.google.com/
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate new app password for "Mail"
5. Copy the 16-character password
6. Add to Supabase secrets as `GMAIL_APP_PASSWORD`

### 3. **Test Edge Function Directly**

#### Using cURL:
```bash
curl -X POST \
  https://[YOUR-PROJECT-ID].supabase.co/functions/v1/send-email-otp \
  -H "Authorization: Bearer [YOUR-ANON-KEY]" \
  -H "Content-Type: application/json" \
  -d '{"to":"mamechatensae@gmail.com","code":"123456"}'
```

#### Using the test endpoint:
```bash
# First, deploy test endpoint
supabase functions deploy send-email-otp --import-map=./supabase/functions/import_map.json

# Test health check
curl https://[YOUR-PROJECT-ID].supabase.co/functions/v1/send-email-otp/test-endpoint

# Send test email
curl -X POST \
  https://[YOUR-PROJECT-ID].supabase.co/functions/v1/send-email-otp/test-endpoint \
  -H "Content-Type: application/json" \
  -d '{"email":"mamechatensae@gmail.com"}'
```

### 4. **Check Edge Function Logs**

In Supabase Dashboard:
1. Go to Edge Functions
2. Click on `send-email-otp`
3. View Logs tab

Look for log entries with request IDs:
```
[REQUEST xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx] POST /send-email-otp
[REQUEST xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx] Attempting to send email to: mamechatensae@gmail.com
```

If you see NO logs at all → Function isn't being called (check frontend integration)

---

## 🔍 Common Issues & Solutions

### Issue 1: "No logs in Resend account"
**Root Cause:** You're using Gmail SMTP, not Resend API
- Gmail SMTP doesn't log to Resend dashboard
- Check Gmail's "Sent" folder instead
- Or check Edge Function logs in Supabase

### Issue 2: "Missing GMAIL_APP_PASSWORD"
**Symptoms:** Edge Function returns 500 error
**Solution:**
1. Generate Gmail App Password (see step 2 above)
2. Add to Supabase Edge Functions secrets
3. Redeploy Edge Function

### Issue 3: "Invalid credentials" or "Authentication failed"
**Symptoms:** SMTP error in logs
**Solutions:**
1. Verify App Password is correct (no spaces)
2. Ensure 2-Step Verification is enabled on Gmail
3. Try generating a new App Password
4. Check if Gmail account is locked

### Issue 4: "Function not being called"
**Symptoms:** No logs at all in Edge Function
**Check:**
1. Frontend code is calling the Edge Function
2. API endpoint URL is correct
3. Authorization headers are included
4. CORS is properly configured

### Issue 5: "Email not received"
**Check:**
1. Spam/Junk folder
2. Email address is correct
3. Gmail SMTP connection succeeded (check logs)
4. Gmail account hasn't hit sending limits

---

## 🧪 Frontend Integration Check

The Edge Function must be called from your React app. Example:

```typescript
// Example: How to call from React
const sendVerificationEmail = async (email: string) => {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const { data, error } = await supabase.functions.invoke('send-email-otp', {
      body: {
        to: email,
        code: code,
      },
    });

    if (error) {
      console.error('Edge Function error:', error);
      return { success: false, error };
    }

    console.log('Email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};
```

---

## 📊 Enhanced Logging

The updated Edge Function now includes:
- ✅ Unique request IDs for tracking
- ✅ Step-by-step execution logging
- ✅ Detailed error messages with troubleshooting
- ✅ Request/response body logging
- ✅ SMTP connection status tracking

Check logs for entries like:
```
[REQUEST abc123] Connecting to Gmail SMTP server...
[REQUEST abc123] ✅ Connected to Gmail SMTP successfully
[REQUEST abc123] ✅ Email sent successfully
```

---

## 🆘 Still Not Working?

1. **Capture full error details:**
   - Copy complete Edge Function logs
   - Note exact error messages
   - Check browser console for frontend errors

2. **Verify test email works:**
   ```bash
   # Send to your own email first
   curl -X POST \
     https://[PROJECT-ID].supabase.co/functions/v1/send-email-otp \
     -H "Authorization: Bearer [ANON-KEY]" \
     -H "Content-Type: application/json" \
     -d '{"to":"YOUR_EMAIL@gmail.com","code":"123456"}'
   ```

3. **Check Gmail settings:**
   - 2-Step Verification enabled
   - App Password generated and copied correctly
   - No security alerts blocking access

4. **Redeploy Edge Function:**
   ```bash
   supabase functions deploy send-email-otp --no-verify-jwt
   ```

---

## 📝 Request ID Tracking

Every request now gets a unique ID. Use this to correlate:
- Frontend API calls
- Edge Function logs
- Error messages

Example:
```
Frontend: "Calling Edge Function..."
Edge Log: [REQUEST abc-123] POST /send-email-otp
Edge Log: [REQUEST abc-123] Email sent successfully
Frontend: "Response received: {requestId: 'abc-123'}"
```

---

## ✅ Success Indicators

Your email system is working when you see:
1. ✅ Edge Function logs show request received
2. ✅ SMTP connection established
3. ✅ Email sent successfully (in logs)
4. ✅ Email received in inbox (check spam if needed)
5. ✅ Frontend receives success response

---

## 🔗 Useful Links

- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [SMTP Testing Tool](https://www.smtper.net/)