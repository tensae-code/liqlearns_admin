# 📚 LiqLearns Platform - Complete Documentation

## Table of Contents
1. [Platform Overview](#platform-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [User Journey & Registration Flow](#user-journey--registration-flow)
4. [Core Features](#core-features)
5. [Technical Architecture](#technical-architecture)
6. [Database Schema](#database-schema)
7. [Third-Party Integrations](#third-party-integrations)
8. [Business Model](#business-model)
9. [Mobile App Requirements](#mobile-app-requirements)
10. [API Reference](#api-reference)

---

## Platform Overview

### Purpose
**LiqLearns** is a comprehensive Learning Management System (LMS) designed to provide multi-role educational experiences with integrated network marketing, gamification, and monetization features.

### Mission
- Provide accessible, high-quality education through a multi-tiered learning platform
- Empower teachers, students, and affiliates through a network marketing compensation structure
- Deliver engaging, gamified learning experiences with progress tracking
- Enable secure payment processing and subscription management

### Key Differentiators
- **Multi-Role Platform**: Supports students, teachers, support staff, admins, and CEO roles
- **Network Marketing Integration**: Sponsor-referral system with MLM compensation
- **Gamification**: XP rewards, badges, streaks, and life progress wheel
- **Comprehensive LMS**: Hierarchical course structure (courses → units → lessons → content)
- **Study Rooms**: Virtual classrooms with video conferencing capabilities
- **Marketplace**: Digital product sales with commission structure

---

## User Roles & Permissions

### 1. Student (Default Role)
**Capabilities:**
- Enroll in courses and access learning content
- Complete lessons, assignments, and quizzes
- Track personal progress and earn XP/badges
- Participate in study rooms and virtual classrooms
- Purchase products from marketplace
- Refer other students through sponsor system
- Earn commissions through network marketing

**Subscription Plans:**
- **Free Trial**: 3-day trial upon registration
- **Monthly**: $9.99/month - Basic access
- **Yearly**: $99.99/year - Full platform access

### 2. Teacher (Approval Required)
**Capabilities:**
- Create and manage courses, units, and lessons
- Upload video, audio, PDF, and interactive content
- Create assignments and grade submissions
- Design quizzes and track student performance
- View student progress analytics
- Host virtual tutoring sessions
- Schedule study rooms

### 3. Support (Approval Required)
**Capabilities:**
- Respond to student inquiries
- Monitor platform activity
- Access help center management
- View user profiles for support purposes
- Manage ticket systems

### 4. Admin (Approval Required)
**Capabilities:**
- User management (view, suspend, activate accounts)
- Approve teacher/support role requests
- Content moderation and approval
- View platform analytics
- Manage courses and marketplace items
- Access financial dashboards

### 5. CEO (Single Super Admin)
**Capabilities:**
- Full platform control
- Manage all user roles and permissions
- Configure subscription plans and pricing
- Update platform statistics
- Access all dashboards (financial, user management, analytics)
- Configure Stripe payment settings
- Manage network marketing compensation plans

---

## User Journey & Registration Flow

### Registration Process
```
1. Landing Page
   ├─ View platform statistics
   ├─ Watch demo video
   └─ Click "Get Started"

2. Initial Registration
   ├─ Enter: Full Name, Email, Username, Password, Phone
   ├─ Select Role: Student (default) or Employee (Teacher/Support/Admin)
   └─ Username & Sponsor Validation (real-time edge function calls)

3. Email Verification
   ├─ Receive OTP via Resend email service
   └─ Enter 6-digit verification code

4. Two-Factor Authentication (2FA)
   ├─ Receive SMS code via Twilio
   └─ Verify phone number

5. Role-Specific Path:
   
   A. Student Path:
      ├─ Sponsor Selection (optional but encouraged)
      ├─ Subscription Plan Selection
      │   ├─ Free Trial (3 days)
      │   ├─ Monthly ($9.99)
      │   └─ Yearly ($99.99)
      ├─ Payment Processing (Stripe)
      └─ Access Student Dashboard

   B. Employee Path (Teacher/Support/Admin):
      ├─ Complete Employee Application Form
      │   ├─ Personal Information
      │   ├─ Role Selection
      │   ├─ Professional Qualifications
      │   ├─ Experience Details
      │   ├─ Scenario Questions
      │   ├─ Availability Schedule
      │   └─ Policy Agreement
      ├─ Submit for Admin Review
      ├─ Wait for Approval
      └─ Access Role-Based Dashboard (upon approval)
```

### Sponsorship System
- **Purpose**: Network marketing referral system
- **Validation**: 
  - Sponsor username must exist in database
  - Sponsor cannot be Admin, CEO, or Support (they cannot sponsor)
  - Only Students, Teachers, and Affiliates can sponsor
- **Benefits**:
  - Sponsors earn commissions from referral activity
  - Students get mentorship and guidance
  - Creates multi-level marketing (MLM) structure

### Payment Processing
- **Provider**: Stripe
- **Flow**:
  1. User selects subscription plan
  2. Stripe Checkout Session created via edge function
  3. Stripe processes payment
  4. Webhook confirms payment
  5. Student profile updated with subscription status
  6. Invoice sent via email (Resend)

---

## Core Features

### 1. Learning Management System (LMS)

#### Course Structure
```
Course (e.g., "Amharic Basics")
└─ Course Units (Chapters/Modules)
   └─ Lessons (Individual lessons)
      ├─ Lesson Content (Video/Text/Audio/PDF/Interactive)
      ├─ Assignments (File/Text/Audio/Video submissions)
      └─ Quizzes (Multiple choice, True/False, Short answer, Essay)
```

#### Content Types
- **Video**: Embedded YouTube, Vimeo, or direct MP4 links
- **Text**: Rich text descriptions and learning materials
- **Audio**: Pronunciation guides, lectures
- **PDF**: Downloadable resources, worksheets
- **Interactive**: Gamified learning activities

#### Progress Tracking
- **Course Enrollment Progress**: Percentage completion
- **Lesson Progress**: Time spent, completion status
- **Quiz Attempts**: Score, percentage, detailed answers
- **Assignment Submissions**: Status (not_started, in_progress, submitted, graded)

#### Gamification
- **XP Rewards**: Earn points for completing lessons
- **Badges**: Achievement unlocks for milestones
- **Streaks**: Daily login tracking
- **Life Progress Wheel**: Track progress across 8 life dimensions:
  - Career & Education
  - Health & Fitness
  - Relationships & Family
  - Personal Development
  - Finance & Wealth
  - Hobbies & Leisure
  - Spirituality & Mindfulness
  - Social Impact & Community

### 2. Study Rooms & Virtual Classrooms
- **Video Conferencing**: Integrated video/audio calls
- **Chat System**: Real-time messaging
- **Screen Sharing**: Teacher demonstrations
- **Participant Management**: Join/leave tracking
- **Recording Options**: Session playback

### 3. Marketplace
- **Product Types**: Digital courses, ebooks, resources
- **Seller Dashboard**: Upload and manage products
- **Commission Structure**: Affiliate earnings on sales
- **Payment Processing**: Stripe integration

### 4. Network Marketing (MLM)
- **Sponsor Tracking**: Track referral chains
- **Commission Tiers**: Multi-level compensation
- **Genealogy Tree**: Visual representation of network
- **Performance Metrics**: Track downline activity

### 5. Financial Management
- **Student Subscriptions**: Track payment status
- **Marketplace Transactions**: Sales and commissions
- **Withdrawal Requests**: Affiliate payouts
- **Invoice Generation**: Automated PDF invoices
- **Barcode Wallet**: Payment QR codes

### 6. Admin Dashboards

#### CEO Dashboard
- Platform-wide statistics
- Revenue analytics
- User growth metrics
- Subscription plan management
- Stripe configuration

#### Admin Dashboard
- User management
- Role approval queue
- Content moderation
- Financial oversight
- Analytics reports

#### Teacher Dashboard
- Course management
- Student progress tracking
- Assignment grading
- Schedule management
- Earnings overview

#### Student Dashboard
- Enrolled courses
- Progress tracking
- Assignment submissions
- Quiz attempts
- Study room access
- Marketplace purchases

---

## Technical Architecture

### Frontend
**Framework**: React 18 + TypeScript  
**Build Tool**: Vite 5.0.0  
**Styling**: Tailwind CSS 3.4.6  
**State Management**: Redux Toolkit  
**Routing**: React Router v6  
**Animation**: Framer Motion  
**Charts**: Recharts, D3.js  
**Forms**: React Hook Form  
**Icons**: Lucide React  

### Backend
**Provider**: Supabase (PostgreSQL database + Auth)  
**Edge Functions**: Deno runtime for serverless functions  
**Authentication**: Supabase Auth with JWT  
**Row-Level Security (RLS)**: Database-level permissions  

### Database
**Type**: PostgreSQL (Supabase-hosted)  
**Key Features**:
- UUID primary keys
- JSONB for flexible data
- Triggers for auto-updates
- Custom functions for business logic
- Comprehensive RLS policies

---

## Database Schema

### Core Auth Tables

#### user_profiles
```sql
id UUID PRIMARY KEY
email TEXT UNIQUE
username TEXT UNIQUE
full_name TEXT
phone TEXT
role ENUM('student', 'teacher', 'support', 'admin', 'ceo')
account_status ENUM('pending_approval', 'active', 'suspended', 'free_trial')
avatar_url TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

#### student_profiles
```sql
id UUID (references user_profiles.id)
subscription_plan ENUM('monthly', 'yearly', 'free_trial')
trial_end_date TIMESTAMPTZ
subscription_start_date TIMESTAMPTZ
subscription_end_date TIMESTAMPTZ
has_active_subscription BOOLEAN
stripe_customer_id TEXT
stripe_subscription_id TEXT
sponsor_id UUID (references user_profiles.id)
```

#### role_approval_requests
```sql
id UUID
user_id UUID
requested_role ENUM
form_data JSONB (contains application details)
status TEXT ('pending', 'approved', 'rejected')
admin_notes TEXT
submitted_at TIMESTAMPTZ
reviewed_at TIMESTAMPTZ
reviewed_by UUID
```

### LMS Tables

#### courses
```sql
id UUID
title TEXT
description TEXT
thumbnail_url TEXT
category TEXT
level ENUM('beginner', 'intermediate', 'advanced')
price DECIMAL(10,2)
estimated_duration_hours INTEGER
is_active BOOLEAN
created_by UUID (teacher)
created_at TIMESTAMPTZ
```

#### course_units (Chapters/Modules)
```sql
id UUID
course_id UUID
title TEXT
description TEXT
order_index INTEGER
is_published BOOLEAN
```

#### lessons
```sql
id UUID
unit_id UUID
course_id UUID
title TEXT
description TEXT
order_index INTEGER
estimated_duration_minutes INTEGER
xp_reward INTEGER
is_published BOOLEAN
prerequisite_lesson_id UUID (for lesson dependencies)
```

#### lesson_content
```sql
id UUID
lesson_id UUID
content_type ENUM('video', 'text', 'audio', 'pdf', 'interactive')
title TEXT
content_url TEXT
content_text TEXT
order_index INTEGER
duration_seconds INTEGER
is_required BOOLEAN
```

#### student_lesson_progress
```sql
id UUID
student_id UUID
lesson_id UUID
is_completed BOOLEAN
progress_percentage INTEGER
last_accessed_at TIMESTAMPTZ
completed_at TIMESTAMPTZ
time_spent_minutes INTEGER
```

#### assignments
```sql
id UUID
lesson_id UUID
course_id UUID
title TEXT
description TEXT
instructions TEXT
submission_type ENUM('text', 'file', 'audio', 'video')
max_score INTEGER
due_date TIMESTAMPTZ
is_published BOOLEAN
allow_late_submission BOOLEAN
created_by UUID (teacher)
```

#### assignment_submissions
```sql
id UUID
assignment_id UUID
student_id UUID
submission_text TEXT
submission_file_url TEXT
status ENUM('not_started', 'in_progress', 'submitted', 'graded', 'returned')
score INTEGER
feedback TEXT
graded_by UUID (teacher)
submitted_at TIMESTAMPTZ
graded_at TIMESTAMPTZ
```

#### quiz_questions
```sql
id UUID
lesson_id UUID
question_type ENUM('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching')
question_text TEXT
options JSONB (array of choices)
correct_answer TEXT
points INTEGER
explanation TEXT
order_index INTEGER
```

#### quiz_attempts
```sql
id UUID
student_id UUID
lesson_id UUID
score INTEGER
total_points INTEGER
percentage DECIMAL(5,2)
answers JSONB (detailed attempt data)
completed_at TIMESTAMPTZ
time_taken_seconds INTEGER
```

### Study Rooms & Virtual Classrooms

#### study_rooms
```sql
id UUID
title TEXT
description TEXT
host_id UUID
room_type ENUM('public', 'private', 'scheduled')
max_participants INTEGER
is_active BOOLEAN
scheduled_start_time TIMESTAMPTZ
scheduled_end_time TIMESTAMPTZ
meeting_link TEXT
```

#### study_room_participants
```sql
id UUID
room_id UUID
user_id UUID
joined_at TIMESTAMPTZ
left_at TIMESTAMPTZ
is_active BOOLEAN
```

#### study_room_messages
```sql
id UUID
room_id UUID
sender_id UUID
message_text TEXT
message_type ENUM('text', 'system', 'file')
sent_at TIMESTAMPTZ
```

### Marketplace Tables

#### marketplace_products
```sql
id UUID
seller_id UUID
title TEXT
description TEXT
price DECIMAL(10,2)
product_type ENUM('course', 'ebook', 'resource', 'other')
file_url TEXT
thumbnail_url TEXT
is_approved BOOLEAN
is_active BOOLEAN
created_at TIMESTAMPTZ
```

#### marketplace_transactions
```sql
id UUID
product_id UUID
buyer_id UUID
seller_id UUID
price_paid DECIMAL(10,2)
commission_rate DECIMAL(5,2)
commission_amount DECIMAL(10,2)
stripe_payment_intent_id TEXT
status ENUM('pending', 'completed', 'refunded')
created_at TIMESTAMPTZ
```

### Network Marketing Tables

#### sponsor_relationships
```sql
id UUID
student_id UUID
sponsor_id UUID
created_at TIMESTAMPTZ
```

#### mlm_commissions
```sql
id UUID
user_id UUID
transaction_id UUID
commission_amount DECIMAL(10,2)
commission_level INTEGER (1st level, 2nd level, etc.)
created_at TIMESTAMPTZ
```

### Financial Tables

#### withdrawal_requests
```sql
id UUID
user_id UUID
amount DECIMAL(10,2)
payment_method TEXT
account_details JSONB
status ENUM('pending', 'approved', 'rejected', 'completed')
requested_at TIMESTAMPTZ
processed_at TIMESTAMPTZ
processed_by UUID
```

#### invoice_requests
```sql
id UUID
user_id UUID
invoice_type TEXT
amount DECIMAL(10,2)
invoice_file_url TEXT
status ENUM('pending', 'generated', 'sent')
created_at TIMESTAMPTZ
```

### Gamification Tables

#### user_badges
```sql
id UUID
user_id UUID
badge_type TEXT
badge_name TEXT
description TEXT
earned_at TIMESTAMPTZ
```

#### daily_streaks
```sql
id UUID
user_id UUID
current_streak INTEGER
longest_streak INTEGER
last_activity_date DATE
```

#### life_progress
```sql
id UUID
user_id UUID
dimension TEXT (8 life dimensions)
progress_percentage INTEGER
goals JSONB
updated_at TIMESTAMPTZ
```

### Platform Management Tables

#### platform_statistics
```sql
id UUID
total_learners INTEGER
total_languages INTEGER
success_rate DECIMAL(5,2)
countries_count INTEGER
recommendation_rate DECIMAL(5,2)
completion_rate DECIMAL(5,2)
growth_rate DECIMAL(5,2)
happy_students INTEGER
demo_video_url TEXT
updated_at TIMESTAMPTZ
```

#### subscription_plans
```sql
id UUID
name TEXT
price_monthly DECIMAL(10,2)
price_yearly DECIMAL(10,2)
currency TEXT
features JSONB
stripe_price_id_monthly TEXT
stripe_price_id_yearly TEXT
is_active BOOLEAN
```

---

## Third-Party Integrations

### 1. Supabase
**Purpose**: Backend-as-a-Service (BaaS)  
**Services Used**:
- PostgreSQL Database
- Authentication (JWT-based)
- Edge Functions (Deno runtime)
- Storage (file uploads)
- Real-time subscriptions

**Configuration**:
```env
VITE_SUPABASE_URL=your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Stripe
**Purpose**: Payment Processing  
**Services Used**:
- Customer creation
- Subscription management
- Checkout sessions
- Webhooks (payment confirmation)
- Invoice generation

**Configuration**:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_... (server-side only)
```

**Edge Functions**:
- `create-stripe-customer`: Creates Stripe customer on registration
- `create-checkout-session`: Initiates payment flow
- `stripe-webhook`: Handles payment confirmations

### 3. Resend (Email Service)
**Purpose**: Transactional Email Delivery  
**Use Cases**:
- Email verification codes (OTP)
- Invoice delivery
- Password reset emails
- Subscription confirmations

**Configuration**:
```env
EMAIL_USER=noreply@liqlearns.com
EMAIL_PASS=your-resend-api-key
```

**Edge Function**: `send-email-otp`

### 4. Twilio (SMS Service)
**Purpose**: SMS Two-Factor Authentication  
**Use Cases**:
- Phone verification during registration
- 2FA codes for login

**Edge Function**: `send-twilio-sms`

### 5. Google Analytics
**Purpose**: User Behavior Tracking  
**Configuration**:
```env
VITE_GA_MEASUREMENT_ID=G-VNZR5N1P8Q
```

**Custom Hook**: `useGoogleAnalytics()`

### 6. Google AdSense (Optional)
**Purpose**: Ad Monetization  
**Configuration**:
```env
VITE_ADSENSE_ID=your-adsense-id-here
```

---

## Business Model

### Revenue Streams

#### 1. Student Subscriptions
- **Free Trial**: 3-day trial (no charge)
- **Monthly Plan**: $9.99/month
- **Yearly Plan**: $99.99/year (16.7% discount)

#### 2. Marketplace Commissions
- Platform takes 10-20% commission on product sales
- Sellers keep 80-90% of sale price

#### 3. Network Marketing (MLM)
- Commission structure for sponsor referrals
- Multi-level compensation plan
- Tiered earnings based on downline performance

#### 4. Premium Features (Future)
- One-on-one tutoring sessions
- Certification programs
- Advanced analytics for teachers

### Cost Structure
- **Supabase**: Database hosting and edge functions
- **Stripe**: Payment processing fees (2.9% + $0.30 per transaction)
- **Resend**: Email delivery (pay-per-email)
- **Twilio**: SMS delivery (pay-per-message)
- **Infrastructure**: CDN, storage

---

## Mobile App Requirements

### Core Features to Adapt

#### 1. Authentication & Onboarding
- Native iOS login/signup UI
- Touch ID / Face ID integration
- Push notifications for OTP codes
- Biometric authentication for returning users

#### 2. Student Learning Experience
- **Course Browsing**: Native iOS card layouts
- **Video Player**: AVPlayer integration for lesson videos
- **Offline Mode**: Download lessons for offline viewing
- **Progress Tracking**: Local storage with cloud sync
- **Notifications**: 
  - Course reminders
  - Assignment due dates
  - Quiz availability
  - Streak reminders

#### 3. Study Rooms
- **WebRTC**: Video conferencing (iOS native or WebView)
- **Chat**: Real-time messaging (Firebase or Supabase Realtime)
- **Screen Sharing**: iOS screen capture integration

#### 4. Gamification
- **Native Animations**: SwiftUI animations for XP gains
- **Badge Display**: iOS-native badge showcase
- **Streak Calendar**: Native calendar view with heatmap

#### 5. Marketplace
- **In-App Purchases**: Apple App Store integration (IAP)
- **Product Browsing**: Native iOS collection views
- **Secure Checkout**: Apple Pay integration

#### 6. Teacher Tools (iOS App)
- **Course Management**: Create/edit courses on mobile
- **Assignment Grading**: Review and grade submissions
- **Student Analytics**: View progress dashboards
- **Push Notifications**: Assignment submissions, student questions

#### 7. Admin Panel (iOS App)
- **User Management**: Approve role requests
- **Content Moderation**: Review and approve marketplace products
- **Analytics Dashboard**: Platform metrics

### Technical Considerations

#### API Integration
- **Base URL**: Use Supabase REST API
- **Authentication**: JWT tokens (stored in Keychain)
- **Real-time**: Supabase Realtime subscriptions

#### Data Persistence
- **CoreData**: Local caching of courses, progress
- **Keychain**: Secure storage of tokens
- **UserDefaults**: App settings and preferences

#### UI/UX Guidelines
- **Navigation**: iOS tab bar navigation (5 tabs)
  1. Home (Dashboard)
  2. Courses (Learning)
  3. Study Rooms
  4. Marketplace
  5. Profile
- **Design System**: Follow iOS Human Interface Guidelines
- **Dark Mode**: Full support for dark/light themes

#### Performance Optimization
- **Lazy Loading**: Paginated course lists
- **Image Caching**: SDWebImage or Kingfisher
- **Background Tasks**: Course downloads, progress sync

#### Push Notifications
- **Firebase Cloud Messaging (FCM)** or **Apple Push Notification Service (APNs)**
- Notification types:
  - New course announcements
  - Assignment deadlines
  - Quiz availability
  - Marketplace sales
  - Sponsor commissions earned

---

## API Reference

### Authentication Endpoints

#### POST /auth/signup
Register new user account
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "username": "johndoe",
  "phone": "+1234567890",
  "role": "student"
}
```

#### POST /auth/login
User login
```json
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}
```
**Response**:
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "role": "student"
  }
}
```

#### POST /auth/verify-email
Verify email with OTP
```json
{
  "email": "student@example.com",
  "otp": "123456"
}
```

#### POST /auth/verify-phone
Verify phone with SMS code
```json
{
  "phone": "+1234567890",
  "code": "654321"
}
```

### Course Endpoints

#### GET /courses
Fetch all active courses
**Query Params**: `?category=languages&level=beginner`

#### GET /courses/:id
Get specific course details
**Response**:
```json
{
  "id": "uuid",
  "title": "Amharic Basics",
  "description": "Learn Amharic from scratch",
  "units": [
    {
      "id": "uuid",
      "title": "Getting Started",
      "lessons": [...]
    }
  ]
}
```

#### GET /lessons/:id
Get lesson details and content
**Response**:
```json
{
  "id": "uuid",
  "title": "The Amharic Alphabet",
  "content": [
    {
      "type": "video",
      "url": "https://...",
      "duration": 600
    },
    {
      "type": "text",
      "content": "ሀ ሁ ሂ ሃ ሄ ህ ሆ..."
    }
  ],
  "quiz": {...}
}
```

#### POST /lessons/:id/progress
Update lesson progress
```json
{
  "progress_percentage": 75,
  "time_spent_minutes": 15,
  "is_completed": false
}
```

### Assignment Endpoints

#### GET /assignments/:id
Get assignment details

#### POST /assignments/:id/submit
Submit assignment
```json
{
  "submission_text": "My answer here...",
  "submission_file_url": "https://storage.supabase.co/..."
}
```

### Quiz Endpoints

#### POST /quizzes/:lesson_id/attempt
Submit quiz attempt
```json
{
  "answers": [
    {"question_id": "uuid", "answer": "33", "correct": true},
    {"question_id": "uuid", "answer": "Left to right", "correct": true}
  ],
  "time_taken_seconds": 180
}
```

### Payment Endpoints

#### POST /stripe/create-checkout-session
Create Stripe checkout session
```json
{
  "plan": "monthly", // or "yearly"
  "user_id": "uuid"
}
```
**Response**:
```json
{
  "session_id": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

#### POST /stripe/webhook
Stripe webhook endpoint (handles payment confirmations)

### Edge Function Endpoints

#### POST /check-username
Validate username availability
```json
{"username": "johndoe"}
```
**Response**:
```json
{"exists": false}
```

#### POST /check-sponsor
Validate sponsor eligibility
```json
{"username": "sponsor_username"}
```
**Response**:
```json
{
  "exists": true,
  "allowed": true // false if admin/ceo/support
}
```

---

## Security & Compliance

### Row-Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Admins/CEO have elevated permissions
- Teachers can view assigned students only

### GDPR Compliance
- **Data Privacy Center**: Users can request data export/deletion
- **Consent Banner**: Cookie and analytics consent
- **Right to be Forgotten**: Account deletion with data erasure

### Authentication Security
- **Password Requirements**: Minimum 8 characters, complexity rules
- **Two-Factor Authentication**: SMS-based 2FA
- **JWT Tokens**: Short-lived access tokens (1 hour)
- **Refresh Tokens**: Secure token refresh mechanism

---

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm start

# Access at http://localhost:5173
```

### Supabase Local Development
```bash
# Start Supabase locally
supabase start

# Apply migrations
supabase db push

# Deploy edge functions
supabase functions deploy check-username --no-verify-jwt
```

### Environment Variables
Create `.env` file:
```env
VITE_SUPABASE_URL=your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_GA_MEASUREMENT_ID=G-...
```

### Build for Production
```bash
npm run build
# Output: dist/ folder
```

---

## Deployment

### Web App (Vercel)
- Connected to GitHub repository
- Automatic deployments on push to `main` branch
- Environment variables configured in Vercel dashboard

### Database (Supabase)
- Hosted PostgreSQL database
- Automatic backups
- Point-in-time recovery

### Edge Functions (Supabase)
- Deployed via CLI: `supabase functions deploy <function-name>`
- Auto-scaling serverless functions

---

## Future Enhancements

### Phase 1 (Q1 2026)
- AI-powered course recommendations
- Advanced analytics dashboard for teachers
- Live streaming for virtual classrooms
- Mobile app launch (iOS and Android)

### Phase 2 (Q2 2026)
- Multilingual support (Amharic, Spanish, French)
- Certification program issuance
- Integration with LinkedIn Learning
- Parent dashboard for tracking student progress

### Phase 3 (Q3 2026)
- Blockchain-based credential verification
- NFT badges for achievements
- Web3 wallet integration
- Decentralized storage for course content

---

## Support & Documentation

### For Developers
- **GitHub Repository**: [https://github.com/tensae-code/liqlearns_admin](https://github.com/tensae-code/liqlearns_admin)
- **API Documentation**: Supabase Auto-Generated Docs
- **Component Storybook**: `npm run storybook`

### For End Users
- **Help Center**: Accessible from user dashboard
- **Support Tickets**: Contact support@liqlearns.com
- **Video Tutorials**: Embedded in platform

---

## Conclusion

**LiqLearns** is a robust, scalable learning platform combining modern web technologies with innovative business models. The architecture supports multi-role users, complex learning hierarchies, network marketing, and secure payment processing.

For mobile app development, focus on:
1. **Native iOS UI/UX** following Apple guidelines
2. **Offline-first architecture** for seamless learning
3. **Push notifications** for engagement
4. **Secure API integration** with Supabase
5. **Performance optimization** for smooth video playback

This documentation provides a comprehensive foundation for building a feature-complete iPhone app that mirrors the web platform's capabilities while leveraging iOS-native features.

---

**Last Updated**: December 31, 2025  
**Version**: 1.0.0  
**Maintainer**: LiqLearns Development Team