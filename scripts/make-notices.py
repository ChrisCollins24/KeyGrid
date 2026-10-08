#!/usr/bin/env python3
"""Builds THIRD-PARTY-NOTICES.md: credits and license texts for everything Keygrid ships with.

Run from the repository root after `cargo fetch` in src-tauri (so library sources are on disk):
    python3 scripts/make-notices.py
"""
import glob
import json
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TAURI = os.path.join(ROOT, 'src-tauri')
REG = glob.glob(os.path.expanduser('~/.cargo/registry/src/*/'))[0]
OUT = os.path.join(ROOT, 'THIRD-PARTY-NOTICES.md')

# ---------- Rust libraries compiled into the Mac app ----------
meta = json.loads(subprocess.check_output(
    ['cargo', 'metadata', '--format-version', '1', '--locked'], cwd=TAURI))
nodes = {n['id']: n for n in meta['resolve']['nodes']}
pkgs = {p['id']: p for p in meta['packages']}


def mac_dep(kind):
    t = (kind.get('target') or '').replace(' ', '')
    if not t:
        return True
    if any(s in t for s in ('macos', 'darwin', 'apple', 'cfg(unix)')):
        return True
    if any(s in t for s in ('linux', 'windows', 'android', 'ios', 'wasm', 'freebsd', 'openbsd', 'netbsd', 'dragonfly')):
        return t.startswith('cfg(not(') or 'not(any(' in t
    return True


seen, stack = set(), [meta['resolve']['root']]
while stack:
    i = stack.pop()
    if i in seen:
        continue
    seen.add(i)
    for d in nodes[i]['deps']:
        if any(mac_dep(k) for k in d.get('dep_kinds', [{}])):
            stack.append(d['pkg'])
seen.discard(meta['resolve']['root'])


def copyright_lines(name, version):
    lines = set()
    for f in sorted(glob.glob(f'{REG}{name}-{version}/LICENSE*') + glob.glob(f'{REG}{name}-{version}/COPYING*')):
        if os.path.isdir(f):
            continue
        for raw in open(f, errors='ignore').read().splitlines():
            s = raw.strip()
            low = s.lower()
            if (re.match(r'^(copyright\b|©)', s, re.I)
                    and not re.match(r'^copyright\s+(license|licen[cs]e|owner|notice|holder|statement|and|law|protection|or|to|is|in)\b', low)
                    and (re.search(r'(19|20)\d\d', s) or re.search(r'authors|contributors|developers|project|inc\.|llc|ltd|foundation', low))
                    and not re.search(r'[\[{<](yyyy|year|name of copyright owner|copyright holders?)', low)
                    and len(s) < 200):
                lines.add(s)
    return sorted(lines)


crates = []
for i in sorted(seen, key=lambda x: (pkgs[x]['name'], pkgs[x]['version'])):
    p = pkgs[i]
    crates.append((p['name'], p['version'], p.get('license') or 'see package', p.get('repository') or '',
                   copyright_lines(p['name'], p['version'])))


def text(path):
    return open(path, errors='ignore').read().strip()


FONTS = '/home/claude/fontsrc/node_modules/@fontsource' if os.path.isdir('/home/claude/fontsrc') else None
ofl = text(os.path.join(ROOT, 'scripts', 'licenses', 'OFL-1.1.txt'))
licenses = {
    'Apache License 2.0': text(os.path.join(ROOT, 'scripts', 'licenses', 'Apache-2.0.txt')),
    'MIT License': text(os.path.join(ROOT, 'scripts', 'licenses', 'MIT.txt')),
    'BSD 3-Clause License': text(os.path.join(ROOT, 'scripts', 'licenses', 'BSD-3-Clause.txt')),
    'zlib License': text(os.path.join(ROOT, 'scripts', 'licenses', 'Zlib.txt')),
    'Mozilla Public License 2.0': text(os.path.join(ROOT, 'scripts', 'licenses', 'MPL-2.0.txt')),
    'Unicode License v3': text(os.path.join(ROOT, 'scripts', 'licenses', 'Unicode-3.0.txt')),
}

md = []
md.append('# Third-party notices and credits\n')
md.append('Keygrid is Copyright © 2026 Christian Collins. All rights reserved (see [LICENSE](LICENSE)).\n')
md.append('Keygrid is built with the open-source software, fonts and published research credited below. '
          'Each is used under its own license, reproduced at the end of this file. '
          'Where a library offers a choice of licenses, Keygrid uses it under the MIT or Apache 2.0 option.\n')

md.append('## Acknowledgments\n')
md.append('- **Development:** Keygrid was designed and directed by Christian Collins and written with the help of Claude, an AI model by Anthropic.')
md.append('- **App framework:** [Tauri](https://tauri.app) by the Tauri Programme within The Commons Conservancy (MIT or Apache 2.0).')
md.append('- **Beat tracking:** dynamic-programming beat tracker after Daniel P. W. Ellis, "Beat Tracking by Dynamic Programming", *Journal of New Music Research* 36(1), 2007.')
md.append('- **Key detection:** major and minor key profiles from Carol L. Krumhansl and Edward J. Kessler (1982) and from David Temperley, *The Cognition of Basic Musical Structures* (MIT Press, 2001).')
md.append('- **Loudness:** integrated loudness (LUFS) per Recommendation ITU-R BS.1770, *Algorithms to measure audio programme loudness and true-peak audio level*.')
md.append('- **Key codes:** Open Key notation, an openly documented alternative to proprietary key wheels.\n')

md.append('## Trademarks\n')
md.append('Keygrid is an independent product. It is not affiliated with, endorsed by, or sponsored by Valhalla DSP, LLC; '
          'Avid Technology, Inc. (Pro Tools); Antares Audio Technologies (Auto-Tune); Celemony Software GmbH (Melodyne); '
          'or Mixed In Key LLC. ValhallaVintageVerb, Pro Tools, Auto-Tune, Melodyne and Mixed In Key are trademarks of their '
          'respective owners and are mentioned only to describe compatibility.\n')

md.append('## Fonts\n')
md.append('These fonts are included in the app under the SIL Open Font License 1.1 (full text below).\n')
md.append('| Font | Copyright | Source |')
md.append('|---|---|---|')
md.append('| Outfit | Copyright 2021 The Outfit Project Authors | https://github.com/Outfitio/Outfit-Fonts |')
md.append('| Figtree | Copyright 2022 The Figtree Project Authors | https://github.com/erikdkennedy/figtree |')
md.append('| IBM Plex Mono | Copyright 2017 IBM Corp. | https://github.com/IBM/plex |\n')
md.append('Font files were obtained through the Fontsource project (https://fontsource.org).\n')

md.append(f'## Rust libraries ({len(crates)})\n')
md.append('These libraries are compiled into the Mac app. Source code for each is available from crates.io and the repository listed.\n')
md.append('| Library | Version | License | Copyright |')
md.append('|---|---|---|---|')
for name, ver, lic, repo, cps in crates:
    link = f'[{name}]({repo})' if repo else name
    cp = '<br>'.join(c.replace('|', '\\|') for c in cps) if cps else 'The ' + name + ' authors'
    md.append(f'| {link} | {ver} | {lic} | {cp} |')
md.append('')

md.append('## License texts\n')
md.append('### SIL Open Font License 1.1\n')
md.append('```\n' + ofl + '\n```\n')
for title, body in licenses.items():
    md.append(f'### {title}\n')
    md.append('```\n' + body + '\n```\n')

open(OUT, 'w').write('\n'.join(md))
print(f'Wrote {OUT}: {len(crates)} libraries')
