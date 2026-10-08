# Installing and updating

Keygrid runs on:

- **Mac:** Apple Silicon (M1, M2, M3, M4) or Intel, macOS 11 (Big Sur) or newer
- **Windows:** 64-bit Windows 10 or 11
- **Any browser:** [keygridapp.github.io/app](https://keygridapp.github.io/app/), no install needed

# Mac

## Install on Mac

1. Go to the [latest release](https://github.com/ChrisCollins24/Keygrid/releases/latest) and click the **.dmg** file under **Assets** to download it.
2. Open the downloaded .dmg. A window shows Keygrid and your Applications folder.
3. Drag **Keygrid** onto **Applications**.
4. Open Keygrid from Applications or Launchpad.

## The first time you open it

Keygrid isn't signed with a paid Apple Developer account yet, so macOS blocks it the first time. This happens once per Mac.

**macOS 15 (Sequoia) or newer**
1. Open Keygrid. When macOS says it can't be opened, click **Done**.
2. Open **System Settings → Privacy & Security**.
3. Scroll down and click **Open Anyway** next to the Keygrid message.
4. Enter your Mac password if asked, then click **Open**.

**macOS 14 (Sonoma) or older**
1. In Applications, right-click (or Control-click) **Keygrid** and choose **Open**.
2. Click **Open** in the message that appears.

After that, Keygrid opens normally.

If macOS says Keygrid "is damaged and can't be opened", see [[Troubleshooting]].

## Update on Mac

1. Download the new .dmg from the [latest release](https://github.com/ChrisCollins24/Keygrid/releases/latest).
2. Quit Keygrid if it's open.
3. Drag the new Keygrid onto Applications and choose **Replace**.

Your **Previous** song history is kept when you update. You may need to do the **Open Anyway** step again for the new version.

See what changed in each version in the [changelog](https://github.com/ChrisCollins24/Keygrid/blob/main/CHANGELOG.md).

## Move your history to another computer

Your song history is saved in one file.

On Mac:

```
~/Library/Application Support/com.keygrid.analyzer/history.json
```

To open that folder, in Finder choose **Go → Go to Folder…**, paste the path above without `history.json`, and press Return. On Windows:

```
%APPDATA%\com.keygrid.analyzer\history.json
```

To open that folder, press **Windows + R**, paste `%APPDATA%\com.keygrid.analyzer` and press Enter.

Copy `history.json` into the same folder on the other computer (open Keygrid there once first so the folder exists), then reopen Keygrid. It works between Mac and Windows too.

# Windows

## Install on Windows

1. Go to the [latest release](https://github.com/ChrisCollins24/Keygrid/releases/latest) and click the **setup.exe** file under **Assets** to download it.
2. Open the downloaded file.
3. Keygrid isn't signed with a paid code-signing certificate yet, so Windows may show **"Windows protected your PC"**. Click **More info**, then **Run anyway**. This happens once.
4. Follow the installer. No administrator password is needed.
5. Open Keygrid from the **Start menu**.

Keygrid uses Microsoft Edge WebView2, which is already built into Windows 10 and 11. If it's missing, the installer downloads it automatically.

## Update on Windows

Download and run the new **setup.exe**. It replaces the old version and keeps your **Previous** history.

## Uninstall on Windows

Open **Settings → Apps → Installed apps**, find **Keygrid**, and choose **Uninstall**. To also delete your song history, delete the `%APPDATA%\com.keygrid.analyzer` folder.

# Uninstalling

## Uninstall on Mac

1. Drag **Keygrid** from Applications to the Trash.
2. To also delete your song history, delete the `com.keygrid.analyzer` folder from `~/Library/Application Support/`.
