@echo off
REM Build e inicia todos os containers
echo.
echo ==================================================
echo  🐳 Iniciando Lume Application com Docker Compose
echo ==================================================
echo.

docker-compose up --build

pause
