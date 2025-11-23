# ✅ Configuración Completa - Autenticación con Django JWT

## Estado Actual

✅ **Frontend configurado** - Usa Django JWT en `lib/api-config.ts`
✅ **Backend Django configurado** - JWT habilitado en `backend/framasa_backend/settings.py`
✅ **Rutas de Next.js deshabilitadas** - Ya no se usan las rutas `/api/auth/*` de Next.js

## Arquitectura de Autenticación

```
Frontend (Next.js)          Backend (Django)
─────────────────          ──────────────────
lib/api-config.ts    →     http://localhost:8000/api/auth/
contexts/auth-context.tsx   ├── login/
                            ├── verify/
                            └── logout/
```

## Endpoints de Django

### POST /api/auth/login/
**Request:**
```json
{
  "username": "usuario",
  "password": "contraseña"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "usuario": {
    "id": 1,
    "username": "usuario",
    "email": "usuario@example.com",
    "rol": "admin",
    "activo": true
  }
}
```

### GET /api/auth/verify/
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "usuario": {
    "id": 1,
    "username": "usuario",
    "email": "usuario@example.com",
    "rol": "admin",
    "activo": true
  }
}
```

## Configuración Requerida

### 1. Backend - Archivo .env

Crea `backend/.env` con tus credenciales de PostgreSQL:

```env
DJANGO_SECRET_KEY=django-insecure-cambiar-en-produccion
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=framasa_db
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA
DB_HOST=localhost
DB_PORT=5432
```

### 2. Frontend - Variables de entorno (opcional)

Si quieres cambiar la URL del backend, crea `.env.local` en la raíz:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Por defecto usa `http://localhost:8000`.

## Pasos para Iniciar

### Terminal 1 - Backend Django:
```powershell
cd backend
venv\Scripts\activate
python manage.py migrate
python manage.py runserver
```

### Terminal 2 - Frontend Next.js:
```powershell
npm run dev
```

## Verificar que Funciona

1. Abre http://localhost:3000
2. Intenta iniciar sesión
3. El frontend debería comunicarse con Django en http://localhost:8000

## Archivos Modificados

- ✅ `lib/api-config.ts` - Configuración de endpoints de Django
- ✅ `contexts/auth-context.tsx` - Usa endpoints de Django
- ✅ `app/api/auth/login/route.ts` - Deshabilitado (redirige a Django)
- ✅ `app/api/auth/verify/route.ts` - Deshabilitado (redirige a Django)
- ✅ `backend/framasa_backend/settings.py` - Configurado con JWT y PostgreSQL

## Notas

- Las rutas de API de Next.js (`/api/auth/*`) ya no se usan
- Toda la autenticación pasa por Django
- Los tokens JWT son generados por Django REST Framework Simple JWT
- La base de datos PostgreSQL se configura en `backend/.env`

