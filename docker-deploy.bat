@echo off
REM Script para despliegue rápido de FRAMASA ERP con Docker (Windows)
REM Uso: docker-deploy.bat [dev|prod|build|stop|logs|restart|clean|help]

setlocal enabledelayedexpansion

set COMMAND=%1
if "%COMMAND%"=="" set COMMAND=help

if "%COMMAND%"=="help" goto :show_help
if "%COMMAND%"=="--help" goto :show_help
if "%COMMAND%"=="-h" goto :show_help

REM Verificar Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker no esta instalado
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker no esta corriendo
    exit /b 1
)

if "%COMMAND%"=="dev" goto :deploy_dev
if "%COMMAND%"=="prod" goto :deploy_prod
if "%COMMAND%"=="build" goto :build_image
if "%COMMAND%"=="stop" goto :stop_containers
if "%COMMAND%"=="logs" goto :show_logs
if "%COMMAND%"=="restart" goto :restart_containers
if "%COMMAND%"=="clean" goto :clean_all

echo Comando desconocido: %COMMAND%
echo.
goto :show_help

:show_help
echo === Script de Despliegue FRAMASA ERP ===
echo.
echo Uso: docker-deploy.bat [comando] [opciones]
echo.
echo Comandos:
echo   dev          Desplegar en modo desarrollo (construye imagen)
echo   prod         Desplegar en modo produccion (usa imagen de Docker Hub)
echo   build        Solo construir la imagen
echo   stop         Detener contenedores
echo   logs         Ver logs
echo   restart      Reiniciar contenedores
echo   clean        Limpiar contenedores, imagenes y volumenes
echo   help         Mostrar esta ayuda
echo.
echo Ejemplos:
echo   docker-deploy.bat dev
echo   docker-deploy.bat prod
echo   docker-deploy.bat logs
exit /b 0

:deploy_dev
echo === Desplegando en modo DESARROLLO ===
echo.
if not exist .env (
    if exist env.example (
        set /p COPY_ENV="No se encontro .env. ¿Copiar env.example a .env? (s/n): "
        if /i "!COPY_ENV!"=="s" (
            copy env.example .env
            echo [OK] Archivo .env creado. Por favor editelo con sus valores.
        )
    )
)
docker-compose up -d --build
echo.
echo [OK] Aplicacion desplegada en modo desarrollo
echo Accede a: http://localhost:3000
echo.
echo Para ver logs: docker-compose logs -f
exit /b 0

:deploy_prod
echo === Desplegando en modo PRODUCCION ===
echo.
if not exist .env (
    if exist env.example (
        set /p COPY_ENV="No se encontro .env. ¿Copiar env.example a .env? (s/n): "
        if /i "!COPY_ENV!"=="s" (
            copy env.example .env
            echo [OK] Archivo .env creado. Por favor editelo con sus valores.
        )
    )
)
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
echo.
echo [OK] Aplicacion desplegada en modo produccion
echo Accede a: http://localhost:3000
echo.
echo Para ver logs: docker-compose -f docker-compose.prod.yml logs -f
exit /b 0

:build_image
echo === Construyendo imagen ===
echo.
docker-compose build
echo.
echo [OK] Imagen construida
exit /b 0

:stop_containers
echo Deteniendo contenedores...
docker-compose down 2>nul
docker-compose -f docker-compose.prod.yml down 2>nul
echo [OK] Contenedores detenidos
exit /b 0

:show_logs
docker-compose ps 2>nul | findstr "framasa-erp-app" >nul
if not errorlevel 1 (
    docker-compose logs -f
    exit /b 0
)
docker-compose -f docker-compose.prod.yml ps 2>nul | findstr "framasa-erp-app" >nul
if not errorlevel 1 (
    docker-compose -f docker-compose.prod.yml logs -f
    exit /b 0
)
echo No hay contenedores corriendo
exit /b 0

:restart_containers
echo Reiniciando contenedores...
docker-compose ps 2>nul | findstr "framasa-erp-app" >nul
if not errorlevel 1 (
    docker-compose restart
    echo [OK] Contenedores reiniciados
    exit /b 0
)
docker-compose -f docker-compose.prod.yml ps 2>nul | findstr "framasa-erp-app" >nul
if not errorlevel 1 (
    docker-compose -f docker-compose.prod.yml restart
    echo [OK] Contenedores reiniciados
    exit /b 0
)
echo No hay contenedores corriendo
exit /b 0

:clean_all
echo [ADVERTENCIA] Esto eliminara contenedores, imagenes y volumenes
set /p CONFIRM="¿Esta seguro? (s/n): "
if /i not "!CONFIRM!"=="s" (
    echo Operacion cancelada
    exit /b 0
)
echo Limpiando...
docker-compose down -v --rmi all 2>nul
docker-compose -f docker-compose.prod.yml down -v 2>nul
echo [OK] Limpieza completada
exit /b 0


