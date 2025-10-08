# OAuth Job Application Flow - Implementation Summary

## Problem Statement
1. **Issue 1**: When users apply for jobs and need to authenticate via OAuth, the system loses track of which job they wanted to apply for. For new users (welcome=true), job applications are not created after OAuth callback.
2. **Issue 2**: When clicking "ver vaga" (view job) in the suggestions section, the system automatically logs out the user.

## Root Causes
- No mechanism to preserve job context during OAuth flow
- Apply buttons didn't have click handlers
- Session data wasn't being used to track pending actions
- No API endpoint to handle job applications with OAuth redirect

## Solution Implemented

### Backend Changes

#### 1. Extended Session Interface (`server/replitAuth.ts`)
```typescript
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: any;
    oauthState?: string;
    oauthNonce?: string;
    pendingJobId?: string;    // NEW: Track job to apply for
    returnUrl?: string;        // NEW: Track return URL after auth
  }
}
```

#### 2. Updated OAuth Initiation Endpoints (`server/routes.ts`)
- Modified `/api/auth/google` and `/api/auth/apple` to capture `jobId` and `returnUrl` from query parameters
- Store these values in session before redirecting to OAuth provider
- Session is explicitly saved before redirect to ensure persistence

#### 3. Created Helper Function (`server/replitAuth.ts`)
```typescript
export async function processPendingJobApplication(session: any, userId: string)
```
- Checks for pending job ID in session
- Verifies professional profile exists
- Creates job application if not already applied
- Cleans up session data
- Returns job ID and return URL for redirect handling

#### 4. Updated OAuth Callbacks (`server/routes.ts`)
- All 4 OAuth callback endpoints updated:
  - `/api/auth/google/callback`
  - `/api/auth/apple/callback`
  - `/auth/google/callback` (alternative)
  - `/auth/apple/callback` (alternative)
- Call `processPendingJobApplication` after user login
- Redirect to stored return URL or default dashboard
- Add `jobApplied` query parameter if application was created

#### 5. Added Job Application Endpoint (`server/routes.ts`)
```typescript
POST /api/jobs/:jobId/apply
```
- Handles both authenticated and unauthenticated users
- Stores job context in session for unauthenticated users
- Returns 401 with redirect info if auth required
- Creates application for authenticated users with profiles
- Prevents duplicate applications

#### 6. Added Storage Method (`server/storage.ts`)
```typescript
getApplicationByJobAndProfessional(jobId: string, professionalId: string)
```
- Checks if user already applied to a specific job
- Prevents duplicate applications

### Client-Side Changes

#### 1. Updated Auth Page (`client/src/pages/auth-page.tsx`)
- Captures `jobId` from URL parameters
- Passes `jobId` and `returnUrl` to OAuth initiation URLs
- Example: `/api/auth/google?jobId=123&returnUrl=/professional`

#### 2. Updated Professional Dashboard (`client/src/pages/professional-dashboard.tsx`)
- Added `applyMutation` to handle job applications
- Added `handleApply` function to trigger applications
- Connected Apply buttons to mutation with onClick handlers
- Shows loading state during application
- Handles authentication required, already applied, and error cases
- Checks for `jobApplied` query parameter on mount and shows success toast
- Invalidates applications query after successful application

#### 3. Updated Jobs Section (`client/src/components/jobs-section.tsx`)
- Modified Apply button links to include job ID: `/auth?jobId=${job.id}`
- Ensures job context is preserved when redirecting to auth

## Flow Diagrams

### Authenticated User Applying for Job
```
User clicks "Apply" on Job Card
  ↓
handleApply(jobId) called
  ↓
POST /api/jobs/:jobId/apply
  ↓
Check authentication ✓
  ↓
Check professional profile ✓
  ↓
Check for existing application
  ↓
Create application
  ↓
Return success
  ↓
Show success toast
```

### Unauthenticated User Applying for Job (OAuth Flow)
```
User clicks "Apply" on Job Card
  ↓
Redirect to /auth?jobId=123
  ↓
User clicks OAuth button (Google/Apple)
  ↓
Redirect to /api/auth/google?jobId=123&returnUrl=/professional
  ↓
Store jobId and returnUrl in session
  ↓
Redirect to OAuth provider
  ↓
User authenticates
  ↓
OAuth callback received
  ↓
Create/link user account
  ↓
Login user
  ↓
Call processPendingJobApplication()
  ↓
Check for professional profile
  ↓
Create job application
  ↓
Clear session data
  ↓
Redirect to /professional?jobApplied=123
  ↓
Show success toast
```

### New User Flow (welcome=true)
```
User clicks "Apply" on Job Card
  ↓
Redirect to /auth?jobId=123
  ↓
User signs in via OAuth (first time)
  ↓
User account created with isNewUser=true
  ↓
Professional profile created automatically
  ↓
processPendingJobApplication() called
  ↓
Job application created
  ↓
Redirect to /professional?welcome=true&jobApplied=123
  ↓
Show welcome message + job application success
```

## Testing Checklist

### Manual Testing Required
- [ ] Test existing user OAuth login (no job application)
- [ ] Test existing user OAuth login with pending job application
- [ ] Test new user OAuth registration with pending job application
- [ ] Test authenticated user applying directly from recommendations
- [ ] Test unauthenticated user applying from jobs section
- [ ] Test duplicate application prevention
- [ ] Test session persistence across OAuth redirect
- [ ] Test returnUrl preservation and redirect
- [ ] Test error handling (no professional profile, network errors)
- [ ] Verify success toasts display correctly
- [ ] Verify "Vagas Aplicadas" section updates after application

### Edge Cases Covered
- ✓ Session persistence across OAuth redirects
- ✓ Duplicate application prevention
- ✓ Missing professional profile handling
- ✓ Session save errors
- ✓ OAuth state validation
- ✓ Multiple OAuth callback routes (with and without /api prefix)
- ✓ New user (welcome=true) scenario
- ✓ Existing user scenario
- ✓ Return URL preservation
- ✓ Query parameter cleanup after success

## Files Modified
1. `server/replitAuth.ts` - Session interface, processPendingJobApplication function
2. `server/routes.ts` - OAuth endpoints, job application endpoint
3. `server/storage.ts` - getApplicationByJobAndProfessional method
4. `client/src/pages/auth-page.tsx` - OAuth button URL construction
5. `client/src/pages/professional-dashboard.tsx` - Apply mutation and handler
6. `client/src/components/jobs-section.tsx` - Job ID in auth redirect

## Security Considerations
- ✓ CSRF protection via state parameter (existing)
- ✓ Session-based storage (server-side only)
- ✓ Authentication checks before application creation
- ✓ Duplicate application prevention
- ✓ SQL injection protection via Drizzle ORM
- ✓ XSS protection via React (automatic escaping)

## Future Enhancements
- Add job application form with cover letter
- Add application rate limiting
- Add email notifications for successful applications
- Add analytics tracking for conversion rates
- Add A/B testing for OAuth providers
