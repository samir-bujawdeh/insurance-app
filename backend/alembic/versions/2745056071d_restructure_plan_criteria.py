"""restructure_plan_criteria

Revision ID: 2745056071d
Revises: 01157f6bad6c
Create Date: 2025-01-27 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '2745056071d'
down_revision: Union[str, Sequence[str], None] = 'add063fff9d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    connection = op.get_bind()
    dialect = connection.dialect.name
    
    if dialect == 'postgresql':
        # Add outpatient_criteria_data column
        op.execute("""
            DO $$
            BEGIN
                -- Add new column if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='plan_criteria' AND column_name='outpatient_criteria_data'
                ) THEN
                    ALTER TABLE plan_criteria ADD COLUMN outpatient_criteria_data JSONB NOT NULL DEFAULT '{}'::jsonb;
                END IF;
                
                -- Migrate existing data: extract out_patient from criteria_data and move to outpatient_criteria_data
                -- Update criteria_data to only contain in_patient
                UPDATE plan_criteria
                SET 
                    outpatient_criteria_data = COALESCE(criteria_data->'out_patient', '{}'::jsonb),
                    criteria_data = jsonb_build_object('in_patient', COALESCE(criteria_data->'in_patient', '{}'::jsonb))
                WHERE criteria_data ? 'out_patient' OR criteria_data ? 'in_patient';
            END$$;
        """)
    else:
        # Generic approach for other databases
        op.add_column('plan_criteria', sa.Column('outpatient_criteria_data', postgresql.JSONB(), nullable=False, server_default='{}'))
        
        # For non-PostgreSQL databases, we can't easily migrate the JSON data
        # The application layer should handle this migration


def downgrade() -> None:
    """Downgrade schema."""
    connection = op.get_bind()
    dialect = connection.dialect.name
    
    if dialect == 'postgresql':
        op.execute("""
            DO $$
            BEGIN
                -- Merge outpatient_criteria_data back into criteria_data
                UPDATE plan_criteria
                SET 
                    criteria_data = jsonb_build_object(
                        'in_patient', COALESCE(criteria_data->'in_patient', '{}'::jsonb),
                        'out_patient', COALESCE(outpatient_criteria_data->'out_patient', outpatient_criteria_data, '{}'::jsonb)
                    )
                WHERE outpatient_criteria_data IS NOT NULL;
                
                -- Drop the outpatient_criteria_data column
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='plan_criteria' AND column_name='outpatient_criteria_data'
                ) THEN
                    ALTER TABLE plan_criteria DROP COLUMN outpatient_criteria_data;
                END IF;
            END$$;
        """)
    else:
        # Generic approach for other databases
        op.drop_column('plan_criteria', 'outpatient_criteria_data')

