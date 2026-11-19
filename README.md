# Orbital Fifths — Songwriter & Melody Studio

Interactive Circle of Fifths workstation built for songwriters, composers, and producers across **desktop, tablet, and phone**. Runs 100% offline with zero external dependencies or build steps.

## How to Run

- **Direct Launch (Zero Server Needed)**: Open `index.html` directly in any modern browser (`Chrome`, `Edge`, `Firefox`, `Safari`).
- **One-Click Local Server (Windows)**: Double-click `launch.bat` or run `python server.py` to serve on localhost and auto-open your browser.

## Core Capabilities

- **Automatic Phone, Tablet & Desktop Scaling**:
  - Sticky bottom mobile workspace & transport bar (`Wheel`, `Songs` with live match count badge, `Play`, `Melody`, `Tools`), collapsible mobile header drawer, live compact song-narrowing & next-chord prediction bar right below the progression strip, touch-sized `1 Oct` / `2 Oct` lead keyboard, sticky piano-roll note labels, and mobile bottom-sheet Chord Spice editor.
- **36-Wedge Interactive SVG Circle of Fifths**:
  - Major outer ring, relative minor middle ring, diminished inner ring, and **clickable outer key-signature bezel arcs** to switch the tonic key instantly.
  - Dynamic 7-chord diatonic harmonic window, next-chord gravity halos, live progression constellation arcs with **numbered step badges**, scroll-safe mobile touch taps (`> 12px` drag scrolls cleanly without accidental triggers), and `420ms` touch long-press (or `Shift+Click` / Right-Click) to audition chords without appending.
- **Expanded Zero-Latency Web Audio Synthesis**:
  - **6 polyphonic instruments**: Felt Piano, Rhodes EP, Acoustic Guitar, Warm Synth, Drawbar Rotary Organ, and 80s Analog Pluck.
  - **8 backing grooves**: Pop/Rock, 4-On-Floor, Half-Time, Lo-Fi Boom-Bap, 50s/60s Shuffle, Latin/Bossa, Acoustic Pulse, and Chords Only, plus **Root vs. Octave bass feel**, stereo velvet-noise reverb, smart voice-leading inversions, Block/Strum/Arpeggio modes, and a live HiDPI spectrum/waveform visualizer.
- **Progressive Hit Song Matcher (9,505 Songs, 1900s–2020s)**:
  - 9,505 unique real popular songs spanning the early 1900s through the 2020s (including 8,485 songs from the 1950s onward) across Pop, Rock, Indie, R&B/Soul, Folk/Country, Jazz/Standards, Electronic, and Blues/Classic R&B.
  - Filter by **Era/Decade**, **Genre**, **Sort Order** (`Top Hits`, `Oldest`, `Newest`), or **Exact Key vs. Transposed Pattern**. As you press chord combinations, matches monotonically narrow down with interactive "Where Hit Songs Go Next" chips, `Show 50 More Songs` pagination, and one-click preview/load.
- **Songwriter Workbench**:
  - **14 Instant Progression Recipes** (`✦ Recipes` modal) automatically realized in your active tonic key and mode.
  - **Global Semitone Transposition** (`♭ -1` / `♯ +1`), **40-step Undo/Redo** (`Ctrl+Z` / `Ctrl+Y`), and chord **Move Left / Move Right / Duplicate** controls in the Chord Spice popover.
  - **Playable Scale & Pentatonic Hook Notes** bar + **Clickable Piano & 6-String Guitar Voicing Diagrams** that strum/audition on tap, plus ranked Guitar Capo recommendations.
  - **Multi-Section Arrangement**: Verse, Pre-Chorus, Chorus, Bridge + full arrangement chain playback and contrasting section suggestions.
  - **Chord-Aware Piano Roll & Touch Keyboard**: Highlights chord tones vs. in-key scale notes per bar, with 4 smart melody generators (`Pop Hook`, `Lyrical Verse`, `Indie Arp`, `Soul R&B`) and variation mutation.
  - **Lyrics & Meter**: Per-line syllable counter and automatic end-word rhyme group badges.
  - **Serverless Shareable Song URLs & Studio Exports**: `🔗 Share` encodes key, mode, BPM, sections, melody, and lyrics into `#s=<base64url>` links, alongside Standard `.mid` (Format 1 MIDI), `.wav` (OfflineAudioContext 16-bit PCM render), and printable Songwriter Lead Sheet export.

## Keyboard & Touch Shortcuts

- `Space`: Play / Stop active loop
- `Ctrl+Z` / `Ctrl+Y` (or `Ctrl+Shift+Z`): Undo / Redo edit
- `Backspace`: Undo / remove last chord
- `Shift+Click`, Right-Click, or `420ms` Touch Long-Press on wheel: Audition chord without appending
- `Esc`: Close popover / modal or clear current combo
- `A W S E D F T G Y H U J K O L P ; '`: Play live 2-octave lead melody keyboard

## Verification

Run the automated test suite:

```sh
python tests/verify_app.py
```
