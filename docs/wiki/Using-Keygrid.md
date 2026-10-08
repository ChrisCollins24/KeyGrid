# Using Keygrid

## Load a beat

Drag an audio file anywhere onto the Keygrid window. The window blurs and shows **Drop tracks here** while you drag. You can also click **Choose files**.

Supported formats: WAV, MP3, AIFF, M4A/AAC, FLAC and OGG. Analysis usually takes a few seconds.

- **Several files at once:** the first file appears on screen. The others are analyzed in the background and saved to **Previous**.
- **Run test track:** analyzes a built-in test beat at exactly 127.985 BPM in E major, so you can see Keygrid working without a file.

Before you load anything, every reading shows **—**.

## Tempo

<img src="https://github.com/ChrisCollins24/Keygrid/raw/main/docs/screenshots/notes.png" width="640" alt="Tempo, key and relative key at the top of the Keygrid window">

The large number is the BPM to four decimal places. Keygrid finds every beat in the track and fits a straight line through all of them, so small timing errors on single beats average out.

| What you see | Meaning |
|---|---|
| **± 0.0005** | How precise the measurement is |
| **nearest 142** | The closest whole BPM |
| **Steady grid** | The beat sits on a fixed tempo, as in most DAW-made beats |
| **Variable tempo** | The tempo drifts, as with a live drummer. The BPM is an average |
| **Weak beat** | The beat is faint or irregular. Treat the BPM as a rough guide |

**½× / 1× / 2×** switch between half, normal and double speed. Use them when Keygrid picks the wrong speed level, for example 87 instead of 174. You can set these before loading a beat, and Keygrid remembers your choice. The Reverb and Delay numbers follow the setting.

**BPM range** at the top of the window does the same thing automatically for every track. For example, set it to 90–180 if you mostly work on fast trap or drill beats. Leave it on **Auto** if you're not sure.

## Key and relative key

The **Key** tile shows the detected key, its Open Key code and how far the track's tuning is from standard A440.

- **Strong / Moderate / Ambiguous match:** how clearly the music points to one key.
- **Open Key codes:** numbers 1 to 12 with **d** for major and **m** for minor. Keys whose numbers are next to each other mix well.

The **Relative key** tile shows the key that uses the same notes with a different center, like F minor and A♭ major. If the two scored almost the same, Keygrid tells you, and you should go with the one that matches how the song feels: darker for minor, brighter for major.

## Notes tab

<img src="https://github.com/ChrisCollins24/Keygrid/raw/main/docs/screenshots/notes.png" width="640" alt="Notes tab with the piano lit up in F minor">

- **Scale notes:** the notes in the key, ready to enter into Auto-Tune or Melodyne.
- **Piano:** notes in the key are light purple and the root note is solid purple. Tap any key to hear it. The piano is tuned to match the track.
- **Play scale / Play chord:** play the key's scale or root chord over the beat to check it by ear. Pressing again restarts it.
- **Note strength:** how much each note appears in the track.
- **Mixes well with:** keys that blend well for transitions, medleys or flipping a hook.
- **Next closest:** the keys that came closest after the main result.

## Reverb tab

<img src="https://github.com/ChrisCollins24/Keygrid/raw/main/docs/screenshots/reverb.png" width="640" alt="Vocal reverb settings timed to the beat">

Vocal reverb settings for **ValhallaVintageVerb**, with PreDelay and Decay timed to the BPM so the reverb fades out with the beat.

| Mode | Decay lasts | Good for |
|---|---|---|
| Ambience | ½ beat | Tight, upfront vocals and rap verses |
| Smooth Room | 1 beat | Verses that need a little space |
| Plate | ½ bar | Polished pop and R&B vocals, hooks |
| Concert Hall | 1 bar | Big choruses, ad-libs, slow songs |

**To use it:** in ValhallaVintageVerb, set **Mode** and **Color: Now**, then copy PreDelay, Decay, Size, High Cut and Low Cut from the row you chose.

- **Mix:** the values shown are for the plugin placed directly on the vocal track. If you use it on an aux/send instead, set Mix to **100%** and control the amount with the send level.
- **Straight / Dotted / Triplet:** lengthen or shorten the timing for swung or triplet-feel beats.

## Delay tab

<img src="https://github.com/ChrisCollins24/Keygrid/raw/main/docs/screenshots/delay.png" width="640" alt="Vocal delay times for every note value">

Delay times in milliseconds for any delay plugin, for 1/2 to 1/32 notes in straight, dotted and triplet timing. The most common vocal delays are marked with a purple dot: **1/4**, **dotted 1/8** and **1/4 triplet**.

A good starting point: Feedback 25%, Mix 15%, High Cut 6 kHz, Low Cut 300 Hz.

## Health tab

<img src="https://github.com/ChrisCollins24/Keygrid/raw/main/docs/screenshots/health.png" width="640" alt="Beat health readings">

A quick check of the beat before you record on it. The dot on the tab is green when everything looks fine and amber when something needs a look.

| Reading | What it measures | Results |
|---|---|---|
| **Peak** | The loudest point, in dBFS | Headroom · Tight · No headroom · Over 0 dB |
| **Clipping** | Places where the waveform is flattened | Clean · Clips |
| **Loudness** | Integrated loudness in LUFS, the streaming standard | Room to mix · Mastered · Slammed |
| **Dynamics** | The gap between peak and loudness | Punchy · Tight · Crushed |
| **Mono check** | How well left and right line up | Mono safe · Very wide · Phase problem |

See the [[FAQ]] for what to do about each warning.

## Check the BPM by ear

**Play with click** plays the beat with a click on every beat. **Jump to end** plays the last 30 seconds. If the click still lines up with the kick at the end of the track, the BPM is locked in. You can switch ½× / 1× / 2× while it plays.

## Previous

<img src="https://github.com/ChrisCollins24/Keygrid/raw/main/docs/screenshots/previous.png" width="640" alt="Previous songs list">

Click **Previous** to see every song you've analyzed with its tempo, key and date.

- **Search** by song name, key or BPM.
- **Copy list** copies the visible rows as a table you can paste into a spreadsheet or invoice.
- **×** removes one song.

## Other buttons

- **Copy results:** copies the current track as one line, like `Late Night Session | 142.0004 | F minor`.
- **Keep on top:** keeps Keygrid floating above other windows, like Pro Tools. Keygrid remembers this setting.
