@echo off
REM Limpa tudo e reconstrói do zero
echo.
echo ==================================================
echo  ⚠️  Limpando e reconstruindo tudo
echo ==================================================
echo.

echo Removendo containers e volumes...
docker-compose down -v

echo.
echo Limpando imagens e cache Docker...
docker system prune -a --volumes -f

echo.
echo ✅ Limpeza concluída
echo.
echo Reconstituindo...
docker-compose up --build

pause
