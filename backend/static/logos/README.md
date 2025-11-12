# Company Logos

This folder contains company/provider logo images that are served by the backend API.

## Usage

1. **Place logo images here** - Add your company logo image files (PNG, JPG, SVG, etc.) to this folder.

2. **Reference in the database** - When creating or updating a provider, use the logo URL in the format:
   - Development: `http://localhost:8000/static/logos/your-logo.png`
   - Production: `https://your-api-domain.com/static/logos/your-logo.png`
   - Or use relative path: `/static/logos/your-logo.png` (will work with the API base URL)

3. **Example**:
   - File: `backend/static/logos/acme-insurance.png`
   - Logo URL in database: `/static/logos/acme-insurance.png`
   - Full URL (dev): `http://localhost:8000/static/logos/acme-insurance.png`

## Access from Mobile App

The mobile app can access these logos through the backend API:
- The mobile app's API base URL (e.g., `http://192.168.3.2:8000`) + `/static/logos/your-logo.png`
- Since the logo_url is stored in the database, the mobile app will automatically use the correct URL when fetching provider data

## Access from Admin Dashboard

The admin dashboard can also access these logos:
- Use the full backend API URL: `http://localhost:8000/static/logos/your-logo.png`
- Or configure the admin dashboard to proxy requests to the backend

## File Naming

Use descriptive, lowercase filenames with hyphens:
- ✅ `acme-insurance.png`
- ✅ `blue-shield-co.png`
- ❌ `Acme Insurance.png` (spaces and capitals can cause issues)

## Supported Formats

- PNG (recommended for logos with transparency)
- JPG/JPEG
- SVG (scalable vector graphics)
- WebP

## Notes

- Files in this folder are served statically by FastAPI
- The backend must be running for logos to be accessible
- Both the admin dashboard and mobile app access logos through the backend API
- This ensures a single source of truth for all logo assets

