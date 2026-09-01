@echo off
chcp 65001 >nul
echo =======================================================
echo   🐱 猫猫游戏屋 · 一键推送部署到 GitHub
echo =======================================================
echo.
echo [1/3] 检查本地代码提交状态...
git add .
git commit -m 'feat: 🐱 更新猫猫游戏屋最新电脑端与全套游戏' 2>nul

echo.
echo [2/3] 正在推送到 GitHub 仓库 (https://github.com/Yuliyouyong/cat-gamehouse)...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo =======================================================
    echo   🎉 推送成功！
    echo.
    echo   请在 GitHub 仓库开启 Pages 免费在线网站：
    echo   1. 打开 https://github.com/Yuliyouyong/cat-gamehouse/settings/pages
    echo   2. 在 Build and deployment 的 Branch 选择 'main'，文件夹选 '/ (root)'，点击 Save
    echo   3. 稍等 1-2 分钟，即可通过以下链接在线玩：
    echo.
    echo   🖥️ 电脑端在线链接: https://Yuliyouyong.github.io/cat-gamehouse/
    echo   📱 手机端在线链接: https://Yuliyouyong.github.io/cat-gamehouse/mobile/
    echo =======================================================
) else (
    echo.
    echo [提示] 如果提示 Repository not found，请先在 GitHub (https://github.com/new) 
    echo 新建一个名为 'cat-gamehouse' 的公开公开仓库 (Public)，然后再双击本脚本即可！
)
echo.
pause
