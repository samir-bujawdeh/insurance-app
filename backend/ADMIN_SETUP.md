# Admin Dashboard Setup

## Database Migration

The User model now has `is_admin` and `is_active` fields. You need to add these columns to your database.

### Option 1: Using Alembic (Recommended)

Create a migration:
```bash
cd backend
alembic revision -m "add_is_admin_and_is_active_to_users"
```

Then edit the migration file and add:
```python
def upgrade():
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))

def downgrade():
    op.drop_column('users', 'is_active')
    op.drop_column('users', 'is_admin')
```

Then run:
```bash
alembic upgrade head
```

### Option 2: Manual SQL (Quick Test)

If using PostgreSQL:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;
```

If using SQLite:
```sql
-- SQLite doesn't support IF NOT EXISTS in ALTER TABLE
-- You may need to recreate the table or use a migration
```

## Starting the Backend

1. Start your FastAPI server:
```bash
cd backend
uvicorn app.main:app --reload
```

2. The server will automatically create an admin user on startup:
   - **Email:** admin@example.com
   - **Password:** admin123
   
   ⚠️ **IMPORTANT:** Change this password in production!

## Frontend Configuration

1. Make sure your `.env` file in `insurance-admin-dashboard` has:
```
VITE_API_BASE_URL=http://localhost:8000
```

2. The frontend is already configured to connect to the backend.

## Testing

1. Start the backend: `uvicorn app.main:app --reload`
2. Start the frontend: `cd insurance-admin-dashboard && npm run dev`
3. Go to http://localhost:5173
4. Login with:
   - Email: `admin@example.com`
   - Password: `admin123`

## Available Admin Endpoints

All endpoints are under `/admin/*` and require admin authentication:

- `POST /admin/auth/login` - Admin login
- `GET /admin/auth/me` - Get current admin
- `GET /admin/dashboard/stats` - Dashboard statistics
- `GET /admin/users` - List users (with pagination)
- `PATCH /admin/users/{id}` - Update user
- `POST /admin/users/{id}/activate` - Activate user
- `POST /admin/users/{id}/deactivate` - Deactivate user
- `DELETE /admin/users/{id}` - Delete user
- `GET /admin/policies` - List policies
- `POST /admin/policies` - Create policy
- `PATCH /admin/policies/{id}` - Update policy
- `DELETE /admin/policies/{id}` - Delete policy
- `GET /admin/claims` - List claims
- `POST /admin/claims/{id}/approve` - Approve claim
- `POST /admin/claims/{id}/reject` - Reject claim
- `GET /admin/providers` - List providers
- And more...
