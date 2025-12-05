@echo off
echo Limpiando cache del servidor de desarrollo...
echo.
echo 1. Deteniendo servidor actual...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.cmd 2>nul
echo.
echo 2. Limpiando cache de npm...
npm cache clean --force
echo.
echo 3. Eliminando node_modules/.cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo.
echo 4. Eliminando build...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
echo.
echo 5. Reiniciando servidor...
npm start
pause