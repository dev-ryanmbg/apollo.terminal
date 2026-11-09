@echo off
title Iniciar Apollo
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Iniciar-Apollo.ps1"
if errorlevel 1 pause
