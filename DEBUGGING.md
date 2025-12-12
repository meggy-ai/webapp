# Debugging Guide - Login & API Issues

## Quick Debug Steps

### 1. Check Both Servers Are Running

**Backend (Django):**
```powershell
# Terminal 1
cd c:\src\meggy-ai\webapp\backend
.\.venv\Scripts\Activate.ps1
python manage.py runserver
```
Should see: `Starting development server at http://127.0.0.1:8000/`

**Frontend (Next.js):**
```powershell
# Terminal 2
cd c:\src\meggy-ai\webapp\frontend
npm run dev
```
Should see: `- Local: http://localhost:3000`

### 2. Use the Test API Page

1. Open: **http://localhost:3000/test-api**
2. Open Browser DevTools (F12) → Console tab
3. Click buttons in order:
   - **Test Backend Health** (should return API info)
   - **Test Register** (creates test account)
   - **Test Login** (logs in with test account)

### 3. Watch the Console Logs

The code now includes extensive logging. You should see:
- **API Request logs**: Shows URL, method, and if token is present
- **API Response logs**: Shows status and response data
- **Auth Context logs**: Shows login/register attempts and results

## Common Issues & Solutions

### Issue 1: Backend Not Running
**Symptoms:**
- Console shows "Network Error"
- Fetch fails to connect

**Solution:**
```powershell
cd c:\src\meggy-ai\webapp\backend
.\.venv\Scripts\Activate.ps1
python manage.py runserver
```

### Issue 2: CORS Errors
**Symptoms:**
- Console shows "CORS policy blocked"
- Network tab shows OPTIONS request fails

**Check:**
1. Backend `.env` has: `CORS_ALLOWED_ORIGINS=http://localhost:3000`
2. Restart backend after changing `.env`

### Issue 3: Wrong API URL
**Symptoms:**
- Requests go to wrong URL
- 404 errors

**Check:**
Frontend `.env.local` should have:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Issue 4: Form Not Submitting
**Symptoms:**
- Click submit, nothing happens
- No console logs

**Check:**
1. Browser console for JavaScript errors
2. Make sure you're on correct page (`/auth/login` or `/auth/register`)
3. Check Network tab for failed requests

## What You Should See When Working

### Console Output (Successful Login):
```
API Request: { method: 'post', url: '/auth/login/', baseURL: 'http://localhost:8000/api', hasToken: false }
Attempting login with: { email: 'test@example.com' }
API Response: { status: 200, url: '/auth/login/', data: {...} }
Login successful: { user: {...}, access_token: '...', refresh_token: '...' }
```

### Network Tab:
- POST to `http://localhost:8000/api/auth/login/`
- Status: 200 OK
- Response has: `user`, `access_token`, `refresh_token`

### Cookies:
- `access_token` (expires in 1 hour)
- `refresh_token` (expires in 7 days)

## Testing Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000/test-api
- [ ] "Test Backend Health" button works
- [ ] "Test Register" creates account
- [ ] "Test Login" logs in successfully
- [ ] Cookies appear in DevTools
- [ ] No errors in Console

## Browser DevTools Tabs to Check

### Console Tab:
- Look for our debug logs (start with "API Request", "Attempting login", etc.)
- Look for errors (red text)

### Network Tab:
- Filter by "Fetch/XHR"
- Check POST requests to `/api/auth/login/` and `/api/auth/register/`
- Click request → Preview to see response
- Check if status is 200 or error (400, 500, etc.)

### Application Tab → Cookies:
- Select `http://localhost:3000`
- Should see `access_token` and `refresh_token` after login

## Next Steps After Debugging

Once you see what's happening in the console:
1. **Share the console logs** with me (copy the red errors or the debug logs)
2. **Share the Network tab** response (what the API actually returns)
3. I can help fix the specific issue

## Quick Test Command

To verify backend API manually:
```powershell
# Test register
Invoke-RestMethod -Uri http://localhost:8000/api/auth/register/ -Method POST -Headers @{'Content-Type'='application/json'} -Body (@{email='test@example.com';name='Test User';password='testpass123'} | ConvertTo-Json)

# Test login  
Invoke-RestMethod -Uri http://localhost:8000/api/auth/login/ -Method POST -Headers @{'Content-Type'='application/json'} -Body (@{email='test@example.com';password='testpass123'} | ConvertTo-Json)
```

If these commands work but the browser doesn't, it's a frontend issue. If they fail, it's a backend issue.
