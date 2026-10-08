#!/usr/bin/env python3
"""
Convert parquet files to JSON format
Run: python convert_parquet.py
"""

import os
import json
import sys

try:
    import pandas as pd
except ImportError:
    print("Error: pandas not installed")
    print("Install with: pip install pandas pyarrow")
    exit(1)

DATA_PATH = r"C:\Users\mlebbi\Downloads\OneDrive_1_02-10-2026"
OUTPUT_PATH = "data"

# Create output directory
os.makedirs(OUTPUT_PATH, exist_ok=True)

# List of parquet files to convert
files = [
    'dim_project.parquet',
    'dim_ticket.parquet',
    'dim_assignee.parquet',
    'dim_status.parquet',
    'dim_sprint.parquet',
    'dim_squad.parquet',
    'dim_date.parquet',
    'fact_ticket_event.parquet',
    'fact_ticket_link.parquet',
    'fact_sprint_capacity.parquet',
    'fact_sprint_outcome.parquet',
    'fact_sprint_scope.parquet'
]

for filename in files:
    filepath = os.path.join(DATA_PATH, filename)
    if not os.path.exists(filepath):
        print(f"[SKIP] {filename} - file not found")
        continue

    try:
        print(f"[READ] {filename}...", end=" ", flush=True)
        df = pd.read_parquet(filepath)

        # Convert to records (list of dictionaries)
        records = df.to_dict('records')

        # Replace NaN/NaT with None
        for record in records:
            for key, value in record.items():
                if pd.isna(value):
                    record[key] = None
                # Convert datetime objects to ISO format strings
                elif hasattr(value, 'isoformat'):
                    record[key] = value.isoformat()

        # Save as JSON
        output_file = os.path.join(OUTPUT_PATH, f"{filename.replace('.parquet', '')}.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(records, f, ensure_ascii=False, indent=None)

        print(f"OK ({len(records)} records)")

    except Exception as e:
        print(f"ERROR: {e}")

print("\n[DONE] Conversion complete!")
