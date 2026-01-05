# Guía de Despliegue - FRAMASA ERP

Esta guía explica cómo desplegar FRAMASA ERP usando Docker en diferentes entornos.

## 📋 Requisitos Previos

- Docker instalado (versión 20.10 o superior)
- Docker Compose instalado (versión 2.0 o superior)
- Acceso a Docker Hub (para producción)
- Conocimientos básicos de Docker y comandos de terminal

## 🚀 Opciones de Despliegue

### Opción 1: Desarrollo Local (Build desde código)

Ideal para desarrollo, pruebas locales o cuando quieres construir la imagen desde el código fuente.

#### 1. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores:

```env
PORT=3000
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_NEXTJS_URL=http://localhost:3000
```

#### 2. Construir y ejecutar

```bash
# Construir y levantar el contenedor
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f

# Ver solo los logs de la aplicación
docker-compose logs -f framasa-app
```

#### 3. Acceder a la aplicación

La aplicación estará disponible en: `http://localhost:3000`

#### 4. Comandos útiles

```bash
# Detener el contenedor
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Reiniciar el contenedor
docker-compose restart

# Ver estado de los contenedores
docker-compose ps

# Ejecutar comandos dentro del contenedor
docker-compose exec framasa-app sh
```

---

### Opción 2: Producción (Imagen de Docker Hub)

Ideal para producción o cuando quieres usar una imagen pre-construida desde Docker Hub.

#### 1. Configurar variables de entorno

Crea un archivo `.env` en el directorio donde ejecutarás docker-compose:

```bash
# .env
PORT=3000
DOCKER_IMAGE=josedaniel001/framasa-multiempresa-framasa-app:latest
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_NEXTJS_URL=https://app.tudominio.com
```

**⚠️ IMPORTANTE:**
- Reemplaza `josedaniel001/framasa-multiempresa-framasa-app:latest` con tu imagen de Docker Hub
- Actualiza las URLs de API y Next.js con tus dominios reales

#### 2. Ejecutar con docker-compose de producción

```bash
# Descargar y levantar la imagen desde Docker Hub
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar el estado
docker-compose -f docker-compose.prod.yml ps
```

#### 3. Acceder a la aplicación

La aplicación estará disponible en el puerto configurado (por defecto `3000`).

---

## 📦 Publicar Imagen en Docker Hub

Para publicar una nueva versión de la imagen en Docker Hub:

### Opción A: Usando scripts (Recomendado)

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

### Opción B: Manualmente

```bash
# 1. Iniciar sesión en Docker Hub
docker login

# 2. Construir la imagen
docker build -t tu-usuario/framasa-erp:latest .

# 3. Etiquetar para versión específica (opcional)
docker tag tu-usuario/framasa-erp:latest tu-usuario/framasa-erp:v1.0.0

# 4. Publicar la imagen
docker push tu-usuario/framasa-erp:latest
docker push tu-usuario/framasa-erp:v1.0.0
```

---

## 🌐 Despliegue en Servidor de Producción

### Pasos para desplegar en un servidor Linux

#### 1. Preparar el servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Agregar usuario al grupo docker (opcional, para no usar sudo)
sudo usermod -aG docker $USER
# Nota: Necesitas cerrar sesión y volver a iniciar sesión para que tenga efecto
```

#### 2. Clonar o copiar archivos necesarios

```bash
# Opción A: Si tienes el repositorio
git clone <tu-repositorio>
cd frontend

# Opción B: Solo necesitas estos archivos para producción:
# - docker-compose.prod.yml
# - .env (creado con tus valores)
```

#### 3. Configurar variables de entorno

Crea `.env` con valores de producción:

```env
PORT=3000
DOCKER_IMAGE=tu-usuario/framasa-erp:latest
NEXT_PUBLIC_API_URL=https://api.tudominio.com
NEXT_PUBLIC_NEXTJS_URL=https://app.tudominio.com
```

#### 4. Ejecutar en producción

```bash
# Descargar y ejecutar
docker-compose -f docker-compose.prod.yml up -d

# Verificar que esté corriendo
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### 5. Configurar Nginx como Proxy Reverso (Recomendado)

Crea `/etc/nginx/sites-available/framasa-erp`:

```nginx
server {
    listen 80;
    server_name app.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Habilita el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/framasa-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. Configurar SSL con Let's Encrypt (Recomendado)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d app.tudominio.com
```

---

## 🔄 Actualizar la Aplicación

### Para desarrollo local:

```bash
# Parar contenedor
docker-compose down

# Reconstruir con cambios
docker-compose up -d --build
```

### Para producción:

```bash
# Opción 1: Actualizar imagen localmente
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Opción 2: Si cambiaste el código, reconstruir y publicar
./docker-build.sh  # o docker-build.bat en Windows
# Luego en el servidor:
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📊 Monitoreo y Logs

### Ver logs

```bash
# Logs en tiempo real
docker-compose logs -f

# Últimas 100 líneas
docker-compose logs --tail=100

# Logs desde una fecha específica
docker-compose logs --since 2024-01-01T00:00:00

# Logs de un servicio específico
docker-compose logs -f framasa-app
```

### Monitorear recursos

```bash
# Uso de recursos del contenedor
docker stats framasa-erp-app

# Información del contenedor
docker inspect framasa-erp-app

# Verificar healthcheck
docker inspect --format='{{json .State.Health}}' framasa-erp-app | jq
```

---

## 🔧 Troubleshooting

### El contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs framasa-app

# Verificar si el puerto está en uso
netstat -tulpn | grep 3000  # Linux
netstat -an | findstr 3000  # Windows

# Probar iniciar sin detached mode
docker-compose up
```

### La imagen no se encuentra en Docker Hub

1. Verifica que la imagen esté publicada:
   ```bash
   docker pull tu-usuario/framasa-erp:latest
   ```

2. Verifica que el nombre en `.env` coincida exactamente

3. Asegúrate de tener acceso a Docker Hub (no requiere login para imágenes públicas)

### Build falla

```bash
# Limpiar caché de Docker
docker builder prune

# Limpiar todo (¡cuidado! elimina todas las imágenes no usadas)
docker system prune -a

# Verificar espacio en disco
df -h
```

### La aplicación no se conecta al backend Django

1. Verifica que `NEXT_PUBLIC_API_URL` esté configurada correctamente
2. Verifica que el backend Django esté corriendo y accesible
3. Verifica la conectividad de red:
   ```bash
   # Desde el contenedor
   docker-compose exec framasa-app wget -O- http://127.0.0.1:8000
   ```

### Problemas de permisos

```bash
# Verificar permisos de logs
ls -la logs/

# Crear directorio de logs si no existe
mkdir -p logs
chmod 755 logs
```

---

## 🔐 Seguridad

### Mejores prácticas

1. **Nunca commitees el archivo `.env`** - Está en `.gitignore`
2. **Usa variables de entorno seguras** - No hardcodees contraseñas
3. **Actualiza regularmente** - Mantén Docker y las imágenes actualizadas
4. **Usa HTTPS en producción** - Configura SSL/TLS
5. **Limita el acceso a puertos** - Usa firewall
6. **Monitorea logs** - Revisa logs regularmente por errores

### Ejemplo de firewall (UFW en Ubuntu)

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

---

## 📝 Variables de Entorno Importantes

| Variable | Descripción | Requerida | Default |
|----------|-------------|-----------|---------|
| `PORT` | Puerto de la aplicación | No | `3000` |
| `DOCKER_IMAGE` | Imagen de Docker Hub | Solo prod | - |
| `NEXT_PUBLIC_API_URL` | URL del backend Django | **Sí** | `http://127.0.0.1:8000` |
| `NEXT_PUBLIC_NEXTJS_URL` | URL del frontend Next.js | No | `http://localhost:3000` |
| `DB_HOST` | Host de PostgreSQL | Opcional | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | Opcional | `5432` |
| `DB_NAME` | Nombre de la BD | Opcional | `postgres` |
| `DB_USER` | Usuario de PostgreSQL | Opcional | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | Opcional | - |
| `DB_SSL` | Usar SSL para BD | Opcional | `false` |

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica las variables de entorno
3. Consulta la documentación de Docker
4. Revisa el archivo `README.DOCKER.md` para más detalles técnicos

---

## 📚 Recursos Adicionales

- [Documentación oficial de Docker](https://docs.docker.com/)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Docker Hub](https://hub.docker.com/)


