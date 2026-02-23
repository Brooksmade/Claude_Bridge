@echo off
title Bridge to Fig Server
cd /d "%~dp0bridge-server"
echo Starting Bridge to Fig Server...
npx tsx src/index.ts
pause
