"""manual_restructure_database

Revision ID: 5b2a9e26cd06
Revises: e2d1c6ab86b9
Create Date: 2025-10-28 17:37:03.332894

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5b2a9e26cd06'
down_revision: Union[str, Sequence[str], None] = 'e721aa73f97d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    from sqlalchemy.dialects import postgresql
    
    # Step 1: Create new tables first (no dependencies)
    op.create_table('insurance_types',
        sa.Column('type_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('parent_type_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['parent_type_id'], ['insurance_types.type_id'], ),
        sa.PrimaryKeyConstraint('type_id')
    )
    op.create_index(op.f('ix_insurance_types_type_id'), 'insurance_types', ['type_id'], unique=False)
    
    op.create_table('providers',
        sa.Column('provider_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('contact_info', sa.Text(), nullable=True),
        sa.Column('rating', sa.Numeric(precision=3, scale=2), nullable=True),
        sa.Column('logo_url', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('provider_id')
    )
    op.create_index(op.f('ix_providers_provider_id'), 'providers', ['provider_id'], unique=False)
    
    op.create_table('required_documents',
        sa.Column('doc_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('file_type', sa.String(length=50), nullable=True),
        sa.Column('upload_instructions', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('doc_id')
    )
    op.create_index(op.f('ix_required_documents_doc_id'), 'required_documents', ['doc_id'], unique=False)
    
    # Step 2: Create insurance_policies (depends on insurance_types and providers)
    op.create_table('insurance_policies',
        sa.Column('policy_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('type_id', sa.Integer(), nullable=False),
        sa.Column('provider_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('coverage_summary', sa.Text(), nullable=True),
        sa.Column('exclusions_summary', sa.Text(), nullable=True),
        sa.Column('premium', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('duration', sa.String(length=50), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('contract_pdf_url', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['provider_id'], ['providers.provider_id'], ),
        sa.ForeignKeyConstraint(['type_id'], ['insurance_types.type_id'], ),
        sa.PrimaryKeyConstraint('policy_id')
    )
    op.create_index(op.f('ix_insurance_policies_policy_id'), 'insurance_policies', ['policy_id'], unique=False)
    
    # Step 3: Drop old tables first (to remove foreign key dependencies)
    # Drop dependent tables first
    op.drop_index(op.f('ix_quotes_id'), table_name='quotes')
    op.drop_table('quotes')
    op.drop_index(op.f('ix_quote_requests_id'), table_name='quote_requests')
    op.drop_table('quote_requests')
    op.drop_index(op.f('ix_coverage_options_id'), table_name='coverage_options')
    op.drop_table('coverage_options')
    op.drop_index(op.f('ix_notifications_id'), table_name='notifications')
    op.drop_table('notifications')
    
    # Step 4: Update users table (now that dependencies are removed)
    # Add new columns as nullable first
    op.add_column('users', sa.Column('user_id', sa.Integer(), autoincrement=True, nullable=True))
    op.add_column('users', sa.Column('name', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('phone', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('password_hash', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('created_at', sa.DateTime(), nullable=True))
    
    # Update existing data to populate new columns
    op.execute("UPDATE users SET user_id = id, name = full_name, password_hash = hashed_password, created_at = NOW()")
    
    # Make columns NOT NULL after data is populated
    op.alter_column('users', 'user_id', nullable=False)
    op.alter_column('users', 'name', nullable=False)
    op.alter_column('users', 'password_hash', nullable=False)
    
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.create_index(op.f('ix_users_user_id'), 'users', ['user_id'], unique=True)
    
    # Drop the old foreign key constraint from user_policies to users.id
    op.drop_constraint(op.f('user_policies_user_id_fkey'), 'user_policies', type_='foreignkey')
    
    op.drop_column('users', 'id')
    op.drop_column('users', 'full_name')
    op.drop_column('users', 'hashed_password')
    
    # Step 5: Create policy_document_versions (depends on insurance_policies)
    op.create_table('policy_document_versions',
        sa.Column('version_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('policy_id', sa.Integer(), nullable=False),
        sa.Column('version_number', sa.String(length=50), nullable=True),
        sa.Column('pdf_url', sa.String(length=255), nullable=True),
        sa.Column('effective_date', sa.Date(), nullable=True),
        sa.Column('expires_date', sa.Date(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['policy_id'], ['insurance_policies.policy_id'], ),
        sa.PrimaryKeyConstraint('version_id')
    )
    op.create_index(op.f('ix_policy_document_versions_version_id'), 'policy_document_versions', ['version_id'], unique=False)
    
    # Step 6: Update user_policies (depends on users, insurance_policies, policy_document_versions)
    op.add_column('user_policies', sa.Column('user_policy_id', sa.Integer(), autoincrement=True, nullable=False))
    op.add_column('user_policies', sa.Column('policy_id', sa.Integer(), nullable=False))
    op.add_column('user_policies', sa.Column('version_id', sa.Integer(), nullable=True))
    op.add_column('user_policies', sa.Column('premium_paid', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('user_policies', sa.Column('signed_contract_url', sa.String(length=255), nullable=True))
    op.add_column('user_policies', sa.Column('issued_at', sa.DateTime(), nullable=True))
    op.alter_column('user_policies', 'start_date',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.Date(),
               existing_nullable=True)
    op.alter_column('user_policies', 'end_date',
               existing_type=postgresql.TIMESTAMP(),
               type_=sa.Date(),
               existing_nullable=True)
    op.alter_column('user_policies', 'status',
               existing_type=sa.VARCHAR(),
               type_=sa.String(length=20),
               existing_nullable=True)
    op.drop_index(op.f('ix_user_policies_id'), table_name='user_policies')
    op.create_index(op.f('ix_user_policies_user_policy_id'), 'user_policies', ['user_policy_id'], unique=True)
    op.drop_constraint(op.f('user_policies_product_id_fkey'), 'user_policies', type_='foreignkey')
    op.create_foreign_key(None, 'user_policies', 'policy_document_versions', ['version_id'], ['version_id'])
    op.create_foreign_key(None, 'user_policies', 'users', ['user_id'], ['user_id'])
    op.create_foreign_key(None, 'user_policies', 'insurance_policies', ['policy_id'], ['policy_id'])
    # Drop the foreign key constraint from claims to user_policies.id before dropping the id column
    op.drop_constraint(op.f('claims_user_policy_id_fkey'), 'claims', type_='foreignkey')
    
    op.drop_column('user_policies', 'id')
    op.drop_column('user_policies', 'product_id')
    op.drop_column('user_policies', 'premium')
    
    # Now we can drop policy_products and insurers since user_policies no longer depends on them
    op.drop_index(op.f('ix_policy_products_id'), table_name='policy_products')
    op.drop_table('policy_products')
    op.drop_index(op.f('ix_insurers_id'), table_name='insurers')
    op.drop_table('insurers')
    
    # Step 7: Create user_documents (depends on users and required_documents)
    op.create_table('user_documents',
        sa.Column('user_doc_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('doc_id', sa.Integer(), nullable=False),
        sa.Column('file_url', sa.String(length=255), nullable=False),
        sa.Column('verified', sa.Boolean(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['doc_id'], ['required_documents.doc_id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ),
        sa.PrimaryKeyConstraint('user_doc_id')
    )
    op.create_index(op.f('ix_user_documents_user_doc_id'), 'user_documents', ['user_doc_id'], unique=False)
    
    # Step 8: Create policy_document_requirements (depends on insurance_policies and required_documents)
    op.create_table('policy_document_requirements',
        sa.Column('policy_doc_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('policy_id', sa.Integer(), nullable=False),
        sa.Column('doc_id', sa.Integer(), nullable=False),
        sa.Column('requirement_level', sa.String(length=50), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['doc_id'], ['required_documents.doc_id'], ),
        sa.ForeignKeyConstraint(['policy_id'], ['insurance_policies.policy_id'], ),
        sa.PrimaryKeyConstraint('policy_doc_id')
    )
    op.create_index(op.f('ix_policy_document_requirements_policy_doc_id'), 'policy_document_requirements', ['policy_doc_id'], unique=False)
    
    # Step 9: Update claims (depends on user_policies)
    op.add_column('claims', sa.Column('claim_id', sa.Integer(), autoincrement=True, nullable=False))
    op.add_column('claims', sa.Column('date_filed', sa.Date(), nullable=True))
    op.add_column('claims', sa.Column('claim_amount', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('claims', sa.Column('description', sa.Text(), nullable=True))
    op.alter_column('claims', 'status',
               existing_type=sa.VARCHAR(),
               type_=sa.String(length=20),
               existing_nullable=True)
    op.drop_index(op.f('ix_claims_id'), table_name='claims')
    op.create_index(op.f('ix_claims_claim_id'), 'claims', ['claim_id'], unique=False)
    op.create_foreign_key(None, 'claims', 'user_policies', ['user_policy_id'], ['user_policy_id'])
    op.drop_column('claims', 'id')
    op.drop_column('claims', 'created_at')
    op.drop_column('claims', 'title')


def downgrade() -> None:
    """Downgrade schema."""
    pass
