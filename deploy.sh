#!/bin/bash

echo "========================================"
echo "  GitHub Pages 部署脚本"
echo "========================================"
echo ""

# 清理旧的构建文件
echo "[1/4] 清理旧的构建文件..."
if [ -d "dist" ]; then
    rm -rf dist
    echo "✓ 清理完成"
else
    echo "ℹ 无需清理"
fi
echo ""

# 安装依赖
echo "[2/4] 安装依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "✗ 依赖安装失败"
    exit 1
fi
echo "✓ 依赖安装完成"
echo ""

# 构建项目
echo "[3/4] 构建项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "✗ 构建失败"
    exit 1
fi
echo "✓ 构建完成"
echo ""

# 部署到 GitHub Pages
echo "[4/4] 部署到 GitHub Pages..."
npx gh-pages -d dist
if [ $? -ne 0 ]; then
    echo "✗ 部署失败"
    echo ""
    echo "提示：请确保已安装 gh-pages: npm install -D gh-pages"
    exit 1
fi
echo "✓ 部署完成"
echo ""

echo "========================================"
echo "  🎉 部署成功！"
echo "  访问地址: https://lovemyfamilyfovever.github.io/subtitle_extractor/"
echo "  (可能需要等待 1-2 分钟生效)"
echo "========================================"
