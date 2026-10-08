# FAQ

### Why does my 174 BPM beat say 87?

Half-time and double-time versions of a beat have kicks and snares in the same places, so any BPM detector can pick the wrong level. Press **2×** (or **½×**) on the tempo tile. To fix it for every track, set **BPM range** at the top of the window, for example to 90–180 for fast beats. See [[Using Keygrid#tempo]].

### How accurate is the BPM?

For beats made in a DAW, Keygrid is usually within a few thousandths of a BPM. The **±** number shows the precision for each track. For live recordings with a drifting tempo, Keygrid shows **Variable tempo** and the BPM is an average.

### Why does it say A minor when I think it's C major?

A minor and C major use exactly the same notes. They're relative keys, and they're the most common mix-up for any key detector. Keygrid always shows the relative key next to the main result. If the song feels brighter, use the major key. If it feels darker, use the minor one.

### What if the key looks completely wrong?

Check the match rating on the Key tile. **Ambiguous** means the beat doesn't point clearly to one key, which is common with sparse beats, heavy 808s or songs that change key. Play the chord or scale on the **Notes** tab over the beat to check by ear, and look at **Next closest** for other likely keys. If a key is clearly wrong, please [report it](https://github.com/ChrisCollins24/Keygrid/issues/new?template=bug_report.yml).

### What do the Open Key codes mean?

They're a simple way to see which keys mix well. Each key gets a number from 1 to 12 plus **d** (major) or **m** (minor). Keys with the same number, or numbers next to each other, sound good together.

### The Health tab says "Mastered" or "No headroom". What should I do?

The beat is already loud, which is common when producers send finished beats. Turn the beat down a few dB in your session before recording, so the vocal has room to sit on top and nothing clips in your mix.

### What does "Crushed" mean?

There's very little difference between the loudest peaks and the average level, so the beat has been heavily compressed or limited. It can sound flat, and there's less room for the vocal to stand out.

### What does "Phase problem" mean?

Parts of the beat cancel out when the left and right channels are combined, which happens on phone speakers and some club systems. Some sounds may get quieter or disappear in mono. Let the producer know, or check the beat with your DAW's mono button.

### Do I have to use ValhallaVintageVerb?

No. Any reverb with pre-delay and decay controls works: copy the PreDelay and Decay times. The Mode, Size and Color values are specific to ValhallaVintageVerb.

### Does Keygrid upload my audio?

No. Everything is analyzed on your computer. Keygrid doesn't collect data or send anything over the internet.

### Is there a Windows version?

Yes. Keygrid runs on 64-bit Windows 10 and 11. Download the `setup.exe` from the [latest release](https://github.com/ChrisCollins24/Keygrid/releases/latest). There's also a [browser version](https://keygridapp.github.io/app/) that works on any computer.

### Is Keygrid free?

Yes.

### How do I suggest a feature?

Post it in [Discussions → Ideas](https://github.com/ChrisCollins24/Keygrid/discussions/categories/ideas) or email **keygridapp@gmail.com**.
