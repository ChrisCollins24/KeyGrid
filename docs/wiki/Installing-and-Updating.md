# Installing and updating

Keygrid runs on Mac computers with Apple Silicon (M1, M2, M3, M4) or Intel processors, on macOS 11 (Big Sur) or newer.

## Install

1. Go to the [latest release](https://github.com/ChrisCollins24/KeyGrid/releases/latest) and click the **.dmg** file under **Assets** to download it.
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

## Update to a new version

1. Download the new .dmg from the [latest release](https://github.com/ChrisCollins24/KeyGrid/releases/latest).
2. Quit Keygrid if it's open.
3. Drag the new Keygrid onto Applications and choose **Replace**.

Your **Previous** song history is kept when you update. You may need to do the **Open Anyway** step again for the new version.

See what changed in each version in the [changelog](https://github.com/ChrisCollins24/KeyGrid/blob/main/CHANGELOG.md).

## Move your history to another Mac

Your song history is saved in one file:

```
~/Library/Application Support/com.keygrid.analyzer/history.json
```

To open that folder, in Finder choose **Go → Go to Folder…**, paste the path above without `history.json`, and press Return. Copy `history.json` into the same folder on the other Mac (open Keygrid there once first so the folder exists), then reopen Keygrid.

## Uninstall

1. Drag **Keygrid** from Applications to the Trash.
2. To also delete your song history, delete the `com.keygrid.analyzer` folder from `~/Library/Application Support/`.
