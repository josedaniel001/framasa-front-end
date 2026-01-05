# Guía de Docker para FRAMASA ERP

Este proyecto incluye configuración de Docker para desarrollo y producción.

## Archivos Docker

- `Dockerfile`: Construcción multi-stage optimizada para Next.js
- `docker-compose.yml`: Para desarrollo/build local (construye la imagen)
- `docker-compose.prod.yml`: Para producción (usa imagen de Docker Hub)

## Desarrollo Local (Build)

Para construir y ejecutar la aplicación localmente:

```bash
# Construir y levantar el contenedor
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener el contenedor
docker-compose down
```

La aplicación estará disponible en `http://localhost:3000`

## Producción (Docker Hub)

Para clientes que desean usar la imagen pre-construida de Docker Hub:

### 1. Configurar variables de entorno

Crear un archivo `.env` en el directorio donde se ejecutará docker-compose con las variables necesarias:

```env
# Imagen de Docker Hub (reemplazar con tu usuario/nombre)
DOCKER_IMAGE=tu-usuario/framasa-erp:latest

# Puerto de la aplicación
PORT=3000

# Variables adicionales de la aplicación (si las necesitas)
# NODE_ENV=production
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname
# API_URL=https://api.example.com
```

**Importante:** Reemplaza `tu-usuario` con tu usuario real de Docker Hub.

### 2. Ejecutar con docker-compose de producción

```bash
# Descargar y levantar la imagen desde Docker Hub
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Detener el contenedor
docker-compose -f docker-compose.prod.yml down
```

**Nota:** La primera vez que ejecutes `docker-compose -f docker-compose.prod.yml up -d`, Docker descargará automáticamente la imagen desde Docker Hub si no existe localmente.

## Publicar imagen en Docker Hub

### Opción 1: Usando el script helper

**Linux/Mac:**
```bash
# Configurar variables (opcional)
export DOCKER_USER=tu-usuario
export IMAGE_NAME=framasa-erp
export VERSION=v1.0.0

# Ejecutar script
chmod +x docker-build.sh
./docker-build.sh
```

**Windows:**
```cmd
REM Configurar variables (opcional)
set DOCKER_USER=tu-usuario
set IMAGE_NAME=framasa-erp
set VERSION=v1.0.0

REM Ejecutar script
docker-build.bat
```

### Opción 2: Manualmente

```bash
# 1. Iniciar sesión en Docker Hub
docker login

# 2. Construir la imagen
docker build -t tu-usuario/framasa-erp:latest .

# 3. Etiquetar la imagen (opcional, para versiones)
docker tag tu-usuario/framasa-erp:latest tu-usuario/framasa-erp:v1.0.0

# 4. Publicar la imagen
docker push tu-usuario/framasa-erp:latest
docker push tu-usuario/framasa-erp:v1.0.0
```

## Variables de Entorno

Ambos archivos docker-compose soportan las siguientes variables:

### Variables de Docker
- `PORT`: Puerto donde se expone la aplicación (default: 3000)
- `DOCKER_IMAGE`: Imagen de Docker Hub para producción (solo docker-compose.prod.yml)

### Variables de Next.js
- `NODE_ENV`: Entorno de ejecución (production)
- `NEXT_TELEMETRY_DISABLED`: Deshabilitar telemetría de Next.js
- `NEXT_PUBLIC_API_URL`: URL base de la API Django (requerida, default: http://127.0.0.1:8000)
- `NEXT_PUBLIC_NEXTJS_URL`: URL base de Next.js (default: http://localhost:3000)

### Variables de Base de Datos (Opcionales)
- `DB_HOST`: Host de PostgreSQL (solo para rutas API que consultan directamente DB)
- `DB_PORT`: Puerto de PostgreSQL
- `DB_NAME`: Nombre de la base de datos
- `DB_USER`: Usuario de PostgreSQL
- `DB_PASSWORD`: Contraseña de PostgreSQL
- `DB_SSL`: Usar SSL para conexión (true/false)

**Nota:** Para más detalles sobre las variables de entorno, consulta el archivo `env.example`.

Para configurar estas variables, crea un archivo `.env` basándote en `env.example`.

## Volúmenes

Los logs se guardan en el directorio `./logs` del host. Puedes agregar más volúmenes si es necesario.

## Health Check

El contenedor incluye un health check que verifica que la aplicación esté respondiendo en `http://localhost:3000/`. El health check se ejecuta cada 30 segundos y marca el contenedor como saludable si la aplicación responde correctamente.

## Troubleshooting

### Problema: La imagen no se encuentra en Docker Hub

Si un cliente intenta usar `docker-compose.prod.yml` y obtiene un error de que la imagen no existe:
1. Verifica que la imagen esté publicada en Docker Hub
2. Verifica que el nombre de la imagen en `.env` coincida exactamente con el publicado
3. Asegúrate de que el cliente tenga acceso a Docker Hub (no requiere login para imágenes públicas)

### Problema: El contenedor no inicia

1. Verifica los logs: `docker-compose logs -f`
2. Verifica que el puerto 3000 no esté en uso: `netstat -an | grep 3000` (Linux/Mac) o `netstat -an | findstr 3000` (Windows)
3. Verifica que todas las variables de entorno estén configuradas correctamente

### Problema: Build falla

1. Verifica que tengas suficiente espacio en disco
2. Verifica que Docker tenga recursos suficientes (memoria, CPU)
3. Intenta limpiar caché: `docker builder prune`

## Notas

- Asegúrate de tener Docker y Docker Compose instalados
- La imagen usa Node.js 22 Alpine para un tamaño optimizado
- El build usa modo standalone de Next.js para mejor rendimiento
- El usuario del contenedor es `nextjs` (no root) por seguridad

