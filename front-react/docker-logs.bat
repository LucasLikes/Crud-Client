@echo off
REM Visualiza logs dos containers
echo.
echo ==================================================
echo  📊 Logs da Aplicação
echo ==================================================
echo.

docker-compose logs -f

pause
