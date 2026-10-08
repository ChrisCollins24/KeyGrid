#!/usr/bin/env python3
"""Prints the GitHub release notes for one version: its CHANGELOG.md section plus install steps.

    python3 scripts/release-notes.py 1.0.3        # notes for one version
    python3 scripts/release-notes.py --versions   # every version listed in CHANGELOG.md
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
log = open(os.path.join(ROOT, 'CHANGELOG.md'), encoding='utf-8').read()
sections = re.split(r'^## ', log, flags=re.M)[1:]
by_version = {}
for sec in sections:
    head, _, body = sec.partition('\n')
    m = re.match(r'(\d+\.\d+\.\d+)', head.strip())
    if m:
        by_version[m.group(1)] = body.strip()

if len(sys.argv) > 1 and sys.argv[1] == '--versions':
    print('\n'.join(by_version))
    sys.exit(0)

version = sys.argv[1].lstrip('v')
changes = by_version.get(version, '_No changes listed for this version._')
changes = re.sub(r'^### ', '#### ', changes, flags=re.M)
print(f"""## What's new in {version}

{changes}

---

### Install
1. Download **Keygrid_{version}_universal.dmg** below and open it.
2. Drag **Keygrid** into **Applications**.
3. First time only: open Keygrid once, then go to **System Settings → Privacy & Security** and click **Open Anyway**.

Works on Apple Silicon and Intel Macs running macOS 11 or newer. Your history in **Previous** carries over when you update.

[All changes](https://github.com/ChrisCollins24/KeyGrid/blob/main/CHANGELOG.md)""")
