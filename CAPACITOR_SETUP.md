# Hướng dẫn Setup Capacitor và Build APK

## Bước 1: Cài đặt Capacitor

Chạy các lệnh sau trong terminal:

```bash
npm install @capacitor/cli @capacitor/core
npm install @capacitor/android
```

## Bước 2: Khởi tạo Capacitor (Nếu chưa có config)

Nếu file `capacitor.config.json` đã tồn tại, bỏ qua bước này và chuyển sang Bước 3.

Nếu chưa có, chạy:

```bash
npx cap init
```

Khi được hỏi:
- **App name**: Streamify
- **App ID**: com.streamify.app
- **Web dir**: dist

**Lưu ý**: File `capacitor.config.json` đã được tạo sẵn với cấu hình đúng, bạn có thể bỏ qua bước init và chuyển sang Bước 3.

## Bước 3: Build Web App

```bash
npm run build
```

## Bước 4: Sync với Android

```bash
npx cap sync android
```

## Bước 5: Mở Android Studio

```bash
npx cap open android
```

## Bước 6: Build APK trong Android Studio

1. Mở Android Studio (từ lệnh trên hoặc mở thủ công)
2. Chờ Gradle sync hoàn tất
3. Vào menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
4. Chờ build xong
5. APK sẽ nằm tại: `android/app/build/outputs/apk/debug/app-debug.apk`

## Build APK Release (để publish)

1. Tạo keystore (nếu chưa có):
```bash
keytool -genkey -v -keystore streamify-release.keystore -alias streamify -keyalg RSA -keysize 2048 -validity 10000
```

2. Cập nhật `android/app/build.gradle` với thông tin keystore

3. Trong Android Studio: **Build > Generate Signed Bundle / APK**

## Scripts đã thêm vào package.json

- `npm run cap:add:android` - Thêm Android platform
- `npm run cap:sync` - Sync code với native platforms
- `npm run cap:open:android` - Mở Android Studio
- `npm run cap:build:android` - Build web + sync + mở Android Studio

## Lưu ý

- Đảm bảo đã cài đặt Java JDK và Android Studio
- Cần Android SDK được cấu hình đúng
- Kiểm tra `capacitor.config.json` để đảm bảo cấu hình đúng
- **Quan trọng**: Nếu gặp lỗi PowerShell execution policy, hãy chạy lệnh trong **CMD** hoặc **Git Bash** thay vì PowerShell

