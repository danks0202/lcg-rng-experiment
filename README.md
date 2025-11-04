# Eksperimen Bilangan Acak LCG

Proyek ini adalah aplikasi Android offline (WebView) untuk eksperimen dan analisis PRNG tipe LCG.
Aplikasi berbahasa Indonesia dan menggunakan tampilan gelap elegan.

## Cara cepat (tanpa Android Studio) — GitHub Actions
1. Buat repository baru di GitHub (mis. `lcg-rng-experiment`) dan upload seluruh isi ZIP proyek ini.
2. Setelah push ke branch `main`, buka tab **Actions**. Workflow `Build Android APK` akan berjalan otomatis.
3. Setelah selesai, download artifact `app-debug-apk` dari run tersebut. File APK berada di `app-debug.apk`.
4. Install di Android (aktifkan install from unknown sources bila perlu).

## Build secara lokal (opsional)
- Butuh: JDK 17, Android SDK command-line tools.
- Jalankan: `./gradlew assembleDebug` di folder proyek.

## Catatan
- Aplikasi untuk tujuan edukasi dan tugas sekolah. Jangan gunakan untuk tujuan curang.
- Semua fitur berjalan offline (tidak membutuhkan internet).
