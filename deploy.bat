@echo off
chcp 65001 >nul
echo ========================================
echo   GitHub Pages 部署脚本
echo ========================================
echo.

echo [1/4] 清理旧的构建文件...
if exist dist (
    rmdir /s /q dist
    echo ✓ 清理完成
) else (
    echo ℹ 无需清理
)
echo.

echo [2/4] 安装依赖...
call npm install
if errorlevel 1 (
    echo ✗ 依赖安装失败
    pause
    exit /b 1
)
echo ✓ 依赖安装完成
echo.

echo [3/4] 构建项目...
call npm run build
if errorlevel 1 (
    echo ✗ 构建失败
    pause
    exit /b 1
)
echo ✓ 构建完成
echo.

echo [4/4] 部署到 GitHub Pages...
call npx gh-pages -d dist
if errorlevel 1 (
    echo ✗ 部署失败
    echo.
    echo 提示：请确保已安装 gh-pages: npm install -D gh-pages
    pause
    exit /b 1
)
echo ✓ 部署完成
echo.

echo ========================================
echo   🎉 部署成功！
echo   访问地址: https://lovemyfamilyfovever.github.io/subtitle_extractor/
echo   (可能需要等待 1-2 分钟生效)
echo ========================================
pause
