"""fix_tariff_family_type_column_size

Revision ID: 17fe06e87df4
Revises: 2745056071d
Create Date: 2025-11-12 01:08:02.352015

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '17fe06e87df4'
down_revision: Union[str, Sequence[str], None] = '2745056071d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - increase family_type column size from VARCHAR(20) to VARCHAR(30)."""
    connection = op.get_bind()
    dialect = connection.dialect.name
    
    if dialect == 'postgresql':
        # PostgreSQL: Use ALTER COLUMN to change the type
        op.execute("""
            DO $$
            BEGIN
                -- Check if column exists and alter its type
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='tariffs' AND column_name='family_type'
                ) THEN
                    ALTER TABLE tariffs 
                    ALTER COLUMN family_type TYPE VARCHAR(30);
                END IF;
            END$$;
        """)
    elif dialect == 'sqlite':
        # SQLite: Need to recreate table since it doesn't support ALTER COLUMN
        # This is a simplified approach - in production, you might want to use a table copy
        op.execute("""
            CREATE TABLE tariffs_new (
                tariff_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                policy_id INTEGER NOT NULL,
                age_min INTEGER NOT NULL,
                age_max INTEGER NOT NULL,
                class_type VARCHAR(10) NOT NULL,
                family_type VARCHAR(30),
                family_min INTEGER NOT NULL DEFAULT 1,
                family_max INTEGER NOT NULL DEFAULT 1,
                inpatient_usd NUMERIC(10, 2),
                total_usd NUMERIC(10, 2),
                outpatient_coverage_percentage REAL,
                outpatient_price_usd NUMERIC(10, 2),
                FOREIGN KEY(policy_id) REFERENCES insurance_plans (policy_id)
            )
        """)
        
        # Copy data
        op.execute("""
            INSERT INTO tariffs_new (
                tariff_id, policy_id, age_min, age_max, class_type, family_type,
                family_min, family_max, inpatient_usd, total_usd,
                outpatient_coverage_percentage, outpatient_price_usd
            )
            SELECT 
                tariff_id, policy_id, age_min, age_max, class_type, family_type,
                family_min, family_max, inpatient_usd, total_usd,
                outpatient_coverage_percentage, outpatient_price_usd
            FROM tariffs
        """)
        
        # Drop old table and rename new one
        op.execute("DROP TABLE tariffs")
        op.execute("ALTER TABLE tariffs_new RENAME TO tariffs")
    else:
        # Generic approach for other databases
        try:
            op.alter_column('tariffs', 'family_type',
                          existing_type=sa.String(length=20),
                          type_=sa.String(length=30),
                          existing_nullable=True)
        except Exception:
            # If alter_column doesn't work, try raw SQL
            op.execute("ALTER TABLE tariffs ALTER COLUMN family_type VARCHAR(30)")


def downgrade() -> None:
    """Downgrade schema - revert family_type column size back to VARCHAR(20)."""
    connection = op.get_bind()
    dialect = connection.dialect.name
    
    if dialect == 'postgresql':
        op.execute("""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='tariffs' AND column_name='family_type'
                ) THEN
                    ALTER TABLE tariffs 
                    ALTER COLUMN family_type TYPE VARCHAR(20);
                END IF;
            END$$;
        """)
    elif dialect == 'sqlite':
        # SQLite: Recreate table with smaller column
        op.execute("""
            CREATE TABLE tariffs_new (
                tariff_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                policy_id INTEGER NOT NULL,
                age_min INTEGER NOT NULL,
                age_max INTEGER NOT NULL,
                class_type VARCHAR(10) NOT NULL,
                family_type VARCHAR(20),
                family_min INTEGER NOT NULL DEFAULT 1,
                family_max INTEGER NOT NULL DEFAULT 1,
                inpatient_usd NUMERIC(10, 2),
                total_usd NUMERIC(10, 2),
                outpatient_coverage_percentage REAL,
                outpatient_price_usd NUMERIC(10, 2),
                FOREIGN KEY(policy_id) REFERENCES insurance_plans (policy_id)
            )
        """)
        
        op.execute("""
            INSERT INTO tariffs_new (
                tariff_id, policy_id, age_min, age_max, class_type, family_type,
                family_min, family_max, inpatient_usd, total_usd,
                outpatient_coverage_percentage, outpatient_price_usd
            )
            SELECT 
                tariff_id, policy_id, age_min, age_max, class_type, 
                CASE 
                    WHEN LENGTH(family_type) > 20 THEN SUBSTR(family_type, 1, 20)
                    ELSE family_type
                END as family_type,
                family_min, family_max, inpatient_usd, total_usd,
                outpatient_coverage_percentage, outpatient_price_usd
            FROM tariffs
        """)
        
        op.execute("DROP TABLE tariffs")
        op.execute("ALTER TABLE tariffs_new RENAME TO tariffs")
    else:
        try:
            op.alter_column('tariffs', 'family_type',
                          existing_type=sa.String(length=30),
                          type_=sa.String(length=20),
                          existing_nullable=True)
        except Exception:
            op.execute("ALTER TABLE tariffs ALTER COLUMN family_type VARCHAR(20)")
