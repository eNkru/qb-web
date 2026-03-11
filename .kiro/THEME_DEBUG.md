# Theme Issue Debugging

## Problem
The theme selector is behaving weirdly - flipping between themes unexpectedly.

## Likely Cause
Old `darkMode` config in localStorage is conflicting with new `themeMode`.

## Solution
Clear your browser's localStorage:

1. Open browser DevTools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Find Local Storage → http://localhost:8000
4. Find the key `qb-config`
5. Delete it or edit it to remove `darkMode` property
6. Refresh the page

Alternatively, run this in the browser console:
```javascript
localStorage.removeItem('qb-config');
location.reload();
```

## What Changed
- Old system: `darkMode: true/false/null`
- New system: `themeMode: 'light'/'dark'/'grey'/null`

The migration code should handle this, but if you have an old config, it might be causing conflicts.
