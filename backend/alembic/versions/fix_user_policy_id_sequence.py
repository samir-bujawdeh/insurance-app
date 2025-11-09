"""fix_user_policy_id_sequence

Revision ID: fix_user_policy_id_seq
Revises: 01157f6bad6c
Create Date: 2025-11-08 03:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fix_user_policy_id_seq'
down_revision: Union[str, Sequence[str], None] = '01157f6bad6c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Fix user_policy_id sequence for PostgreSQL."""
    connection = op.get_bind()
    dialect = connection.dialect.name
    
    if dialect == 'postgresql':
        # Check if sequence exists
        result = connection.execute(sa.text("""
            SELECT EXISTS (
                SELECT 1 FROM pg_sequences 
                WHERE schemaname = 'public' 
                AND sequencename = 'user_policies_user_policy_id_seq'
            )
        """))
        sequence_exists = result.scalar()
        
        if not sequence_exists:
            # Get the maximum value from the table
            result = connection.execute(sa.text("""
                SELECT COALESCE(MAX(user_policy_id), 0) FROM user_policies
            """))
            max_id = result.scalar() or 0
            
            # Create the sequence starting from max_id + 1
            connection.execute(sa.text(f"""
                CREATE SEQUENCE user_policies_user_policy_id_seq
                START WITH {max_id + 1}
                INCREMENT BY 1
                NO MINVALUE
                NO MAXVALUE
                CACHE 1
            """))
            
            # Set the sequence owner
            connection.execute(sa.text("""
                ALTER SEQUENCE user_policies_user_policy_id_seq
                OWNED BY user_policies.user_policy_id
            """))
        
        # Set the default value to use the sequence
        connection.execute(sa.text("""
            ALTER TABLE user_policies
            ALTER COLUMN user_policy_id
            SET DEFAULT nextval('user_policies_user_policy_id_seq'::regclass)
        """))
        
        # Make sure the sequence is up to date
        connection.execute(sa.text("""
            SELECT setval('user_policies_user_policy_id_seq', 
                         COALESCE((SELECT MAX(user_policy_id) FROM user_policies), 1), 
                         true)
        """))


def downgrade() -> None:
    """Remove the sequence (optional - usually not needed)."""
    connection = op.get_bind()
    dialect = connection.dialect.name
    
    if dialect == 'postgresql':
        # Remove default value
        connection.execute(sa.text("""
            ALTER TABLE user_policies
            ALTER COLUMN user_policy_id
            DROP DEFAULT
        """))
        
        # Drop sequence (optional)
        # connection.execute(sa.text("DROP SEQUENCE IF EXISTS user_policies_user_policy_id_seq"))

