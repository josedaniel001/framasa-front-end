@echo off
REM Script para construir y publicar la imagen Docker (Windows)

setlocal enabledelayedexpansion

set DOCKER_USER=%DOCKER_USER%
if "%DOCKER_USER%"=="" set DOCKER_USER=tu-usuario

set IMAGE_NAME=%IMAGE_NAME%
if "%IMAGE_NAME%"=="" set IMAGE_NAME=framasa-erp

set VERSION=%VERSION%
if "%VERSION%"=="" set VERSION=latest

echo === Construccion de imagen Docker para FRAMASA ERP ===
echo.

REM Verificar si Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker no esta instalado
    exit /b 1
)

REM Construir la imagen
echo Construyendo imagen...
docker build -t %DOCKER_USER%/%IMAGE_NAME%:%VERSION% .

REM Etiquetar como latest si no es la versión latest
if not "%VERSION%"=="latest" (
    docker tag %DOCKER_USER%/%IMAGE_NAME%:%VERSION% %DOCKER_USER%/%IMAGE_NAME%:latest
)

echo.
echo [OK] Imagen construida exitosamente
echo Imagen: %DOCKER_USER%/%IMAGE_NAME%:%VERSION%
echo.
set /p PUBLISH="¿Deseas publicar la imagen en Docker Hub? (s/n): "

if /i "%PUBLISH%"=="s" (
    echo.
    echo Publicando imagen en Docker Hub...
    docker push %DOCKER_USER%/%IMAGE_NAME%:%VERSION%
    
    if not "%VERSION%"=="latest" (
        docker push %DOCKER_USER%/%IMAGE_NAME%:latest
    )
    
    echo.
    echo [OK] Imagen publicada exitosamente en Docker Hub
    echo Los clientes pueden usar: docker-compose -f docker-compose.prod.yml up -d
)

echo.
echo [OK] Proceso completado

