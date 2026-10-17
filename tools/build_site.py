#!/usr/bin/env python3
"""Build dist/ and apply protected code to designer/ from tools/designer-source/.

Requires Python 3 and Node.js 22+. esbuild performs syntax-aware JavaScript
bundling/minification; this is obfuscation, not reversible runtime encryption.
Run from any directory: python /path/to/Flowmind/tools/build_site.py
"""

import argparse
from pathlib import Path
import shutil
import subprocess
import sys


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--skip-install", action="store_true",
        help="Use already installed dependencies instead of running npm ci.",
    )
    parser.add_argument(
        "--prebuilt", action="store_true",
        help="Package committed designer/ for deployment without reading local source.",
    )
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    node = shutil.which("node")
    npm = shutil.which("npm.cmd" if sys.platform == "win32" else "npm")
    if not node or (not args.skip_install and not npm):
        parser.error("Install Node.js 22+ (including npm) before building.")
    try:
        if not args.skip_install:
            subprocess.run([npm, "ci", "--include=dev"], cwd=root, check=True)
        command = [node, str(root / "tools" / "build-site.mjs")]
        if args.prebuilt:
            command.append("--prebuilt")
        subprocess.run(command, cwd=root, check=True)
    except subprocess.CalledProcessError as error:
        print("Production build failed. Do not deploy the output.", file=sys.stderr)
        return error.returncode
    print(f"Ready to publish: {root / 'dist'}")
    print(f"Public Designer artifact: {root / 'designer'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
