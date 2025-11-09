# Insurance Admin Dashboard

A modern React + TypeScript admin dashboard for managing the Insurance Platform. Built with Vite, Tailwind CSS, and ShadCN components.

## Features

- 🔐 JWT-based authentication with admin role checking
- 📊 Dashboard with KPIs and analytics charts
- 👥 User management with activation/deactivation
- 📄 Policy management (CRUD operations)
- 🛡️ Claims approval/rejection workflow
- 📁 Document management
- 🏢 Provider management
- 📤 CSV/JSON file upload for rate tables
- 📝 Admin activity logs
- ⚙️ Settings and configuration

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query (React Query)** - Server state management
- **TanStack Table** - Data tables
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **ShadCN UI** - Component library
- **Recharts** - Charts and visualizations
- **Sonner** - Toast notifications
- **Lucide React** - Icons

## Project Structure

```
src/
  ├── api/              # API client functions
  ├── components/       # Reusable UI components
  │   ├── layout/      # Layout components (Sidebar, etc.)
  │   └── ui/          # ShadCN UI components
  ├── context/         # React context (Auth, etc.)
  ├── hooks/           # Custom React hooks
  ├── lib/             # Utility functions
  ├── pages/           # Page components
  ├── types/           # TypeScript type definitions
  ├── App.tsx          # Main app component with routing
  └── main.tsx         # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository and navigate to the admin dashboard:

```bash
cd insurance-admin-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

4. Update `.env` with your API base URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Development

Start the development server:

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173` (or the port Vite assigns).

### Build

Build for production:

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Backend Integration

This dashboard connects to FastAPI backend endpoints under `/admin/*`. You'll need to implement the following endpoints in your FastAPI backend:

### Authentication
- `POST /admin/auth/login` - Admin login
- `GET /admin/auth/me` - Get current admin profile
- `POST /admin/auth/logout` - Logout

### Dashboard
- `GET /admin/dashboard/stats` - Get dashboard statistics

### Users
- `GET /admin/users` - List users (with pagination, filters)
- `GET /admin/users/{id}` - Get user by ID
- `PATCH /admin/users/{id}` - Update user
- `POST /admin/users/{id}/activate` - Activate user
- `POST /admin/users/{id}/deactivate` - Deactivate user
- `DELETE /admin/users/{id}` - Delete user

### Policies
- `GET /admin/policies` - List policies
- `GET /admin/policies/{id}` - Get policy by ID
- `POST /admin/policies` - Create policy
- `PATCH /admin/policies/{id}` - Update policy
- `DELETE /admin/policies/{id}` - Delete policy

### Claims
- `GET /admin/claims` - List claims
- `GET /admin/claims/{id}` - Get claim by ID
- `POST /admin/claims/{id}/approve` - Approve claim
- `POST /admin/claims/{id}/reject` - Reject claim

### Providers
- `GET /admin/providers` - List providers
- `GET /admin/providers/{id}` - Get provider by ID
- `POST /admin/providers` - Create provider
- `PATCH /admin/providers/{id}` - Update provider
- `DELETE /admin/providers/{id}` - Delete provider

### Upload
- `POST /admin/rates/upload` - Upload CSV/JSON rate file

### Logs
- `GET /admin/logs` - Get admin activity logs

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for the FastAPI backend | `http://localhost:8000` |

## Deployment (Vercel)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import the project in Vercel
3. Set environment variables in Vercel dashboard:
   - `VITE_API_BASE_URL` = Your production API URL (e.g., `https://api.myapp.com`)
4. Deploy!

The dashboard will be accessible at your Vercel domain (or custom domain like `admin.myapp.com`).

## Security Notes

- All API requests include JWT tokens from localStorage
- The backend should verify `is_admin=true` for all `/admin/*` endpoints
- CORS must be configured on the backend to allow requests from `admin.myapp.com`
- Use HTTPS in production for secure token transmission

## Development Notes

- The dashboard uses **mock data** as placeholders until backend endpoints are implemented
- All API functions are typed and ready to connect to real endpoints
- React Query handles caching and refetching automatically
- Toast notifications provide user feedback for all actions

## License

MIT
