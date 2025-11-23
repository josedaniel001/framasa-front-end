/**
 * Utilidad para verificar tokens JWT con Django
 * Reemplaza el uso de lib/auth.ts para verificación de tokens
 */

import { API_ENDPOINTS } from '@/lib/api-config'
import type { Usuario } from '@/types/database'

/**
 * Verifica un token JWT con el backend Django
 * @param token - Token JWT a verificar
 * @returns Usuario si el token es válido, null en caso contrario
 */
export async function verifyTokenWithDjango(token: string): Promise<Usuario | null> {
  try {
    console.log('🔍 [verifyTokenWithDjango] Verificando token con Django en:', API_ENDPOINTS.AUTH.VERIFY)
    const response = await fetch(API_ENDPOINTS.AUTH.VERIFY, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('🔍 [verifyTokenWithDjango] Respuesta de Django:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ [verifyTokenWithDjango] Token válido, usuario:', data.usuario?.id)
      return data.usuario
    } else {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ [verifyTokenWithDjango] Token inválido:', {
        status: response.status,
        errorData,
      })
    }
    return null
  } catch (error) {
    console.error('❌ [verifyTokenWithDjango] Error al verificar token con Django:', error)
    return null
  }
}

/**
 * Extrae el token del header Authorization
 * @param authHeader - Header Authorization completo
 * @returns Token sin el prefijo "Bearer " o null si no es válido
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

