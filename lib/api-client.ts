/**
 * Cliente API para hacer requests autenticados a Django
 */

import { API_ENDPOINTS } from '@/lib/api-config'

/**
 * Obtiene el token de autenticación desde localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

/**
 * Realiza un fetch autenticado a la API de Django
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  } else {
    console.warn('⚠️ No se encontró token en localStorage. La petición puede fallar por autenticación.')
  }

  return fetch(endpoint, {
    ...options,
    headers,
  })
}

/**
 * Realiza un GET request autenticado
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint, { method: 'GET' })
  
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`
    try {
      const errorData = await response.json()
      if (errorData.error) {
        errorMessage = errorData.error
      } else if (errorData.detail) {
        errorMessage = errorData.detail
      } else if (typeof errorData === 'string') {
        errorMessage = errorData
      }
    } catch {
      // Si no se puede parsear el error, usar el mensaje por defecto
    }
    const error: any = new Error(errorMessage)
    error.status = response.status
    error.response = { data: await response.json().catch(() => ({})) }
    throw error
  }
  
  return response.json()
}

/**
 * Realiza un POST request autenticado
 */
export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`
    let errorCode = null
    try {
      const errorData = await response.json()
      if (errorData.detail) {
        errorMessage = errorData.detail
      } else if (errorData.message) {
        errorMessage = errorData.message
      } else if (errorData.error) {
        errorMessage = errorData.error
      } else if (typeof errorData === 'string') {
        errorMessage = errorData
      } else if (errorData.non_field_errors) {
        errorMessage = errorData.non_field_errors.join(', ')
      }
      errorCode = errorData.code || null
    } catch {
      // Si no se puede parsear el JSON, usar el mensaje por defecto
    }
    const error = new Error(errorMessage) as any
    error.status = response.status
    error.code = errorCode
    error.response = response
    throw error
  }
  
  return response.json()
}

/**
 * Realiza un PUT request autenticado
 */
export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`
    try {
      const errorData = await response.json()
      if (errorData.detail) {
        errorMessage = errorData.detail
      } else if (errorData.message) {
        errorMessage = errorData.message
      } else if (typeof errorData === 'string') {
        errorMessage = errorData
      } else if (errorData.non_field_errors) {
        errorMessage = errorData.non_field_errors.join(', ')
      } else if (typeof errorData === 'object') {
        // Errores de validación de campos específicos de Django
        const fieldErrors = Object.entries(errorData)
          .map(([field, messages]: [string, any]) => {
            const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            const messagesText = Array.isArray(messages) ? messages.join(', ') : messages
            return `${fieldName}: ${messagesText}`
          })
          .join('; ')
        if (fieldErrors) {
          errorMessage = fieldErrors
        }
      }
    } catch {
      // Si no se puede parsear el JSON, usar el mensaje por defecto
    }
    const error = new Error(errorMessage) as any
    error.status = response.status
    error.response = response
    throw error
  }
  
  return response.json()
}

/**
 * Realiza un DELETE request autenticado
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint, { method: 'DELETE' })
  
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`
    try {
      const errorData = await response.json()
      if (errorData.detail) {
        errorMessage = errorData.detail
      } else if (errorData.message) {
        errorMessage = errorData.message
      } else if (typeof errorData === 'string') {
        errorMessage = errorData
      }
    } catch {
      // Si no se puede parsear el JSON, usar el mensaje por defecto
    }
    const error = new Error(errorMessage) as any
    error.status = response.status
    error.response = response
    throw error
  }
  
  // Verificar si la respuesta tiene contenido antes de intentar parsear JSON
  const contentType = response.headers.get('content-type')
  const contentLength = response.headers.get('content-length')
  
  // Si no hay contenido o es 204 No Content, retornar un objeto vacío
  if (response.status === 204 || contentLength === '0' || !contentType?.includes('application/json')) {
    return {} as T
  }
  
  // Intentar parsear JSON solo si hay contenido
  const text = await response.text()
  if (!text || text.trim() === '') {
    return {} as T
  }
  
  try {
    return JSON.parse(text) as T
  } catch {
    // Si falla el parseo, retornar objeto vacío
    return {} as T
  }
}

