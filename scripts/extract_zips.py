#!/usr/bin/env python3
import os
import sys
from zipfile import ZipFile, BadZipFile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def extract_zip(zip_path: str, dest_dir: str) -> None:
    abs_zip = os.path.join(ROOT, zip_path)
    abs_dest = os.path.join(ROOT, dest_dir)

    if not os.path.exists(abs_zip):
        print(f"[ERROR] Zip not found: {abs_zip}")
        return

    os.makedirs(abs_dest, exist_ok=True)

    try:
        with ZipFile(abs_zip, 'r') as zf:
            print(f"[INFO] Extracting {zip_path} -> {dest_dir}")
            zf.extractall(abs_dest)
            print(f"[INFO] Extracted {len(zf.namelist())} files")
    except BadZipFile:
        print(f"[ERROR] Bad ZIP file: {zip_path}")
    except Exception as e:
        print(f"[ERROR] Failed to extract {zip_path}: {e}")

def main():
    # Default paths based on the task
    targets = [
        ("app/young_pos_system.zip", "app/young_pos_system"),
        ("constants/young_pos_system.zip", "constants/young_pos_system"),
    ]

    # Allow optional override via CLI args: pairs of zip,dest
    args = sys.argv[1:]
    if args:
        if len(args) % 2 != 0:
            print("[ERROR] Provide pairs of arguments: <zip_path> <dest_dir>")
            sys.exit(1)
        targets = [(args[i], args[i+1]) for i in range(0, len(args), 2)]

    for zip_path, dest_dir in targets:
        extract_zip(zip_path, dest_dir)

    print("[DONE] Extraction attempts complete.")

if __name__ == "__main__":
    main()