@echo off
REM Para e remove todos os containers
echo.
echo ==================================================
echo  🛑 Parando Lume Application
echo ==================================================
echo.

docker-compose down

echo.
echo ✅ Containers parados e removidos
pause
