# Orbital Fifths — Songwriter & Melody Studio

Interactive Circle of Fifths workstation built for songwriters, composers, and producers. Runs 100% offline with zero external dependencies or build steps.

## How to Run

- **Direct Launch (Zero Server Needed)**: Open `index.html` directly in any modern browser (`Chrome`, `Edge`, `Firefox`, `Safari`).
- **One-Click Local Server (Windows)**: Double-click `launch.bat` or run `python server.py` to serve on localhost and auto-open your browser.

## Core Capabilities

- **36-Wedge Custom SVG Circle of Fifths**: Major outer ring, relative minor middle ring, diminished inner ring, key signature outer bezel, dynamic 7-chord diatonic harmonic window, next-chord gravity halos, and live progression constellation arcs.
- **Zero-Latency Web Audio Synthesis**: Procedural polyphonic Felt Piano, Rhodes EP, Acoustic Guitar, and Warm Synth voices with stereo velvet-noise reverb, smart voice-leading inversions, Block/Strum/Arpeggio modes, 6 drum grooves, and a live HiDPI spectrum/waveform visualizer.
- **Progressive Hit Song Matcher**: 9,505 real popular songs spanning the early 1900s through the 2020s (with deep coverage from the 1950s onward) across Pop, Rock, Indie, R&B/Soul, Folk/Country, Jazz/Standards, Electronic, and Blues/Classic R&B. Filter by Era/Decade, Genre, Exact Key vs. Transposed Pattern, or Sort Order (`Top Hits`, `Oldest`, `Newest`). As you press chord combinations, matches monotonically narrow down with "Where Hit Songs Go Next" chips and one-click song preview/load.
- **Songwriter Workbench**:
  - **Multi-Section Arrangement**: Verse, Pre-Chorus, Chorus, Bridge + full arrangement chain playback and contrasting section suggestions.
  - **Chord Spice / Reharmonization**: Instant extensions (`maj7`, `m7`, `7`, `sus2`, `sus4`, `add9`, `9`, `6`), slash bass inversions, modal swaps, secondary dominants, and tritone substitutions.
  - **Chord-Aware Piano Roll & 2-Octave Keyboard**: Highlights chord tones vs. in-key scale notes per bar, with 4 smart melody generators (`Pop Hook`, `Lyrical Verse`, `Indie Arp`, `Soul R&B`) and variation mutation.
  - **Voicings & Guitar Capo Lab**: Live piano & 6-string guitar chord diagrams plus ranked Guitar Capo recommendations.
  - **Lyrics & Meter**: Per-line syllable counter and automatic end-word rhyme group badges.
  - **Studio Exports**: Standard `.mid` (Format 1 MIDI), `.wav` (OfflineAudioContext 16-bit PCM render), and printable Songwriter Lead Sheet.

## Keyboard Shortcuts

- `Space`: Play / Stop active loop
- `Backspace`: Undo last chord
- `Esc`: Close popover or clear current combo
- `A W S E D F T G Y H U J K O L P ; '`: Play live 2-octave lead melody keyboard

## Verification

Run the automated test suite:

```sh
python tests/verify_app.py
```
