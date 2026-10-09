# Changelog

All notable changes to Keygrid. Newest first.

## 1.1.1 (2026-10-09)

### Fixed
- **Better tempo detection for live and fast music.** Rock, punk and drum & bass were often read at half speed, and some live recordings could come out at an unrelated tempo (for example a ~175 BPM rock track read as 116). Keygrid now finds the main pulse using the weight of the kick and snare, and only doubles or halves it when the drums or percussion actually play that level. Hip-hop, trap, reggaeton, house and ballads keep their correct tempos. Thanks to Pedro Uribe for the report.

## 1.1.0 (2026-10-08)

### Added
- **Keygrid for Windows.** A Windows installer (64-bit, Windows 10 and 11) is now available next to the Mac download, with every feature from the Mac app, including Keep on top.
- A feedback email address in the app, under How it works.

## 1.0.3 (2026-10-08)

### Changed
- The ½× / 1× / 2× tempo buttons now work before you import a beat. Your choice is applied as soon as a track comes in, and Keygrid remembers it the next time you open the app.
- The piano is playable before you import a beat. Play scale and Play chord turn on once a key is detected.

## 1.0.2 (2026-10-08)

### Changed
- Keygrid now opens with an empty card instead of example data. Every value shows "—", the piano is unlit and playback is off until you drop in a beat, so it's clear nothing has been analyzed yet.

## 1.0.1 (2026-10-08)

### Added
- Credits for the fonts, the Tauri framework, the 283 open-source libraries inside the app and the research behind the analysis, with full license texts in THIRD-PARTY-NOTICES.md (also included inside the app).
- A copyright footer and a note that Keygrid isn't affiliated with Valhalla DSP, Avid, Antares, Celemony or Mixed In Key.
- Copyright details in the app's Get Info window.

### Fixed
- Links inside the Mac app now open in your default browser.

## 1.0.0 (2026-10-08)

First Mac release.

- BPM to four decimal places, measured by fitting every beat across the whole track, with a steady / variable tempo check and ½× / 2× buttons.
- Key and relative key with Open Key codes, a match-strength rating and tuning offset.
- Notes tab: a two-octave piano with the key's notes highlighted, Play scale and Play chord, note-strength chart and compatible keys.
- Reverb tab: ValhallaVintageVerb vocal settings (PreDelay, Decay, Mix, Size, High Cut, Low Cut) timed to the BPM, with straight, dotted and triplet feels.
- Delay tab: vocal delay times in milliseconds for every common note value.
- Health tab: peak level, clipping, loudness (LUFS), dynamics and mono compatibility.
- Play with click, to check the BPM by ear against the beat, with live ½× / 2× switching.
- Previous: a searchable list of every song you've analyzed, saved on your Mac, with Copy list for invoices.
- Copy results: copies "Name | BPM | Key" for the current track.
- Drop audio anywhere on the window, and Keep on top to float Keygrid over your DAW.
- Runs on Apple Silicon and Intel Macs (macOS 11 or newer). Your audio never leaves your computer.
