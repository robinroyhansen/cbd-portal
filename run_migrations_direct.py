#!/usr/bin/env python3
"""
Run Supabase migrations directly using psycopg2.

Usage:
    SUPABASE_DB_URL="postgresql://..." python run_migrations_direct.py

    Or provide individual components:
    DB_HOST="db.kcqnfqxoatcecwpapmps.supabase.co" \
    DB_PASSWORD="your-password" \
    python run_migrations_direct.py
"""

import os
import sys
import psycopg2
from psycopg2 import sql

def get_db_connection():
    """Get database connection using environment variables."""

    # Option 1: Direct database URL
    db_url = os.environ.get('SUPABASE_DB_URL')
    if db_url:
        return psycopg2.connect(db_url)

    # Option 2: Individual connection parameters
    db_host = os.environ.get('DB_HOST', 'db.kcqnfqxoatcecwpapmps.supabase.co')
    db_name = os.environ.get('DB_NAME', 'postgres')
    db_user = os.environ.get('DB_USER', 'postgres')
    db_password = os.environ.get('DB_PASSWORD')
    db_port = os.environ.get('DB_PORT', '5432')

    if not db_password:
        print("Error: DB_PASSWORD environment variable not set")
        print("\nTo get your database password:")
        print("1. Go to your Supabase Dashboard")
        print("2. Navigate to Settings → Database")
        print("3. Copy the password")
        print("\nThen run:")
        print("DB_PASSWORD='your-password' python run_migrations_direct.py")
        sys.exit(1)

    return psycopg2.connect(
        host=db_host,
        database=db_name,
        user=db_user,
        password=db_password,
        port=db_port
    )

def run_migrations():
    """Run the migration SQL file."""

    migration_file = os.path.join(
        os.path.dirname(__file__),
        "supabase/migrations/20251229_add_multi_language_support.sql"
    )

    if not os.path.exists(migration_file):
        print(f"Error: Migration file not found: {migration_file}")
        sys.exit(1)

    with open(migration_file, 'r') as f:
        migration_sql = f.read()

    try:
        # Connect to database
        print("Connecting to database...")
        conn = get_db_connection()
        cur = conn.cursor()

        # Execute migration
        print("Running migration...")
        cur.execute(migration_sql)

        # Commit changes
        conn.commit()

        # Verify languages table
        cur.execute("SELECT code, name, is_active FROM kb_languages ORDER BY display_order")
        languages = cur.fetchall()

        print("\n✅ Migration completed successfully!")
        print("\nLanguages configured:")
        for code, name, is_active in languages:
            status = "ACTIVE" if is_active else "inactive"
            print(f"  - {code}: {name} ({status})")

        cur.close()
        conn.close()

    except psycopg2.Error as e:
        print(f"\n❌ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

def main():
    """Main function."""
    print("Supabase Multi-Language Migration Tool")
    print("-" * 40)

    # Check if psycopg2 is installed
    try:
        import psycopg2
    except ImportError:
        print("Error: psycopg2 not installed")
        print("Install it with: pip install psycopg2-binary")
        sys.exit(1)

    run_migrations()

if __name__ == "__main__":
    main()