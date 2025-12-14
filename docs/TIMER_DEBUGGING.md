# Timer Debugging Guide

## Current Status

The timer feature has been implemented with natural language detection. When you type "set a timer for X minutes", the system should:

1. Parse the request from your message
2. Create a timer via API
3. Open the timer panel
4. Show a confirmation message in chat

## Quick Test Steps

### 1. Start All Services

**Terminal 1 - Backend:**

```powershell
cd c:\src\meggy-ai\webapp\backend
python manage.py runserver
```

**Terminal 2 - Timer Monitor (IMPORTANT!):**

```powershell
cd c:\src\meggy-ai\webapp\backend
python run_timer_monitor.py
```

**Terminal 3 - Frontend:**

```powershell
cd c:\src\meggy-ai\webapp\frontend
npm run dev
```

### 2. Test Timer Creation

1. Open http://localhost:3000/chat
2. Open Browser Console (F12 → Console tab)
3. Type in chat: "set a timer for 2 mins"
4. Watch for console logs:
   - `🔔 Timer request detected:` - Parser found the request
   - `✅ Timer created successfully:` - API call succeeded
   - OR `❌ Failed to create timer:` - API call failed

### 3. What You Should See

**In Chat:**

- System message: `✓ Timer set: "2 minute timer" (2 minutes)`
- Timer panel should open on the right side
- Timer countdown visible

**In Timer Panel:**

- Timer name and countdown
- Green/yellow/red color coding
- Pause/Resume/Cancel buttons

**Console Logs:**

```
🔔 Timer request detected: { minutes: 2, name: "2 minute timer" }
✅ Timer created successfully: { id: "...", name: "...", ... }
```

## Troubleshooting

### Issue: No timer appears, no console logs

**Problem:** Parser not detecting the request  
**Solution:** Check the pattern. Supported formats:

- "set a timer for X minutes"
- "set timer for X mins"
- "timer for X mins"
- "remind me in X minutes"

### Issue: Console shows ❌ Failed to create timer

**Problem:** API call failing  
**Solution:**

1. Check if backend is running (Terminal 1)
2. Check if you're logged in
3. Open Network tab in DevTools
4. Look for failed POST request to `/api/timers/`
5. Check the error response

### Issue: Timer created but no notifications

**Problem:** Timer monitor not running  
**Solution:** Start Terminal 2 with `python run_timer_monitor.py`

You should see:

```
Timer monitoring scheduler started
Checking timers every 30 seconds...
```

### Issue: Timer panel doesn't open

**Problem:** `setShowTimers(true)` not triggering  
**Solution:**

1. Click the Clock icon in header manually
2. Check browser console for React errors
3. Verify TimerDisplay component loaded

## Manual Testing Checklist

- [ ] Backend running on port 8000
- [ ] Timer monitor running (separate process)
- [ ] Frontend running on port 3000
- [ ] Logged into the app
- [ ] Browser console open (F12)
- [ ] Type: "set a timer for 2 mins"
- [ ] See console log: `🔔 Timer request detected`
- [ ] See console log: `✅ Timer created successfully`
- [ ] Timer panel opens automatically
- [ ] Timer countdown visible
- [ ] Wait 30 seconds, check monitor output
- [ ] Timer should appear in monitor check

## Expected Monitor Output

Every 30 seconds you should see:

```
[2025-12-14 18:15:00] Timer check completed
Checking 1 active timers...
```

When timer hits 3 minutes:

```
3-minute warning for timer '2 minute timer'
Sent 3-minute warning to chat_<user_id>
```

When timer completes:

```
Timer '2 minute timer' completed for user user@example.com
Sent completion notification to chat_<user_id>
```

## Debug Mode

To see more details, check these files for logging:

1. **Frontend Console** - Timer detection and API calls
2. **Backend Terminal** - API requests and responses
3. **Monitor Terminal** - Timer checks and notifications

## Common Patterns That Work

✅ "set a timer for 5 minutes"  
✅ "set timer for 10 mins"  
✅ "timer for 15m"  
✅ "remind me in 20 minutes"  
✅ "set a timer for 30 minutes for cooking"

❌ "in 5 minutes set a timer" (wrong order)  
❌ "5 minute timer please" (missing "set" or "for")

## If Still Not Working

1. **Clear browser cache** and reload
2. **Check localStorage** has valid tokens:
   ```javascript
   localStorage.getItem("access_token");
   localStorage.getItem("refresh_token");
   ```
3. **Test API directly** via curl:
   ```powershell
   $token = "YOUR_ACCESS_TOKEN"
   curl -X POST http://localhost:8000/api/timers/ `
     -H "Authorization: Bearer $token" `
     -H "Content-Type: application/json" `
     -d '{"name": "Test", "duration_seconds": 120}'
   ```

## Success Criteria

✅ Type "set a timer for 2 mins"  
✅ See system message confirming timer  
✅ Timer panel opens  
✅ Countdown visible and updating  
✅ After ~30 seconds, monitor logs show timer check  
✅ After 3 minutes (if timer > 3min), hear 2 beeps  
✅ After timer ends, hear 3 beeps

## Next Steps

Once timers are working:

1. Test pause/resume functionality
2. Test cancel functionality
3. Create multiple timers
4. Test notifications with a 4-minute timer (to test 3-min warning)
