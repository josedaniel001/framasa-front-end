#!/bin/bash

# Script para despliegue rápido de FRAMASA ERP con Docker
# Uso: ./docker-deploy.sh [dev|prod]

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}=== Script de Despliegue FRAMASA ERP ===${NC}\n"
    echo "Uso: ./docker-deploy.sh [comando] [opciones]"
    echo ""
    echo "Comandos:"
    echo "  dev          Desplegar en modo desarrollo (construye imagen)"
    echo "  prod         Desplegar en modo producción (usa imagen de Docker Hub)"
    echo "  build        Solo construir la imagen"
    echo "  stop         Detener contenedores"
    echo "  logs         Ver logs"
    echo "  restart      Reiniciar contenedores"
    echo "  clean        Limpiar contenedores, imágenes y volúmenes"
    echo "  help         Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./docker-deploy.sh dev"
    echo "  ./docker-deploy.sh prod"
    echo "  ./docker-deploy.sh logs"
}

# Verificar si Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker no está instalado${NC}"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}Error: Docker no está corriendo${NC}"
        exit 1
    fi
}

# Verificar archivo .env
check_env_file() {
    if [ ! -f .env ]; then
        echo -e "${YELLOW}Advertencia: No se encontró archivo .env${NC}"
        if [ -f env.example ]; then
            read -p "¿Deseas copiar env.example a .env? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                cp env.example .env
                echo -e "${GREEN}✓ Archivo .env creado. Por favor edítalo con tus valores.${NC}"
            else
                echo -e "${YELLOW}Continuando sin archivo .env (usando valores por defecto)${NC}"
            fi
        fi
    fi
}

# Desplegar en desarrollo
deploy_dev() {
    echo -e "${BLUE}=== Desplegando en modo DESARROLLO ===${NC}\n"
    check_env_file
    docker-compose up -d --build
    echo -e "\n${GREEN}✓ Aplicación desplegada en modo desarrollo${NC}"
    echo -e "${BLUE}Accede a: http://localhost:${PORT:-3000}${NC}"
    echo -e "\nPara ver logs: ${YELLOW}docker-compose logs -f${NC}"
}

# Desplegar en producción
deploy_prod() {
    echo -e "${BLUE}=== Desplegando en modo PRODUCCIÓN ===${NC}\n"
    check_env_file
    
    # Verificar que DOCKER_IMAGE esté configurada
    if [ -f .env ]; then
        source .env
        if [ -z "$DOCKER_IMAGE" ]; then
            echo -e "${YELLOW}Advertencia: DOCKER_IMAGE no está configurada en .env${NC}"
            echo "Usando imagen por defecto: josedaniel001/framasa-multiempresa-framasa-app:latest"
        fi
    fi
    
    docker-compose -f docker-compose.prod.yml pull
    docker-compose -f docker-compose.prod.yml up -d
    echo -e "\n${GREEN}✓ Aplicación desplegada en modo producción${NC}"
    echo -e "${BLUE}Accede a: http://localhost:${PORT:-3000}${NC}"
    echo -e "\nPara ver logs: ${YELLOW}docker-compose -f docker-compose.prod.yml logs -f${NC}"
}

# Construir imagen
build_image() {
    echo -e "${BLUE}=== Construyendo imagen ===${NC}\n"
    docker-compose build
    echo -e "\n${GREEN}✓ Imagen construida${NC}"
}

# Detener contenedores
stop_containers() {
    echo -e "${BLUE}Deteniendo contenedores...${NC}"
    docker-compose down 2>/dev/null || docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    echo -e "${GREEN}✓ Contenedores detenidos${NC}"
}

# Ver logs
show_logs() {
    if docker-compose ps 2>/dev/null | grep -q "framasa-erp-app"; then
        docker-compose logs -f
    elif docker-compose -f docker-compose.prod.yml ps 2>/dev/null | grep -q "framasa-erp-app"; then
        docker-compose -f docker-compose.prod.yml logs -f
    else
        echo -e "${YELLOW}No hay contenedores corriendo${NC}"
    fi
}

# Reiniciar
restart_containers() {
    echo -e "${BLUE}Reiniciando contenedores...${NC}"
    if docker-compose ps 2>/dev/null | grep -q "framasa-erp-app"; then
        docker-compose restart
    elif docker-compose -f docker-compose.prod.yml ps 2>/dev/null | grep -q "framasa-erp-app"; then
        docker-compose -f docker-compose.prod.yml restart
    else
        echo -e "${YELLOW}No hay contenedores corriendo${NC}"
    fi
    echo -e "${GREEN}✓ Contenedores reiniciados${NC}"
}

# Limpiar
clean_all() {
    echo -e "${YELLOW}⚠ Esto eliminará contenedores, imágenes y volúmenes${NC}"
    read -p "¿Estás seguro? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Limpiando...${NC}"
        docker-compose down -v --rmi all 2>/dev/null || true
        docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true
        echo -e "${GREEN}✓ Limpieza completada${NC}"
    else
        echo "Operación cancelada"
    fi
}

# Script principal
check_docker

COMMAND=${1:-help}

case $COMMAND in
    dev)
        deploy_dev
        ;;
    prod)
        deploy_prod
        ;;
    build)
        build_image
        ;;
    stop)
        stop_containers
        ;;
    logs)
        show_logs
        ;;
    restart)
        restart_containers
        ;;
    clean)
        clean_all
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Comando desconocido: $COMMAND${NC}\n"
        show_help
        exit 1
        ;;
esac


