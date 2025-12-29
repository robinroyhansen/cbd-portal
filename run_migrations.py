#!/usr/bin/env python3
"""
Run Supabase migrations for multi-language support.

Usage:
    SUPABASE_SERVICE_ROLE_KEY="your-key" python run_migrations.py
"""

import os
import sys
import json
import requests
from typing import Optional

def run_migration(sql: str, supabase_url: str, service_role_key: str) -> bool:
    """Execute SQL migration against Supabase database."""

    # Remove trailing slash from URL if present
    supabase_url = supabase_url.rstrip('/')

    # Supabase REST API endpoint
    api_url = f"{supabase_url}/rest/v1/rpc"

    # Headers with service role key
    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

    # Split SQL into individual statements
    statements = [stmt.strip() for stmt in sql.split(';') if stmt.strip()]

    for i, statement in enumerate(statements, 1):
        print(f"Executing statement {i}/{len(statements)}...")

        # Use the query endpoint for raw SQL
        query_url = f"{supabase_url}/rest/v1/"

        # Execute via PostgREST's raw SQL endpoint
        response = requests.post(
            f"{supabase_url}/rest/v1/",
            headers={
                **headers,
                "Content-Profile": "public",
                "Accept": "application/json"
            },
            json={"query": statement}
        )

        # Alternative: Use direct SQL execution via pg endpoint
        response = requests.post(
            f"{supabase_url}/pg/query",
            headers={
                "apikey": service_role_key,
                "Authorization": f"Bearer {service_role_key}",
                "Content-Type": "application/json"
            },
            json={"query": statement}
        )

        if response.status_code not in [200, 201, 204]:
            print(f"Error executing statement {i}: {response.status_code}")
            print(f"Response: {response.text}")
            return False

    return True

def main():
    """Main function to run migrations."""

    # Get service role key from environment
    service_role_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

    if not service_role_key:
        print("Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set")
        print("\nTo get your service role key:")
        print("1. Go to your Supabase Dashboard")
        print("2. Navigate to Settings → API")
        print("3. Copy the 'service_role' key (under 'Project API keys')")
        print("\nThen run:")
        print("SUPABASE_SERVICE_ROLE_KEY='your-key-here' python run_migrations.py")
        sys.exit(1)

    # Supabase project URL
    supabase_url = "https://kcqnfqxoatcecwpapmps.supabase.co"

    # Read migration file
    migration_file = os.path.join(
        os.path.dirname(__file__),
        "supabase/migrations/20251229_add_multi_language_support.sql"
    )

    if not os.path.exists(migration_file):
        print(f"Error: Migration file not found: {migration_file}")
        sys.exit(1)

    with open(migration_file, 'r') as f:
        migration_sql = f.read()

    print(f"Running migrations against: {supabase_url}")
    print("-" * 50)

    # Note: Supabase doesn't expose direct SQL execution via REST API
    # You'll need to run this SQL directly in the Supabase SQL Editor

    print("Since Supabase doesn't allow direct SQL execution via REST API,")
    print("please run the following SQL in your Supabase SQL Editor:\n")
    print("1. Go to https://app.supabase.com/project/kcqnfqxoatcecwpapmps/editor")
    print("2. Click on 'SQL Editor' in the left sidebar")
    print("3. Create a new query")
    print("4. Copy and paste the SQL from:")
    print(f"   {migration_file}")
    print("5. Click 'Run' to execute the migration\n")

    # Create a simplified script to copy to clipboard if available
    try:
        import subprocess

        # Try to copy to clipboard (macOS)
        subprocess.run(
            ["pbcopy"],
            input=migration_sql.encode(),
            check=True
        )
        print("✓ Migration SQL has been copied to your clipboard!")
        print("  Just paste it in the Supabase SQL Editor and run it.")
    except:
        print("To view the migration SQL, run:")
        print(f"cat {migration_file}")

if __name__ == "__main__":
    main()