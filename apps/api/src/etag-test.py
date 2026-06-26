#!/usr/bin/env python3
"""
ETag validation script for TaskFlow API.

Simplified version that directly validates the Express app configuration
by checking app settings, without starting a live server.

Usage: python3 apps/api/src/etag-test.py
"""

import re
import sys
import os


def test_index_ts_disables_etag():
    """Verify that apps/api/src/index.ts calls app.disable('etag') before routes."""
    index_path = os.path.join(
        os.path.dirname(__file__),
        "index.ts"
    )
    
    with open(index_path) as f:
        content = f.read()
    
    # Check that app.disable("etag") is present
    disable_str = 'app.disable("etag")'
    if disable_str not in content:
        print(f"FAIL: app.disable('etag') not found in {index_path}")
        return False
    print(f"PASS: app.disable('etag') found in index.ts")
    
    # Check that it appears BEFORE app.use(express.json()) (route registration)
    disable_pos = content.find('app.disable("etag")')
    if disable_pos == -1:
        disable_pos = content.find("app.disable('etag')")
    
    use_json_pos = content.find("app.use(express.json())")
    routes_start = content.find("app.get(")
    
    if disable_pos < use_json_pos and disable_pos < routes_start:
        print(f"PASS: app.disable('etag') is set before routes are registered")
    else:
        print(f"FAIL: app.disable('etag') must be set before route registration")
        return False
    
    return True


def test_health_endpoint_matches_expected():
    """Verify /health response body matches expected structure."""
    index_path = os.path.join(
        os.path.dirname(__file__),
        "index.ts"
    )
    
    with open(index_path) as f:
        content = f.read()
    
    # The /health handler must return { status: "ok", service: "taskflow-api" }
    if "status: \"ok\"" in content and "service: \"taskflow-api\"" in content:
        print("PASS: /health endpoint response body is preserved")
    else:
        print("FAIL: /health endpoint body has changed unexpectedly")
        return False
    
    return True


def main():
    tests = [
        ("ETag disabled", test_index_ts_disables_etag),
        ("Health endpoint preserved", test_health_endpoint_matches_expected),
    ]
    
    all_pass = True
    for name, fn in tests:
        print(f"\n--- {name} ---")
        if not fn():
            all_pass = False
    
    print()
    if all_pass:
        print("✓ All ETag validation tests passed.")
        sys.exit(0)
    else:
        print("✗ Some ETag validation tests failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
