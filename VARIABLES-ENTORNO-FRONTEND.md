# Variables de Entorno del Frontend

## ✅ Puedes borrar el .env del frontend

Ya no necesitas un archivo `.env` en la raíz del proyecto frontend. Todo está configurado para usar Django.

## Variables Opcionales

Si quieres personalizar algo, puedes crear `.env.local` (este archivo NO se sube a Git):

### NEXT_PUBLIC_API_URL (Opcional)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Por defecto:** `http://localhost:8000` (ya está configurado en `lib/api-config.ts`)

Solo necesitas esta variable si:
- Quieres cambiar la URL del backend Django
- Tienes el backend en otro puerto o dominio

## Variables que YA NO se usan

Estas variables ya no son necesarias porque Django maneja todo:

- ❌ `DB_HOST` - Ya no se usa (Django maneja la conexión)
- ❌ `DB_PORT` - Ya no se usa
- ❌ `DB_NAME` - Ya no se usa
- ❌ `DB_USER` - Ya no se usa
- ❌ `DB_PASSWORD` - Ya no se usa
- ❌ `JWT_SECRET` - Ya no se usa (Django genera los tokens)
- ❌ `JWT_EXPIRES_IN` - Ya no se usa

## Nota sobre lib/db.ts

El archivo `lib/db.ts` todavía existe porque las rutas de API de ferretería (`/api/ferreteria/*`) todavía consultan directamente la base de datos. Estas rutas:

- ✅ Usan valores por defecto si no hay variables de entorno
- ✅ Verifican tokens con Django (no con lib/auth.ts)
- ⚠️ En el futuro, estas rutas también deberían moverse a Django

Si las rutas de ferretería no funcionan sin variables de entorno, asegúrate de que PostgreSQL esté corriendo con los valores por defecto:
- Host: `localhost`
- Puerto: `5432`
- Base de datos: `framasa_db`
- Usuario: `postgres`
- Contraseña: (la que configuraste en `backend/.env`)

## Resumen

✅ **Puedes borrar `.env` del frontend** - No es necesario
✅ **Todo funciona con Django** - La autenticación es 100% Django JWT
✅ **Variables opcionales** - Solo `NEXT_PUBLIC_API_URL` si quieres cambiar la URL

