@echo off
echo Building project...
call npm run build
if %errorlevel% equ 0 (
    echo Build successful!
) else (
    echo Build failed!
    pause
)

