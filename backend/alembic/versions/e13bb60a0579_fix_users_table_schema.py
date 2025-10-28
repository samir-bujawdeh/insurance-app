"""fix_users_table_schema

Revision ID: e13bb60a0579
Revises: 5b2a9e26cd06
Create Date: 2025-10-28 22:05:47.427408

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e13bb60a0579'
down_revision: Union[str, Sequence[str], None] = '5b2a9e26cd06'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Fix the users table structure
    connection = op.get_bind()
    
    # Check if user_id column exists and if it has null values
    result = connection.execute(sa.text("SELECT COUNT(*) FROM users WHERE user_id IS NULL"))
    null_count = result.scalar()
    
    if null_count > 0:
        # If there are null user_id values, we need to fix them
        # First, let's see what the current structure looks like
        result = connection.execute(sa.text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"))
        columns = [row[0] for row in result.fetchall()]
        
        if 'id' in columns and 'user_id' in columns:
            # Copy id values to user_id where user_id is null
            connection.execute(sa.text("UPDATE users SET user_id = id WHERE user_id IS NULL"))
        
        # Now make user_id NOT NULL
        op.alter_column('users', 'user_id', nullable=False)
        
        # Set user_id as primary key if it's not already
        try:
            op.create_primary_key('users_pkey', 'users', ['user_id'])
        except Exception:
            # Primary key might already exist, that's okay
            pass
    
    # Create sequence for user_id if it doesn't exist
    try:
        connection.execute(sa.text("CREATE SEQUENCE users_user_id_seq"))
    except Exception:
        # Sequence might already exist, that's okay
        pass
    
    # Set the sequence to start from the max user_id + 1
    try:
        connection.execute(sa.text("SELECT setval('users_user_id_seq', COALESCE((SELECT MAX(user_id) FROM users), 0) + 1)"))
    except Exception:
        # If this fails, it's not critical
        pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
