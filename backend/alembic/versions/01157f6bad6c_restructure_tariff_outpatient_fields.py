"""restructure_tariff_outpatient_fields

Revision ID: 01157f6bad6c
Revises: e13bb60a0579
Create Date: 2025-01-27 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '01157f6bad6c'
down_revision: Union[str, Sequence[str], None] = 'e13bb60a0579'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    connection = op.get_bind()
    
    # Check database dialect
    dialect = connection.dialect.name
    
    if dialect == 'postgresql':
        # PostgreSQL: Drop old columns and add new ones
        op.execute("""
            DO $$
            BEGIN
                -- Drop old columns if they exist
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='tariffs' AND column_name='outpatient_usd'
                ) THEN
                    ALTER TABLE tariffs DROP COLUMN outpatient_usd;
                END IF;
                
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='tariffs' AND column_name='co_insurance_outpatient'
                ) THEN
                    ALTER TABLE tariffs DROP COLUMN co_insurance_outpatient;
                END IF;
                
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='tariffs' AND column_name='co_insurance_inpatient'
                ) THEN
                    ALTER TABLE tariffs DROP COLUMN co_insurance_inpatient;
                END IF;
                
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='tariffs' AND column_name='co_insurance_text'
                ) THEN
                    ALTER TABLE tariffs DROP COLUMN co_insurance_text;
                END IF;
                
                -- Add new columns if they don't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='tariffs' AND column_name='outpatient_coverage_percentage'
                ) THEN
                    ALTER TABLE tariffs ADD COLUMN outpatient_coverage_percentage DOUBLE PRECISION;
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='tariffs' AND column_name='outpatient_price_usd'
                ) THEN
                    ALTER TABLE tariffs ADD COLUMN outpatient_price_usd NUMERIC(10, 2);
                END IF;
            END$$;
        """)
    elif dialect == 'sqlite':
        # SQLite: Need to recreate table since it doesn't support DROP COLUMN easily
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
                FOREIGN KEY(policy_id) REFERENCES insurance_policies (policy_id)
            )
        """)
        
        # Copy data (excluding old columns)
        op.execute("""
            INSERT INTO tariffs_new (
                tariff_id, policy_id, age_min, age_max, class_type, family_type,
                family_min, family_max, inpatient_usd, total_usd
            )
            SELECT 
                tariff_id, policy_id, age_min, age_max, class_type, family_type,
                family_min, family_max, inpatient_usd, total_usd
            FROM tariffs
        """)
        
        # Drop old table and rename new one
        op.execute("DROP TABLE tariffs")
        op.execute("ALTER TABLE tariffs_new RENAME TO tariffs")
    else:
        # Generic approach for other databases
        try:
            op.drop_column('tariffs', 'outpatient_usd')
        except Exception:
            pass
        try:
            op.drop_column('tariffs', 'co_insurance_outpatient')
        except Exception:
            pass
        try:
            op.drop_column('tariffs', 'co_insurance_inpatient')
        except Exception:
            pass
        try:
            op.drop_column('tariffs', 'co_insurance_text')
        except Exception:
            pass
        
        op.add_column('tariffs', sa.Column('outpatient_coverage_percentage', sa.Float(), nullable=True))
        op.add_column('tariffs', sa.Column('outpatient_price_usd', sa.Numeric(10, 2), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    connection = op.get_bind()
    dialect = connection.dialect.name
    
    if dialect == 'postgresql':
        op.execute("""
            DO $$
            BEGIN
                -- Drop new columns
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='tariffs' AND column_name='outpatient_coverage_percentage'
                ) THEN
                    ALTER TABLE tariffs DROP COLUMN outpatient_coverage_percentage;
                END IF;
                
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='tariffs' AND column_name='outpatient_price_usd'
                ) THEN
                    ALTER TABLE tariffs DROP COLUMN outpatient_price_usd;
                END IF;
                
                -- Restore old columns
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='tariffs' AND column_name='outpatient_usd'
                ) THEN
                    ALTER TABLE tariffs ADD COLUMN outpatient_usd NUMERIC(10, 2);
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='tariffs' AND column_name='co_insurance_outpatient'
                ) THEN
                    ALTER TABLE tariffs ADD COLUMN co_insurance_outpatient DOUBLE PRECISION DEFAULT 0.0;
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='tariffs' AND column_name='co_insurance_inpatient'
                ) THEN
                    ALTER TABLE tariffs ADD COLUMN co_insurance_inpatient DOUBLE PRECISION DEFAULT 0.0;
                END IF;
                
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='tariffs' AND column_name='co_insurance_text'
                ) THEN
                    ALTER TABLE tariffs ADD COLUMN co_insurance_text VARCHAR(100);
                END IF;
            END$$;
        """)
    else:
        try:
            op.drop_column('tariffs', 'outpatient_coverage_percentage')
        except Exception:
            pass
        try:
            op.drop_column('tariffs', 'outpatient_price_usd')
        except Exception:
            pass
        
        op.add_column('tariffs', sa.Column('outpatient_usd', sa.Numeric(10, 2), nullable=True))
        op.add_column('tariffs', sa.Column('co_insurance_outpatient', sa.Float(), nullable=True, server_default='0.0'))
        op.add_column('tariffs', sa.Column('co_insurance_inpatient', sa.Float(), nullable=True, server_default='0.0'))
        op.add_column('tariffs', sa.Column('co_insurance_text', sa.String(100), nullable=True))

