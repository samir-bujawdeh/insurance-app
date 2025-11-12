"""rename_insurance_policies_to_insurance_plans

Revision ID: add063fff9d4
Revises: fix_user_policy_id_seq
Create Date: 2025-11-10 23:56:33.316965

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add063fff9d4'
down_revision: Union[str, Sequence[str], None] = 'fix_user_policy_id_seq'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Rename insurance_policies table to insurance_plans and update foreign keys."""
    connection = op.get_bind()
    dialect = connection.dialect.name
    
    if dialect == 'postgresql':
        # Check if insurance_policies table exists
        result = connection.execute(sa.text("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'insurance_policies'
            )
        """))
        old_table_exists = result.scalar()
        
        # Check if insurance_plans table already exists
        result = connection.execute(sa.text("""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'insurance_plans'
            )
        """))
        new_table_exists = result.scalar()
        
        # Only rename if old table exists and new table doesn't
        if old_table_exists and not new_table_exists:
            op.execute("ALTER TABLE insurance_policies RENAME TO insurance_plans")
        elif not old_table_exists and new_table_exists:
            # Table already renamed, just update foreign keys
            pass
        elif old_table_exists and new_table_exists:
            # Both exist - need to merge data
            # Check row counts
            result = connection.execute(sa.text("SELECT COUNT(*) FROM insurance_policies"))
            old_count = result.scalar()
            result = connection.execute(sa.text("SELECT COUNT(*) FROM insurance_plans"))
            new_count = result.scalar()
            
            if old_count > 0 and new_count == 0:
                # Old table has data, new table is empty - copy data
                op.execute("""
                    INSERT INTO insurance_plans (policy_id, type_id, provider_id, name, description, duration, status, contract_pdf_url)
                    SELECT policy_id, type_id, provider_id, name, description, duration, status::policystatus, contract_pdf_url
                    FROM insurance_policies
                    ON CONFLICT (policy_id) DO NOTHING
                """)
                # Drop the old table
                op.execute("DROP TABLE insurance_policies CASCADE")
            elif old_count == 0:
                # Old table is empty, just drop it
                op.execute("DROP TABLE insurance_policies CASCADE")
            elif new_count > 0 and old_count > 0:
                # Both have data - try to merge (insert only new records)
                op.execute("""
                    INSERT INTO insurance_plans (policy_id, type_id, provider_id, name, description, duration, status, contract_pdf_url)
                    SELECT policy_id, type_id, provider_id, name, description, duration, status::policystatus, contract_pdf_url
                    FROM insurance_policies
                    WHERE policy_id NOT IN (SELECT policy_id FROM insurance_plans)
                """)
                # Drop the old table after merging
                op.execute("DROP TABLE insurance_policies CASCADE")
            else:
                # Both empty, just drop old table
                op.execute("DROP TABLE insurance_policies CASCADE")
        
        # Update foreign key constraints
        # Drop and recreate foreign keys for policy_document_requirements
        op.execute("""
            ALTER TABLE policy_document_requirements
            DROP CONSTRAINT IF EXISTS policy_document_requirements_policy_id_fkey
        """)
        op.execute("""
            ALTER TABLE policy_document_requirements
            ADD CONSTRAINT policy_document_requirements_policy_id_fkey
            FOREIGN KEY (policy_id) REFERENCES insurance_plans(policy_id)
        """)
        
        # Drop and recreate foreign keys for policy_document_versions
        op.execute("""
            ALTER TABLE policy_document_versions
            DROP CONSTRAINT IF EXISTS policy_document_versions_policy_id_fkey
        """)
        op.execute("""
            ALTER TABLE policy_document_versions
            ADD CONSTRAINT policy_document_versions_policy_id_fkey
            FOREIGN KEY (policy_id) REFERENCES insurance_plans(policy_id)
        """)
        
        # Drop and recreate foreign keys for user_policies
        op.execute("""
            ALTER TABLE user_policies
            DROP CONSTRAINT IF EXISTS user_policies_policy_id_fkey
        """)
        op.execute("""
            ALTER TABLE user_policies
            ADD CONSTRAINT user_policies_policy_id_fkey
            FOREIGN KEY (policy_id) REFERENCES insurance_plans(policy_id)
        """)
        
        # Drop and recreate foreign keys for tariffs
        op.execute("""
            ALTER TABLE tariffs
            DROP CONSTRAINT IF EXISTS tariffs_policy_id_fkey
        """)
        op.execute("""
            ALTER TABLE tariffs
            ADD CONSTRAINT tariffs_policy_id_fkey
            FOREIGN KEY (policy_id) REFERENCES insurance_plans(policy_id)
        """)
        
        # Drop and recreate foreign keys for plan_criteria
        op.execute("""
            ALTER TABLE plan_criteria
            DROP CONSTRAINT IF EXISTS plan_criteria_policy_id_fkey
        """)
        op.execute("""
            ALTER TABLE plan_criteria
            ADD CONSTRAINT plan_criteria_policy_id_fkey
            FOREIGN KEY (policy_id) REFERENCES insurance_plans(policy_id)
        """)
        
        # Update indexes if they reference the table name
        op.execute("""
            DROP INDEX IF EXISTS ix_insurance_policies_policy_id
        """)
        op.execute("""
            CREATE INDEX IF NOT EXISTS ix_insurance_plans_policy_id ON insurance_plans(policy_id)
        """)
    else:
        # For other databases, use generic approach
        # Check if table exists before renaming
        try:
            op.rename_table('insurance_policies', 'insurance_plans')
        except Exception:
            # Table might already be renamed, continue
            pass


def downgrade() -> None:
    """Revert insurance_plans table back to insurance_policies."""
    connection = op.get_bind()
    dialect = connection.dialect.name
    
    if dialect == 'postgresql':
        # Update foreign key constraints back
        op.execute("""
            ALTER TABLE policy_document_requirements
            DROP CONSTRAINT IF EXISTS policy_document_requirements_policy_id_fkey
        """)
        op.execute("""
            ALTER TABLE policy_document_requirements
            ADD CONSTRAINT policy_document_requirements_policy_id_fkey
            FOREIGN KEY (policy_id) REFERENCES insurance_policies(policy_id)
        """)
        
        op.execute("""
            ALTER TABLE policy_document_versions
            DROP CONSTRAINT IF EXISTS policy_document_versions_policy_id_fkey
        """)
        op.execute("""
            ALTER TABLE policy_document_versions
            ADD CONSTRAINT policy_document_versions_policy_id_fkey
            FOREIGN KEY (policy_id) REFERENCES insurance_policies(policy_id)
        """)
        
        op.execute("""
            ALTER TABLE user_policies
            DROP CONSTRAINT IF EXISTS user_policies_policy_id_fkey
        """)
        op.execute("""
            ALTER TABLE user_policies
            ADD CONSTRAINT user_policies_policy_id_fkey
            FOREIGN KEY (policy_id) REFERENCES insurance_policies(policy_id)
        """)
        
        op.execute("""
            ALTER TABLE tariffs
            DROP CONSTRAINT IF EXISTS tariffs_policy_id_fkey
        """)
        op.execute("""
            ALTER TABLE tariffs
            ADD CONSTRAINT tariffs_policy_id_fkey
            FOREIGN KEY (policy_id) REFERENCES insurance_policies(policy_id)
        """)
        
        op.execute("""
            ALTER TABLE plan_criteria
            DROP CONSTRAINT IF EXISTS plan_criteria_policy_id_fkey
        """)
        op.execute("""
            ALTER TABLE plan_criteria
            ADD CONSTRAINT plan_criteria_policy_id_fkey
            FOREIGN KEY (policy_id) REFERENCES insurance_policies(policy_id)
        """)
        
        # Rename the table back
        op.execute("ALTER TABLE insurance_plans RENAME TO insurance_policies")
        
        # Update indexes back
        op.execute("""
            DROP INDEX IF EXISTS ix_insurance_plans_policy_id
        """)
        op.execute("""
            CREATE INDEX IF NOT EXISTS ix_insurance_policies_policy_id ON insurance_policies(policy_id)
        """)
    else:
        # For other databases
        op.rename_table('insurance_plans', 'insurance_policies')
