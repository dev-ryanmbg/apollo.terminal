@echo off
title Apollo Terminal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\iniciar\Iniciar-Apollo.ps1" -Terminal
if errorlevel 1 pause
