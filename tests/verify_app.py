#!/usr/bin/env python3
"""Automated verification suite for Orbital Fifths."""

import functools
import http.server
import json
import os
import re
import socketserver
import sys
import threading
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LETTER_PC = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def parse_chord_py(symbol):
    """Mirror Theory.parseChord logic for Python verification."""
    cleaned = symbol.strip().replace("♯", "#").replace("♭", "b")
    main_part = cleaned.split("/")[0].strip()
    m = re.match(r"^([A-Ga-g])([#b]?)(.*)$", main_part)
    if not m:
        return None
    letter = m.group(1).upper()
    acc = m.group(2)
    rest = m.group(3).strip()

    pc = LETTER_PC[letter]
    if acc == "#":
        pc = (pc + 1) % 12
    elif acc == "b":
        pc = (pc - 1) % 12

    if rest in ("°", "dim", "o", "ø", "m7b5", "dim7", "°7"):
        qual = "dim"
    elif rest in ("m", "min", "-", "m7", "min7", "-7", "m9", "min9", "m6", "min6", "madd9", "mmaj7", "m(maj7)"):
        qual = "min"
    elif rest.startswith("m") and not rest.startswith("maj"):
        qual = "min"
    else:
        qual = "maj"

    return (pc, qual)


def match_sequence(norm_songs, user_chords, exact_key=False, prefix_only=False):
    user_norm = [parse_chord_py(c) for c in user_chords]
    assert all(x is not None for x in user_norm), f"Failed to parse user chords: {user_chords}"
    k = len(user_norm)
    matched_ids = []

    for song, s_norm in norm_songs:
        m = len(s_norm)
        max_start = 1 if prefix_only else m
        found = False
        for p in range(max_start):
            delta = (user_norm[0][0] - s_norm[p][0]) % 12
            if exact_key and delta != 0:
                continue
            ok = True
            for j in range(k):
                idx = (p + j) % m
                if ((s_norm[idx][0] + delta) % 12) != user_norm[j][0] or s_norm[idx][1] != user_norm[j][1]:
                    ok = False
                    break
            if ok:
                found = True
                break
        if found:
            matched_ids.append(song["id"])
    return matched_ids


def check_balanced_delimiters(filepath):
    text = open(filepath, encoding="utf-8").read()
    stack = []
    pairs = {"(": ")", "[": "]", "{": "}"}
    closing = {")": "(", "]": "[", "}": "{"}
    i = 0
    n = len(text)
    in_single = False
    in_double = False
    in_line_comment = False
    in_block_comment = False
    last_non_ws = ""

    while i < n:
        ch = text[i]
        nxt = text[i + 1] if i + 1 < n else ""

        if in_line_comment:
            if ch == "\n":
                in_line_comment = False
            i += 1
            continue
        if in_block_comment:
            if ch == "*" and nxt == "/":
                in_block_comment = False
                i += 2
            else:
                i += 1
            continue
        if in_single:
            if ch == "\\":
                i += 2
                continue
            if ch == "'":
                in_single = False
                last_non_ws = "'"
            i += 1
            continue
        if in_double:
            if ch == "\\":
                i += 2
                continue
            if ch == '"':
                in_double = False
                last_non_ws = '"'
            i += 1
            continue

        if ch == "/" and nxt == "/":
            in_line_comment = True
            i += 2
            continue
        if ch == "/" and nxt == "*":
            in_block_comment = True
            i += 2
            continue
        if ch == "'" and not filepath.endswith(".css"):
            in_single = True
            i += 1
            continue
        if ch == '"':
            in_double = True
            i += 1
            continue

        # Skip regex literals in JS (only after operator/delimiter, never after identifier/number/closing paren)
        if filepath.endswith(".js") and ch == "/" and last_non_ws in ("", "(", "=", "[", ",", "!", ":", "?", ";", "&", "|", "{", "}"):
            j = i + 1
            in_char_class = False
            while j < n and text[j] != "\n":
                if text[j] == "\\":
                    j += 2
                    continue
                if text[j] == "[":
                    in_char_class = True
                elif text[j] == "]":
                    in_char_class = False
                elif text[j] == "/" and not in_char_class:
                    i = j + 1
                    last_non_ws = "/"
                    break
                j += 1
            else:
                i += 1
            continue

        if ch in pairs:
            stack.append(ch)
        elif ch in closing:
            if not stack or stack[-1] != closing[ch]:
                raise AssertionError(f"Unbalanced delimiter '{ch}' at index {i} in {filepath}")
            stack.pop()
        if not ch.isspace():
            last_non_ws = ch
        i += 1

    if stack:
        raise AssertionError(f"Unclosed delimiters {stack} in {filepath}")


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


def verify_http_and_html():
    index_path = os.path.join(ROOT, "index.html")
    assert os.path.exists(index_path), "Missing index.html"
    html = open(index_path, encoding="utf-8").read()

    assert 'type="module"' not in html and "type='module'" not in html, (
        "ES module scripts break file:// usage due to CORS"
    )
    assert not re.search(r'<(?:script|link)[^>]+(?:src|href)\s*=\s*["\']https?://', html, re.I), (
        "External CDN scripts/stylesheets are forbidden for offline reliability"
    )

    script_srcs = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', html)
    css_hrefs = re.findall(r'<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']([^"\']+)["\']', html)
    assets = ["/index.html"] + ["/" + p.lstrip("/") for p in css_hrefs + script_srcs]

    handler = functools.partial(QuietHandler, directory=ROOT)
    server = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    try:
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        for asset in assets:
            url = f"http://127.0.0.1:{port}{asset}"
            with opener.open(url, timeout=5) as resp:
                assert resp.status == 200, f"HTTP {resp.status} for {asset}"
                body = resp.read().decode("utf-8")
                assert len(body.strip()) > 0, f"Empty asset: {asset}"
    finally:
        server.shutdown()
        server.server_close()

    print(f"[PASS] HTTP server & file:// integrity verified across {len(assets)} assets (port {port}).")
    return html, script_srcs


def verify_dom_and_syntax(html, script_srcs):
    html_ids = set(re.findall(r'\bid=["\']([^"\']+)["\']', html))

    css_path = os.path.join(ROOT, "css", "styles.css")
    check_balanced_delimiters(css_path)

    for rel_src in script_srcs:
        fpath = os.path.join(ROOT, rel_src.replace("/", os.sep))
        assert os.path.exists(fpath), f"Missing script {rel_src}"
        check_balanced_delimiters(fpath)
        js_txt = open(fpath, encoding="utf-8").read()

        for m in re.finditer(r"getElementById\(\s*['\"]([^'\"]+)['\"]\s*\)", js_txt):
            assert m.group(1) in html_ids, f"Missing DOM id #{m.group(1)} referenced in {rel_src}"

        if rel_src.endswith("app.js"):
            arr_m = re.search(r"var\s+ids\s*=\s*\[(.*?)\];", js_txt, re.S)
            assert arr_m, "Expected ids array in app.js"
            cached_ids = re.findall(r"['\"]([^'\"]+)['\"]", arr_m.group(1))
            for cid in cached_ids:
                assert cid in html_ids, f"Missing DOM id #{cid} from cacheDom() in app.js"

    print(f"[PASS] DOM ID cross-check ({len(html_ids)} IDs) & JS/CSS syntax balance passed.")


def verify_song_db_and_narrowing():
    # Edge cases from plan: B, Bb, Bm, Bbm, B°, Bb°
    edge_expected = {
        "B": (11, "maj"),
        "Bb": (10, "maj"),
        "Bm": (11, "min"),
        "Bbm": (10, "min"),
        "B°": (11, "dim"),
        "Bb°": (10, "dim"),
    }
    for sym, exp in edge_expected.items():
        got = parse_chord_py(sym)
        assert got == exp, f"Chord parse mismatch for {sym}: got {got}, expected {exp}"

    songs_txt = open(os.path.join(ROOT, "js", "songs.js"), encoding="utf-8").read()
    m = re.search(r"const\s+SONG_DB\s*=\s*(\[.*?\]);", songs_txt, re.S)
    assert m, "Could not locate SONG_DB array in js/songs.js"
    song_db = json.loads(m.group(1))

    assert len(song_db) >= 120, f"Expected >= 120 songs, found {len(song_db)}"
    unique_pairs = {(s["title"], s["artist"]) for s in song_db}
    assert len(unique_pairs) == len(song_db), "Duplicate (title, artist) found in SONG_DB"

    norm_songs = []
    for s in song_db:
        for req in ("id", "title", "artist", "genre", "section", "originalKey", "insight"):
            assert isinstance(s.get(req), str) and len(s[req].strip()) > 0, f"Invalid {req} on {s}"
        assert isinstance(s.get("bpm"), (int, float)) and 40 <= s["bpm"] <= 220, f"Invalid bpm on {s['id']}"
        assert isinstance(s.get("chords"), list) and len(s["chords"]) >= 2, f"Invalid chords on {s['id']}"
        parsed_chords = [parse_chord_py(c) for c in s["chords"]]
        assert all(p is not None for p in parsed_chords), f"Unparsable chord in {s['id']}: {s['chords']}"
        norm_songs.append((s, parsed_chords))

    sequences = [
        (["C"], ["C", "G"], ["C", "G", "Am"], ["C", "G", "Am", "F"]),
        (["D"], ["D", "A"], ["D", "A", "Bm"], ["D", "A", "Bm", "G"]),
        (["Am"], ["Am", "F"], ["Am", "F", "C"], ["Am", "F", "C", "G"]),
        (["G"], ["G", "B"], ["G", "B", "C"], ["G", "B", "C", "Cm"]),
    ]

    seq_counts = {}
    for seq in sequences:
        counts = []
        prev_set = None
        for step in seq:
            matches = match_sequence(norm_songs, step)
            counts.append(len(matches))
            cur_set = set(matches)
            if prev_set is not None:
                assert cur_set.issubset(prev_set), f"Non-monotonic match at {step}"
            prev_set = cur_set
        assert counts[0] > counts[1] >= counts[2] >= counts[3] >= 1, (
            f"Expected monotonic narrowing >=1 for {seq}, got {counts}"
        )
        seq_counts[" -> ".join(seq[-1])] = counts
        print(f"[PASS] Narrowing {seq[-1]}: {' -> '.join(str(c) for c in counts)}")

    assert seq_counts["C -> G -> Am -> F"] == seq_counts["D -> A -> Bm -> G"], (
        "Transposed I-V-vi-IV patterns must yield identical pattern counts"
    )
    print(f"[PASS] Song database validated: {len(song_db)} unique songs, monotonic narrowing verified.")


def main():
    html, script_srcs = verify_http_and_html()
    verify_dom_and_syntax(html, script_srcs)
    verify_song_db_and_narrowing()
    print("ALL VERIFICATION CHECKS PASSED")


if __name__ == "__main__":
    main()
