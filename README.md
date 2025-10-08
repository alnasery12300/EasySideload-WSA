[![Github All Releases](https://img.shields.io/github/downloads/HarshalKudale/EasySideload-WSA/total.svg)]()

# EasySideload-WSA

Exe files are officially removed due to lot of issue( will be back once I manage to fix them)
Also now you can run fixer.bat(one time) if other 3 bat files give you error.

Note
- Always keep fixer.bat,adb.exe and AdbWinApi.dll in same folder.
- Other 3 bat files can run from any location.


#Updated files
**Now you dont need to donwload platform-tools**

Functionalities -
1. APK installer
2. File transfer to WSA
3. One clcik WSA settings.

# Tutorial


Download the zip and extract it anywhere.

Run fixer.bat for first time use

Open apk file using installer.bat(right click open with) to install(or just drag and drop apk on bat file)

Open any file using pushtoWSA.bat(right click open with) to transfer to WSA downloads folder(or just drag and drop any file on bat file)

Open WSAsettings.bat file to open WSA settings.

## Web Player (Beta)

A simple HTML5 player is available in the `web/` directory for watching tutorial videos without the "No playable sources found" error shown by older embeds. The player reads its configuration from `web/player-config.json` and automatically selects the first playable source, falling back to HLS.js when the browser does not support HLS natively. Update the configuration file with your own MP4, HLS (`.m3u8`) or DASH (`.mpd`) sources as required, then host the `web` folder on any static server.
