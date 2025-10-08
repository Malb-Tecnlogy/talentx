# Manual Testing Guide - OAuth Job Application Flow

## Prerequisites
- Clean browser session (clear cookies/storage)
- Test accounts ready (or use OAuth for new accounts)
- At least one active job posting in the system

## Test Case 1: Unauthenticated User - Job Application via OAuth (Google)
**Purpose:** Verify job application is created after OAuth login for unauthenticated users

### Steps:
1. Open the application in incognito/private mode (not logged in)
2. Navigate to the jobs section (homepage or /jobs)
3. Find a job listing and click the "Apply" button
4. **Expected:** Redirect to `/auth?jobId=<job-id>`
5. Click on "Continue with Google" button
6. **Expected:** Redirect URL includes `jobId` parameter
7. Complete Google OAuth flow (sign in)
8. **Expected:** After OAuth callback:
   - Redirected to `/professional?jobApplied=<job-id>`
   - Success toast appears: "You have successfully applied to the job"
   - User is logged in
   - Job appears in "Vagas Aplicadas" section

### Verification:
- [ ] User is successfully authenticated
- [ ] Job application is created in database
- [ ] "Vagas Aplicadas" section shows the applied job
- [ ] No duplicate application if user tries to apply again
- [ ] Console logs show: `[OAuth] Job application created successfully`

## Test Case 2: New User - First Time Registration with Job Application
**Purpose:** Verify welcome=true scenario with job application

### Steps:
1. Open in incognito mode (new user, never signed up before)
2. Navigate to jobs section
3. Click "Apply" on a job
4. Click "Continue with Google" (or Apple)
5. Sign in with a Google account that has never been used before
6. **Expected:** After OAuth callback:
   - User account is created (isNewUser=true)
   - Professional profile is created automatically
   - Job application is created
   - Redirected to `/professional?welcome=true&jobApplied=<job-id>`
   - Welcome message appears
   - Success toast for job application appears

### Verification:
- [ ] New user account created
- [ ] Professional profile exists
- [ ] Job application created successfully
- [ ] Welcome parameter in URL
- [ ] Both welcome and job applied messages shown
- [ ] User can see the job in "Vagas Aplicadas"

## Test Case 3: Existing Authenticated User - Direct Application
**Purpose:** Verify authenticated users can apply without OAuth redirect

### Steps:
1. Log in to the application with existing credentials
2. Navigate to professional dashboard
3. Scroll to "Recommended Projects" section
4. Click "Apply" button on a recommended job
5. **Expected:**
   - No redirect to auth page
   - Loading state shows "Applying..."
   - Success toast appears immediately
   - "Vagas Aplicadas" section updates with new application

### Verification:
- [ ] No authentication redirect occurs
- [ ] Application created immediately
- [ ] Success toast displays
- [ ] Applications list refreshes automatically
- [ ] Button shows loading state during API call

## Test Case 4: Existing User - OAuth Login with Pending Job
**Purpose:** Verify logged-out users can resume job application

### Steps:
1. Start logged in, then log out
2. Click "Apply" on a job (should redirect to auth)
3. Click "Continue with Google"
4. Sign in with existing Google account (linked to platform account)
5. **Expected:**
   - User recognized as existing user
   - Job application created
   - Redirect to dashboard with success message

### Verification:
- [ ] Existing user account used (not new account)
- [ ] Job application created
- [ ] Success toast appears
- [ ] No duplicate user accounts created

## Test Case 5: Duplicate Application Prevention
**Purpose:** Verify users cannot apply to the same job twice

### Steps:
1. Log in as a user
2. Apply to a job (either method)
3. Wait for success confirmation
4. Try to apply to the same job again
5. **Expected:**
   - Error toast appears: "You have already applied to this job"
   - No new application created
   - HTTP 400 response with `alreadyApplied: true`

### Verification:
- [ ] Error message displayed
- [ ] No duplicate application in database
- [ ] User informed clearly about existing application

## Test Case 6: User Without Professional Profile
**Purpose:** Verify error handling when professional profile is missing

### Steps:
1. Create/use a user account without professional profile
2. Try to apply for a job
3. **Expected:**
   - Error message: "Professional profile required to apply for jobs"
   - User directed to create profile
   - No application created

### Verification:
- [ ] Appropriate error message shown
- [ ] No application created without profile
- [ ] User can create profile and retry

## Test Case 7: Session Persistence Across OAuth
**Purpose:** Verify session data persists through OAuth redirect

### Steps:
1. Not logged in, click Apply on job with ID "job-123"
2. Note the session ID (check browser dev tools)
3. Complete OAuth flow
4. Verify after redirect:
   - Job application was created for "job-123"
   - Session maintained throughout
   - No loss of context

### Verification:
- [ ] Correct job application created
- [ ] Session data preserved
- [ ] No errors in console about lost session

## Test Case 8: Multiple OAuth Providers (Apple Sign In)
**Purpose:** Verify Apple Sign In works identically to Google

### Steps:
1. Repeat Test Case 1 but use "Continue with Apple" instead
2. Complete Apple OAuth flow
3. **Expected:** Same behavior as Google OAuth

### Verification:
- [ ] Apple OAuth flow works
- [ ] Job application created
- [ ] Success message appears
- [ ] User profile created/linked correctly

## Test Case 9: Return URL Preservation
**Purpose:** Verify custom return URLs are honored

### Steps:
1. Manually navigate to `/api/auth/google?jobId=123&returnUrl=/professional`
2. Complete OAuth flow
3. **Expected:**
   - Redirected to `/professional?jobApplied=123`
   - Not redirected to default dashboard

### Verification:
- [ ] Custom return URL used
- [ ] Job application created
- [ ] Proper query parameters in final URL

## Test Case 10: Error Handling - Network Issues
**Purpose:** Verify graceful error handling

### Steps:
1. Log in, try to apply for a job
2. Simulate network error (disconnect/throttle in DevTools)
3. **Expected:**
   - Error toast appears with appropriate message
   - User can retry
   - No application created in error state

### Verification:
- [ ] Error message displayed
- [ ] User can retry after reconnecting
- [ ] No partial/corrupted data

## Console Log Checks
During testing, verify these console logs appear:

### During OAuth Initiation:
```
[OAuth] Google OAuth initiation started
[OAuth] Storing pending job ID: <job-id>
```

### During OAuth Callback:
```
[OAuth] Processing pending job application
[OAuth] Job application created successfully
```

### During Direct Application:
```
[Apply Job] Application created successfully
```

## Database Verification Queries
After successful application, verify in database:

```sql
-- Check application was created
SELECT * FROM applications WHERE job_id = '<job-id>' AND professional_id = '<user-professional-id>';

-- Check no duplicates exist
SELECT job_id, professional_id, COUNT(*) as count 
FROM applications 
GROUP BY job_id, professional_id 
HAVING count > 1;
```

## Browser DevTools Checks
- [ ] No console errors during flow
- [ ] Network requests succeed (200/201 status codes)
- [ ] Session cookie maintained across redirects
- [ ] No memory leaks from mutations

## Accessibility Checks
- [ ] Loading states are announced to screen readers
- [ ] Error messages are accessible
- [ ] Buttons have proper ARIA labels
- [ ] Toast notifications are perceivable

## Performance Checks
- [ ] OAuth redirect happens within 2 seconds
- [ ] Job application API responds within 1 second
- [ ] No unnecessary re-renders in React
- [ ] Session operations are efficient

## Security Checks
- [ ] OAuth state parameter validated
- [ ] CSRF protection working
- [ ] Session data server-side only
- [ ] No sensitive data in URL parameters (except IDs)
- [ ] SQL injection prevented by ORM

## Edge Cases
- [ ] Test with very long job IDs
- [ ] Test with special characters in return URL
- [ ] Test rapid successive clicks on Apply button
- [ ] Test with expired OAuth tokens
- [ ] Test with revoked OAuth permissions
- [ ] Test account linking (same email, different OAuth provider)

## Cleanup After Testing
1. Remove test applications from database
2. Clear test user accounts if needed
3. Reset any test data
4. Document any bugs found
5. Create issues for follow-up work
