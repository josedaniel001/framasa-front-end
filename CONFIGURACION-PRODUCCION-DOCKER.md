# 🔧 Configuración Correcta del .env para Producción con Docker

## ⚠️ Problema Identificado

Tienes dos contextos diferentes que necesitan URLs distintas:

1. **Cliente (navegador)**: El código JavaScript que corre en el navegador necesita la URL pública de Django
2. **Servidor (rutas API de Next.js)**: Las rutas API que corren dentro del contenedor Docker necesitan la URL interna del contenedor

## ✅ Configuración Correcta del `.env`

Para tu caso específico (Django en `framasa_backend` y Frontend en `framasa-erp-app`):

```env
# ============================================
# Docker Configuration
# ============================================
PORT=3000
DOCKER_IMAGE=josedaniel001/framasa-multiempresa-framasa-app:latest

# ============================================
# Next.js Public Variables (CLIENTE - NAVEGADOR)
# ============================================
# ⚠️ IMPORTANTE: Esta URL es para el navegador (cliente)
# Si Django está expuesto en el puerto 8000 del host, usa:
NEXT_PUBLIC_API_URL=http://localhost:8000

# Si Django tiene un dominio público, usa:
# NEXT_PUBLIC_API_URL=https://api.tudominio.com

# URL del frontend Next.js
NEXT_PUBLIC_NEXTJS_URL=http://localhost:3000

# ============================================
# Django API URL (SERVIDOR - RUTAS API)
# ============================================
# ⚠️ IMPORTANTE: Esta URL es para las rutas API del servidor (dentro del contenedor)
# Usa el nombre del contenedor de Django para comunicación interna en Docker
DJANGO_API_URL=http://framasa_backend:8000

# ============================================
# Database Configuration (Opcional)
# ============================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=framasa_db
DB_USER=postgres
DB_PASSWORD=
DB_SSL=false
```

## 📋 Resumen de URLs

| Variable | Contexto | Valor | Uso |
|----------|----------|-------|-----|
| `NEXT_PUBLIC_API_URL` | Cliente (navegador) | `http://localhost:8000` | Login, verificación de token desde el navegador |
| `DJANGO_API_URL` | Servidor (rutas API) | `http://framasa_backend:8000` | Rutas API de Next.js que hacen proxy a Django |

## 🔍 ¿Por qué dos URLs diferentes?

### Cliente (Navegador):
```javascript
// En el navegador, cuando haces login:
fetch('http://localhost:8000/api/auth/login/', ...)
// El navegador necesita una URL pública que pueda acceder
```

### Servidor (Rutas API):
```javascript
// Dentro del contenedor, cuando una ruta API hace proxy:
fetch('http://framasa_backend:8000/api/ferreteria/productos/', ...)
// El contenedor usa el nombre del servicio para comunicación interna
```

## 🚀 Pasos para Aplicar

1. **Actualiza tu archivo `.env`** con los valores de arriba
2. **Asegúrate que ambos contenedores estén en la misma red Docker**
3. **Reconstruye el contenedor del frontend**:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d --build
   ```
4. **Verifica los logs**:
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f framasa-app
   ```

## ✅ Verificación

### 1. Verificar que las variables están configuradas:
```bash
docker-compose -f docker-compose.prod.yml exec framasa-app env | grep DJANGO_API_URL
docker-compose -f docker-compose.prod.yml exec framasa-app env | grep NEXT_PUBLIC_API_URL
```

### 2. Probar conexión desde el contenedor al backend:
```bash
docker-compose -f docker-compose.prod.yml exec framasa-app wget -O- http://framasa_backend:8000/api/auth/verify/
```

### 3. Verificar que el navegador puede acceder a Django:
Abre en tu navegador: `http://localhost:8000/api/auth/verify/`

## 🐛 Troubleshooting

### Error: "Django no disponible"
- Verifica que `framasa_backend` esté corriendo: `docker ps`
- Verifica que ambos contenedores estén en la misma red: `docker network inspect <nombre-red>`
- Verifica que `DJANGO_API_URL` esté configurada correctamente

### Error: "ECONNREFUSED 127.0.0.1:8000"
- Esto significa que el servidor está intentando usar `127.0.0.1` en lugar de `framasa_backend`
- Verifica que `DJANGO_API_URL=http://framasa_backend:8000` esté en tu `.env`

### Error 400/500 en las peticiones
- Verifica los logs de Django: `docker logs framasa_backend`
- Verifica que el token se esté enviando correctamente en los headers
- Verifica que Django acepte las peticiones desde el frontend (CORS configurado)

