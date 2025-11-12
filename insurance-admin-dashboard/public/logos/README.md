# Company Logos

⚠️ **IMPORTANT**: This folder is for admin dashboard assets only. 

**For company/provider logos that need to be accessible from both the admin dashboard AND the mobile app, store them in the backend instead:**

👉 **Use: `backend/static/logos/`** (see `backend/static/logos/README.md`)

## Why?

- The mobile app connects to the backend API, not the admin dashboard
- Logos stored here are only accessible from the admin dashboard
- Storing logos in `backend/static/logos/` ensures both apps can access them through the backend API

## If you still want to use this folder

This folder can be used for admin dashboard-specific assets that don't need to be shared with the mobile app:

1. **Place images here** - Add image files (PNG, JPG, SVG, etc.) to this folder.

2. **Reference in code** - Use relative paths:
   - `/logos/your-image.png` (works in both dev and production)

3. **Example**:
   - File: `public/logos/admin-icon.png`
   - Reference: `/logos/admin-icon.png`

