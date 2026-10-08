# Troubleshooting

### "Keygrid can't be opened" or "Apple could not verify Keygrid"

This is expected the first time, because Keygrid isn't signed with a paid Apple Developer account yet. Follow the **Open Anyway** steps in [[Installing and Updating#the-first-time-you-open-it]].

### "Keygrid is damaged and can't be opened"

Keygrid isn't actually damaged. macOS shows this for some downloaded apps that aren't signed. Open **Terminal** (Applications → Utilities), paste this line and press Return:

```
xattr -dr com.apple.quarantine /Applications/Keygrid.app
```

Then open Keygrid again.

### My file won't load

- Check the file plays in Finder (select it and press Space).
- WAV, MP3, AIFF and M4A work best. If a FLAC or OGG file won't load, convert it to WAV and try again.
- Make sure the file is fully downloaded and not still syncing from iCloud or Google Drive.

### There's no sound from Play with click, the piano or Play chord

- Check your Mac's volume and output device (System Settings → Sound → Output).
- If you use an audio interface, make sure it's the selected output and its monitor level is up.
- Quit and reopen Keygrid.

### The BPM is half or double what I expect

See [[FAQ#why-does-my-174-bpm-beat-say-87]].

### My Previous list is empty after updating

Your history is stored separately from the app, so updating shouldn't remove it. Make sure you replaced Keygrid in Applications instead of running it from the .dmg window. If your history is still missing, see [[Installing and Updating#move-your-history-to-another-mac]] for where the file lives.

### Keep on top doesn't stay on top of full-screen apps

macOS doesn't allow windows to float over apps in full-screen mode. Use Pro Tools in a normal or maximized window instead.

### Something else isn't working

[Open a bug report](https://github.com/ChrisCollins24/KeyGrid/issues/new?template=bug_report.yml) with your Keygrid version, macOS version and what happened, or email **keygridapp@gmail.com**.
