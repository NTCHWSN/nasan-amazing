# Universal app package

This project now has two ready-to-use release forms:

1. Android APK
   - `android-apk-wrapper/dist/nasan-amazing-v1.0.0.apk`
   - Use this when a platform requires `.apk`.

2. Universal Web/PWA
   - `universal-dist/nasan-amazing-universal-pwa-v1.0.0.zip`
   - Upload the contents of this zip to any HTTPS web hosting.
   - Works on iOS, Android, Windows, macOS, Linux, and Chromebooks through a browser.
   - Can be installed to the home screen from Safari on iOS and from Chrome/Edge on Android and desktop.

Important notes:

- iOS cannot install an APK. The practical cross-platform route is the PWA/web app.
- For PWA install and offline caching, host it over HTTPS. Localhost also works for testing.
- The game still works as a normal browser app even without installing.
- Keep `android-apk-wrapper/dist/nasan-amazing-release.jks` for future Android APK updates.
