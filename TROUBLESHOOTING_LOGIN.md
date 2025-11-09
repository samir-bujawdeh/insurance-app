# Troubleshooting Admin Login

## Issue: Login not working with admin@example.com / admin123

### Step 1: Create .env file (IMPORTANT!)

The frontend needs to know where the backend is. Create this file:

**File:** `insurance-admin-dashboard/.env`
```
VITE_API_BASE_URL=http://localhost:8000
```

**After creating this file, restart the Vite dev server!**

### Step 2: Make sure backend is running

In a terminal, run:
```bash
cd backend
uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 3: Create admin user manually

The admin user should be created automatically, but if it's not, run this script:

```bash
cd backend
python create_admin.py
```

This will create the admin user with:
- Email: `admin@example.com`
- Password: `admin123`

### Step 4: Verify backend is accessible

Open your browser and go to:
- http://localhost:8000/docs

You should see the FastAPI Swagger docs. This confirms the backend is running.

### Step 5: Check browser console

1. Open the admin dashboard: http://localhost:5173
2. Open browser DevTools (F12)
3. Go to the Console tab
4. Try to login
5. Look for any error messages

Common errors:
- **CORS errors**: Backend CORS is configured, but check if backend is running
- **Network errors**: Backend not running or wrong URL
- **401 Unauthorized**: Wrong password or user doesn't exist
- **403 Forbidden**: User exists but is_admin=False

### Step 6: Test the login endpoint directly

You can test the login API directly:

```bash
curl -X POST "http://localhost:8000/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

If this works, you should get a response with `access_token` and `user`.

### Step 7: Check database columns

If you're using an existing database, make sure the `is_admin` and `is_active` columns exist. The backend will try to add them automatically on startup, but if that fails, you may need to run a migration.

## Quick Fix Summary

1. ✅ Create `insurance-admin-dashboard/.env` with `VITE_API_BASE_URL=http://localhost:8000`
2. ✅ Restart Vite dev server (stop with Ctrl+C and run `npm run dev` again)
3. ✅ Start backend: `cd backend && uvicorn app.main:app --reload`
4. ✅ Run `python backend/create_admin.py` to ensure admin user exists
5. ✅ Try login again with `admin@example.com` / `admin123`

## Still not working?

Check the browser Network tab (F12 → Network) when you click login:
- Look for the request to `/admin/auth/login`
- Check the status code and response
- Share the error message you see
