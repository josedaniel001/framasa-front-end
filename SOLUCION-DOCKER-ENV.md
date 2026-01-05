# Solución al Error de Conexión con Django en Docker

## 🔴 Problema

El error `ECONNREFUSED 127.0.0.1:8000` ocurría porque:
- Las rutas API de Next.js (que se ejecutan en el **servidor** dentro del contenedor Docker) intentaban conectarse a `127.0.0.1:8000`
- Dentro del contenedor, `127.0.0.1` se refiere al mismo contenedor, no al backend Django
- `NEXT_PUBLIC_API_URL` se embebe en el código durante el **build**, no puede cambiar en runtime

## ✅ Solución Implementada

Se implementó una variable de entorno adicional `DJANGO_API_URL` que:
- Puede configurarse en **runtime** dentro del contenedor Docker
- Tiene **prioridad** sobre `NEXT_PUBLIC_API_URL` en el servidor
- Permite apuntar al backend Django correcto según el entorno de despliegue

## 📝 Cambios Realizados

### 1. Archivos Actualizados

#### ✅ `lib/api-config.ts`
- Agregada función `getDjangoApiUrl()` que prioriza `DJANGO_API_URL` sobre `NEXT_PUBLIC_API_URL`

#### ✅ `lib/verify-token-django.ts`
- Actualizado para usar `getDjangoApiUrl()` dinámicamente

#### ✅ `docker-compose.yml` y `docker-compose.prod.yml`
- Agregada variable de entorno `DJANGO_API_URL` en la sección `environment`

#### ✅ `env.example`
- Documentación de cómo usar `DJANGO_API_URL`

### 2. Archivos de Rutas API (Parcialmente Actualizados)

Los siguientes archivos ya fueron actualizados:
- ✅ `app/api/ferreteria/productos/route.ts`
- ✅ `app/api/bloquera/movimientos-inventario/route.ts`

**Nota:** Los demás archivos de rutas API (41 archivos) necesitan ser actualizados siguiendo el mismo patrón.

## 🔧 Cómo Actualizar las Rutas API Restantes

Para cada archivo de ruta API que aún tenga:
```typescript
const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
```

Reemplazar con:
```typescript
import { getDjangoApiUrl } from '@/lib/api-config'

// Obtener URL de Django (prioriza DJANGO_API_URL en runtime sobre NEXT_PUBLIC_API_URL)
const DJANGO_API_URL = getDjangoApiUrl()
```

### Script para actualización masiva (Linux/Mac):

```bash
# Buscar archivos que necesitan actualización
find app/api -name "route.ts" -type f -exec grep -l "const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL" {} \;

# Actualizar cada archivo (cuidado: revisar antes de ejecutar)
find app/api -name "route.ts" -type f -exec sed -i.bak \
  -e '/^import.*verify-token-django/a\
import { getDjangoApiUrl } from '\''@/lib/api-config'\''
' \
  -e 's|const DJANGO_API_URL = process\.env\.NEXT_PUBLIC_API_URL.*|const DJANGO_API_URL = getDjangoApiUrl()|' \
  {} \;
```

### Lista de archivos que necesitan actualización:

```
app/api/planillas/cargos/route.ts
app/api/planillas/asistencias/stats/route.ts
app/api/facturacion/cotizaciones/[id]/route.ts
app/api/facturacion/cotizaciones/[id]/rechazar/route.ts
app/api/planillas/asistencias/route.ts
app/api/planillas/asistencias/empleados_sin_asistencia_hoy/route.ts
app/api/planillas/asistencias/[id]/route.ts
app/api/planillas/asistencias/[id]/marcar_salida/route.ts
app/api/planillas/asistencias/[id]/toggle_activo/route.ts
app/api/facturacion/cotizaciones/[id]/enviar/route.ts
app/api/facturacion/cotizaciones/[id]/convertir_a_factura/route.ts
app/api/facturacion/cotizaciones/[id]/aceptar/route.ts
app/api/reportes/top-productos-vendidos/route.ts
app/api/reportes/inventario-unificado/route.ts
app/api/reportes/estadisticas-predictivas/route.ts
app/api/facturacion/facturas/route.ts
app/api/facturacion/facturas/[id]/route.ts
app/api/facturacion/facturas/estadisticas/route.ts
app/api/facturacion/facturas/[id]/anular/route.ts
app/api/facturacion/facturas/[id]/agregar-pagos-multiples/route.ts
app/api/facturacion/cotizaciones/route.ts
app/api/ferreteria/proveedores/route.ts
app/api/piedrinera/movimientos-inventario/route.ts
app/api/ferreteria/movimientos-inventario/route.ts
app/api/planillas/empleados/[id]/route.ts
app/api/planillas/empleados/route.ts
app/api/planillas/empleados/stats/route.ts
app/api/piedrinera/camiones/route.ts
app/api/piedrinera/camiones/[id]/route.ts
app/api/piedrinera/productos/[id]/route.ts
app/api/piedrinera/productos/stats/route.ts
app/api/piedrinera/productos/route.ts
app/api/bloquera/productos/[id]/route.ts
app/api/bloquera/productos/stats/route.ts
app/api/bloquera/productos/route.ts
app/api/ferreteria/clientes/[id]/route.ts
app/api/ferreteria/clientes/route.ts
app/api/ferreteria/clientes/stats/route.ts
app/api/ferreteria/productos/[id]/route.ts
app/api/ferreteria/unidades-medida/route.ts
app/api/ferreteria/categorias/route.ts
```

## 🚀 Configuración para Producción

### Opción 1: Django en otro contenedor Docker

Si Django está en otro contenedor Docker (misma red):

```env
# .env
DJANGO_API_URL=http://nombre-servicio-django:8000
```

Ejemplo de `docker-compose.yml` completo:
```yaml
version: '3.8'
services:
  backend:
    image: tu-backend-django:latest
    # ...
  
  frontend:
    build: .
    environment:
      - DJANGO_API_URL=http://backend:8000
    depends_on:
      - backend
```

### Opción 2: Django en otro servidor

Si Django está en otro servidor con dominio:

```env
# .env
DJANGO_API_URL=https://api.tudominio.com
```

### Opción 3: Django en el mismo host (Linux)

Si Django está corriendo en el mismo host pero fuera de Docker:

```env
# .env
DJANGO_API_URL=http://172.17.0.1:8000  # IP del host Docker
# O mejor aún, usa host.docker.internal si estás en Docker Desktop
```

### Opción 4: Django en el mismo host (Docker Desktop)

Si estás usando Docker Desktop en Windows/Mac:

```env
# .env
DJANGO_API_URL=http://host.docker.internal:8000
```

## ✅ Verificación

Después de aplicar los cambios:

1. **Reconstruir la imagen**:
   ```bash
   docker-compose up -d --build
   ```

2. **Verificar logs**:
   ```bash
   docker-compose logs -f framasa-app
   ```

3. **Verificar que la variable está configurada**:
   ```bash
   docker-compose exec framasa-app env | grep DJANGO_API_URL
   ```

4. **Probar la conexión** (desde dentro del contenedor):
   ```bash
   docker-compose exec framasa-app wget -O- http://tu-backend-django:8000/api/auth/verify/
   ```

## 📚 Referencias

- Ver `DEPLOY.md` para guía completa de despliegue
- Ver `env.example` para todas las variables de entorno disponibles

