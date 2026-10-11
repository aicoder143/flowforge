#!/usr/bin/env python3
"""Test FlowForge, sync dist/ to docs/, and optionally commit/push the result."""
from __future__ import annotations

import argparse
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
DOCS = ROOT / "docs"


def run(*args: str) -> None:
    subprocess.run(args, cwd=ROOT, check=True)


def publish(push: bool, message: str) -> None:
    if not (DIST / "index.html").is_file():
        raise SystemExit("dist/index.html is missing")
    run("npm", "test")
    if DOCS.exists():
        shutil.rmtree(DOCS)
    shutil.copytree(DIST, DOCS)
    (DOCS / ".nojekyll").touch()
    print(f"Updated {DOCS.relative_to(ROOT)} from dist/")
    if push:
        run("git", "add", "dist", "docs", "tests", "examples", "scripts", "package.json", "README.md", ".github")
        changed = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=ROOT).returncode != 0
        if changed:
            run("git", "commit", "-m", message)
            run("git", "push", "origin", "main")
        else:
            print("No changes to push")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--push", action="store_true", help="Commit and push changes to origin/main")
    parser.add_argument("--message", default="Publish FlowForge AI to GitHub Pages", help="Commit message")
    args = parser.parse_args()
    publish(args.push, args.message)
