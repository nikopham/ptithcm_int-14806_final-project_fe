# Hướng dẫn xử lý lỗi Build

## Vấn đề: Không thể chạy `npm run build` trong CMD

### Nguyên nhân chính:

1. **PowerShell Execution Policy**: Bạn đang chạy trong PowerShell thay vì CMD
2. **Cấu hình Vite**: Đã sửa `minify: 'terser'` thành `minify: 'esbuild'`

## Giải pháp:

### Cách 1: Sử dụng CMD (Command Prompt)

1. Mở **Command Prompt** (CMD) - KHÔNG phải PowerShell
   - Nhấn `Win + R`
   - Gõ `cmd` và Enter
   - Hoặc tìm "Command Prompt" trong Start Menu

2. Navigate đến thư mục dự án:
```cmd
cd C:\Users\user\Documents\final\movie-streaming-web
```

3. Chạy build:
```cmd
npm run build
```

### Cách 2: Sử dụng Git Bash

1. Mở Git Bash
2. Navigate đến thư mục dự án
3. Chạy: `npm run build`

### Cách 3: Sử dụng file batch script

Đã tạo file `build.bat` - chỉ cần double-click vào file này trong Windows Explorer.

### Cách 4: Sửa PowerShell Execution Policy (Không khuyến nghị)

Nếu muốn dùng PowerShell, chạy lệnh sau với quyền Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Lưu ý**: Cách này có thể gây rủi ro bảo mật.

## Kiểm tra lỗi build

Nếu vẫn gặp lỗi sau khi chạy trong CMD, kiểm tra:

1. **TypeScript errors**: Chạy `tsc --noEmit` để kiểm tra lỗi TypeScript
2. **Missing dependencies**: Chạy `npm install` để cài đặt lại dependencies
3. **Node version**: Đảm bảo đang dùng Node.js phiên bản 18+ 

## Lệnh build đã được sửa

File `vite.config.ts` đã được cập nhật:
- Đổi `minify: 'terser'` → `minify: 'esbuild'` (không cần cài thêm package)

## Scripts có sẵn

- `npm run build` - Build production
- `npm run dev` - Chạy development server
- `npm run cap:build:android` - Build + sync + mở Android Studio

