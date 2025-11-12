#!/bin/bash

# Script para construir y publicar la imagen Docker

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
DOCKER_USER="${DOCKER_USER:-tu-usuario}"
IMAGE_NAME="${IMAGE_NAME:-framasa-erp}"
VERSION="${VERSION:-latest}"

echo -e "${BLUE}=== Construcción de imagen Docker para FRAMASA ERP ===${NC}\n"

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Error: Docker no está instalado${NC}"
    exit 1
fi

# Verificar si el usuario está logueado en Docker Hub
echo -e "${BLUE}Verificando autenticación en Docker Hub...${NC}"
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}No estás logueado en Docker Hub. Ejecuta: docker login${NC}"
    read -p "¿Deseas continuar de todos modos? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Construir la imagen
echo -e "\n${BLUE}Construyendo imagen...${NC}"
docker build -t ${DOCKER_USER}/${IMAGE_NAME}:${VERSION} .

# Etiquetar como latest si no es la versión latest
if [ "$VERSION" != "latest" ]; then
    docker tag ${DOCKER_USER}/${IMAGE_NAME}:${VERSION} ${DOCKER_USER}/${IMAGE_NAME}:latest
fi

echo -e "\n${GREEN}✓ Imagen construida exitosamente${NC}"
echo -e "${BLUE}Imagen: ${DOCKER_USER}/${IMAGE_NAME}:${VERSION}${NC}"

# Preguntar si desea publicar
read -p "¿Deseas publicar la imagen en Docker Hub? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "\n${BLUE}Publicando imagen en Docker Hub...${NC}"
    docker push ${DOCKER_USER}/${IMAGE_NAME}:${VERSION}
    
    if [ "$VERSION" != "latest" ]; then
        docker push ${DOCKER_USER}/${IMAGE_NAME}:latest
    fi
    
    echo -e "\n${GREEN}✓ Imagen publicada exitosamente en Docker Hub${NC}"
    echo -e "${BLUE}Los clientes pueden usar: docker-compose -f docker-compose.prod.yml up -d${NC}"
fi

echo -e "\n${GREEN}✓ Proceso completado${NC}"

