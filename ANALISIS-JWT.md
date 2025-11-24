# Análisis del Manejo de JWT en la Aplicación

## Estado Actual del Sistema de Autenticación

### 1. **Almacenamiento del Token**
- **Ubicación**: `localStorage` del navegador
- **Clave**: `"token"`
- **Formato**: JWT (JSON Web Token) generado por Django REST Framework Simple JWT

### 2. **Flujo de Autenticación**

#### Login (`contexts/auth-context.tsx`)
```typescript
// Al hacer login:
1. Se envía username/password a Django: POST /api/auth/login/
2. Django responde con:
   - token (JWT de acceso)
   - refresh_token (JWT de renovación) ⚠️ NO SE USA ACTUALMENTE
   - usuario (datos del usuario)
3. Se guarda en localStorage:
   - localStorage.setItem("token", data.token)
   - localStorage.setItem("usuario", JSON.stringify(data.usuario))
```

#### Verificación al Cargar la App (`contexts/auth-context.tsx`)
```typescript
// Al cargar la aplicación:
1. Se lee el token de localStorage
2. Se verifica con Django: GET /api/auth/verify/ (con Bearer token)
3. Si es válido: se mantiene la sesión
4. Si es inválido: se limpia localStorage y se redirige al login
```

#### Uso en Requests (`lib/api-client.ts`)
```typescript
// En cada request a la API:
1. Se obtiene el token de localStorage
2. Se agrega al header: Authorization: Bearer <token>
3. Si no hay token: se muestra warning pero se envía el request
```

### 3. **Problemas Identificados**

#### ❌ **NO HAY REFRESH TOKEN IMPLEMENTADO**
- Django devuelve `refresh_token` en el login, pero **no se guarda ni se usa**
- El token de acceso tiene expiración (configurado en Django, probablemente 24h)
- Cuando el token expira, el usuario debe hacer login nuevamente
- No hay renovación automática del token

#### ❌ **NO HAY INTERCEPTOR PARA RENOVAR TOKEN**
- No se interceptan las respuestas 401 (Unauthorized)
- No se intenta renovar el token automáticamente cuando expira
- El usuario solo se da cuenta cuando un request falla

#### ⚠️ **VERIFICACIÓN SOLO AL CARGAR**
- El token solo se verifica cuando la app carga
- No se verifica periódicamente durante la sesión
- Si el token expira mientras el usuario está usando la app, no se detecta hasta el próximo request

### 4. **Recomendaciones para Mejorar**

#### ✅ **Implementar Refresh Token**
1. Guardar el `refresh_token` en localStorage
2. Crear función para renovar el token usando el refresh token
3. Interceptar respuestas 401 y renovar automáticamente

#### ✅ **Agregar Interceptor de Requests**
1. Interceptar todas las respuestas de la API
2. Si la respuesta es 401, intentar renovar el token
3. Reintentar el request original con el nuevo token
4. Si la renovación falla, redirigir al login

#### ✅ **Verificación Periódica**
1. Verificar el token cada cierto tiempo (ej: cada 5 minutos)
2. Renovarlo automáticamente si está próximo a expirar
3. Mostrar advertencia al usuario si la sesión está por expirar

### 5. **Estructura Actual del Token**

Según `lib/auth.ts` (aunque este archivo parece no usarse actualmente):
```typescript
interface TokenPayload {
  userId: number
  username: string
  email: string
  rol: RolSistema
}
```

El token JWT contiene esta información y se puede decodificar (sin verificar) para ver su contenido, pero la verificación real se hace en Django.

### 6. **Endpoints de Django**

- **POST /api/auth/login/**: Inicia sesión y devuelve token + refresh_token
- **GET /api/auth/verify/**: Verifica si un token es válido
- **POST /api/auth/logout/**: Cierra sesión (no se usa actualmente en el frontend)

### 7. **Resumen**

| Aspecto | Estado | Notas |
|---------|--------|-------|
| Almacenamiento | ✅ Funciona | localStorage |
| Verificación inicial | ✅ Funciona | Al cargar la app |
| Refresh token | ❌ No implementado | Django lo devuelve pero no se usa |
| Renovación automática | ❌ No implementado | El usuario debe hacer login nuevamente |
| Interceptor de errores | ❌ No implementado | No se manejan 401 automáticamente |
| Verificación periódica | ❌ No implementado | Solo se verifica al cargar |

### 8. **Próximos Pasos Sugeridos**

1. **Implementar refresh token** en `contexts/auth-context.tsx`
2. **Agregar interceptor** en `lib/api-client.ts` para manejar 401
3. **Crear función de renovación** que use el refresh token
4. **Agregar verificación periódica** del token (opcional pero recomendado)

