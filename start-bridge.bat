@echo off
title Figma Claude Bridge Server
cd /d "%~dp0bridge-server"
echo Starting Figma Claude Bridge Server...
npx tsx src/index.ts
pause
