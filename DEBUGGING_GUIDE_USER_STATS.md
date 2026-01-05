# 🚨 User Stats Edge Function - Complete Debugging Guide

## Current Status
✅ **Bulletproof edge function deployed** - Returns mock data, never crashes
❓ **Real database queries failing** - Need to identify the exact issue

---

## Step 1: Check Your Live Database Schema

Run this SQL query in **Supabase SQL Editor**:

```sql
-- Check if all required columns exist in student_profiles
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'student_profiles'
ORDER BY ordinal_position;
```

**Expected Columns:**
- `id` (uuid)
- `xp` (integer)
- `gold` (integer)
- `streak` (integer)
- `aura_points` (integer)
- `current_level` (integer)

**If ANY column is missing**, proceed to Step 4 (Migration Scripts).

---

## Step 2: Verify Course Enrollments Table

```sql
-- Check course_enrollments table structure
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'course_enrollments'
  AND column_name IN ('student_id', 'is_completed');
```

**Expected Output:**
| column_name | data_type |
|------------|-----------|
| student_id | uuid |
| is_completed | boolean |

---

## Step 3: Test Data Retrieval Manually

Run this query to see if you can fetch user stats:

```sql
-- Test fetching user stats for a specific user
SELECT 
    sp.xp,
    sp.gold,
    sp.streak,
    sp.current_level AS level,
    sp.aura_points,
    (SELECT COUNT(*) FROM course_enrollments WHERE student_id = sp.id) AS enrolled_courses,
    (SELECT COUNT(*) FROM course_enrollments WHERE student_id = sp.id AND is_completed = true) AS completed_courses
FROM student_profiles sp
WHERE sp.id = 'YOUR_USER_ID_HERE'  -- Replace with actual user ID
LIMIT 1;
```

**If this query fails**, copy the error message for Step 5.

---

## Step 4: Check Edge Function Logs (Find Real Error)

Run this command in **Rocket AI terminal** or your local terminal:

```bash
# View real-time logs for user-stats function
supabase functions logs --project-ref qetfonluwxtosvhptlff --function user-stats --tail
```

**What to look for:**
- `Error:` messages
- `TypeError:` (usually column not found)
- `PostgreSQL error` codes
- HTTP status codes (500, 404, etc.)

**Paste the last 10 lines of logs** to identify the exact crash reason.

---

## Step 5: Alternative Log Check (If CLI Not Available)

Go to **Supabase Dashboard** → **Edge Functions** → **user-stats** → **Logs**

Look for recent errors with timestamps. Common errors:
- `column "level" does not exist` → Missing `current_level` column
- `column "aura_points" does not exist` → Missing `aura_points` column
- `relation "enrollments" does not exist` → Wrong table name (should be `course_enrollments`)

---

## Step 6: Migration Scripts (If Columns Are Missing)

### Option A: Add Missing Columns (Run if Step 1 shows missing columns)

```sql
-- Add missing columns to student_profiles
DO $$
BEGIN
    -- Add level column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_profiles' AND column_name = 'current_level'
    ) THEN
        ALTER TABLE student_profiles ADD COLUMN current_level INTEGER DEFAULT 1;
    END IF;

    -- Add aura_points column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_profiles' AND column_name = 'aura_points'
    ) THEN
        ALTER TABLE student_profiles ADD COLUMN aura_points INTEGER DEFAULT 0;
    END IF;

    -- Add gold column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_profiles' AND column_name = 'gold'
    ) THEN
        ALTER TABLE student_profiles ADD COLUMN gold INTEGER DEFAULT 0;
    END IF;

    RAISE NOTICE 'Migration completed successfully';
END $$;
```

### Option B: Verify Column Types Match

```sql
-- Ensure correct data types
ALTER TABLE student_profiles
    ALTER COLUMN xp TYPE INTEGER,
    ALTER COLUMN gold TYPE INTEGER,
    ALTER COLUMN streak TYPE INTEGER,
    ALTER COLUMN current_level TYPE INTEGER,
    ALTER COLUMN aura_points TYPE INTEGER;
```

---

## Step 7: Deploy Working Edge Function (After Debugging)

Once you've identified and fixed the database issue, replace the mock version with this **real data version**:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user ID from query params
    const url = new URL(req.url);
    const userId = url.searchParams.get('id');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Fetch student profile
    const { data: profile, error: profileError } = await supabase
      .from('student_profiles')
      .select('xp, gold, streak, current_level, aura_points')
      .eq('id', userId)
      .maybeSingle();

    // Fetch course enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select('is_completed')
      .eq('student_id', userId);

    // Handle errors gracefully
    if (profileError || enrollmentsError) {
      console.error('Database error:', profileError || enrollmentsError);
      return new Response(
        JSON.stringify({
          aura_points: 0,
          level: 1,
          streak: 0,
          xp: 0,
          gold: 0,
          enrolled_courses: 0,
          completed_courses: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Return actual data
    return new Response(
      JSON.stringify({
        aura_points: profile?.aura_points || 0,
        level: profile?.current_level || 1,
        streak: profile?.streak || 0,
        xp: profile?.xp || 0,
        gold: profile?.gold || 0,
        enrolled_courses: enrollments?.length || 0,
        completed_courses: enrollments?.filter(e => e.is_completed).length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        aura_points: 0,
        level: 1,
        streak: 0,
        xp: 0,
        gold: 0,
        enrolled_courses: 0,
        completed_courses: 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
```

**Deploy command:**
```bash
supabase functions deploy user-stats --no-verify-jwt --project-ref qetfonluwxtosvhptlff
```

---

## Step 8: Test the Fixed Function

```bash
# Test endpoint manually (replace with actual user ID)
curl "https://qetfonluwxtosvhptlff.supabase.co/functions/v1/user-stats?id=YOUR_USER_ID"
```

**Expected response:**
```json
{
  "aura_points": 1250,
  "level": 3,
  "streak": 7,
  "xp": 3400,
  "gold": 150,
  "enrolled_courses": 5,
  "completed_courses": 2
}
```

---

## Quick Troubleshooting Checklist

- [ ] All columns exist in `student_profiles` table
- [ ] `course_enrollments` table has `student_id` and `is_completed` columns
- [ ] User exists in both tables
- [ ] RLS policies allow reading from both tables
- [ ] Edge function environment variables are set correctly
- [ ] Function logs show no errors

---

## Next Steps

1. **Run Step 1 SQL query** → Post results here
2. **Run Step 4 logs command** → Post last 10 lines here  
3. **Run Step 3 test query** → Post error message if it fails

I'll provide the exact fix once I see your database schema and error logs! 🚀