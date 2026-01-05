"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Usuario, RolSistema, ModuloSistema } from "@/types/database"
import { permisosPorRol, sampleUsuarios } from "@/lib/sample-data"
import { API_ENDPOINTS } from "@/lib/api-config"

interface AuthContextType {
  usuario: Usuario | null
  rol: RolSistema | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  tienePermiso: (modulo: ModuloSistema) => boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Función para verificar el token con el servidor Django
  const verifyToken = async (token: string): Promise<Usuario | null> => {
    try {
      // Si es un token mock, verificar con datos de muestra
      if (token.startsWith('mock-jwt-token-')) {
        const userId = token.split('-')[3] // Extraer ID del token mock
        const usuarioMuestra = sampleUsuarios.find(u => u.id === parseInt(userId) && u.activo)
        return usuarioMuestra || null
      }

      // Verificar con Django
      const verifyUrl = API_ENDPOINTS.AUTH.VERIFY
      console.log('🔍 [Auth] Verificando token en:', verifyUrl)
      
      const response = await fetch(verifyUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log('🔍 [Auth] Respuesta de verificación:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [Auth] Token válido, usuario:', data.usuario?.id || data.usuario?.username)
        
        // Django puede retornar 'usuario' o 'valid' con 'usuario'
        if (data.usuario) {
          return data.usuario
        }
        
        // Si la respuesta tiene 'valid: true' pero sin usuario, intentar obtenerlo de otra manera
        if (data.valid) {
          console.warn('⚠️ [Auth] Respuesta válida pero sin usuario en data.usuario')
          return null
        }
      } else {
        // Log detallado del error
        const errorText = await response.text().catch(() => 'No se pudo leer el error')
        console.error('❌ [Auth] Error al verificar token:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        })
      }
      return null
    } catch (error: any) {
      console.error("❌ [Auth] Error de conexión al verificar token:", {
        message: error.message,
        stack: error.stack,
        url: API_ENDPOINTS.AUTH.VERIFY,
      })
      return null
    }
  }

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la aplicación
    const token = localStorage.getItem("token")
    const savedUser = localStorage.getItem("usuario")

    if (token && savedUser) {
      // Verificar que el token sigue siendo válido
      verifyToken(token)
        .then((user) => {
          if (user) {
            setUsuario(user)
            setIsAuthenticated(true)
            // Actualizar el usuario guardado por si hubo cambios
            localStorage.setItem("usuario", JSON.stringify(user))
          } else {
            // Token inválido, limpiar
            localStorage.removeItem("token")
            localStorage.removeItem("refresh_token")
            localStorage.removeItem("usuario")
          }
        })
        .catch(() => {
          localStorage.removeItem("token")
          localStorage.removeItem("refresh_token")
          localStorage.removeItem("usuario")
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Intentar login con Django
      const loginUrl = API_ENDPOINTS.AUTH.LOGIN
      console.log('🔍 [Auth] Intentando login en:', loginUrl)
      
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      console.log('🔍 [Auth] Respuesta de login:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🔍 [Auth] Datos recibidos:', {
          hasSuccess: 'success' in data,
          hasToken: 'token' in data,
          hasUsuario: 'usuario' in data,
          success: data.success,
        })

        // Django puede retornar token directamente o dentro de un objeto 'success'
        if (data.success && data.token && data.usuario) {
          // Guardar el token y el usuario
          localStorage.setItem("token", data.token)
          localStorage.setItem("usuario", JSON.stringify(data.usuario))
          
          // Guardar refresh_token si está disponible
          if (data.refresh_token) {
            localStorage.setItem("refresh_token", data.refresh_token)
          }
          
          setUsuario(data.usuario)
          setIsAuthenticated(true)
          console.log('✅ [Auth] Login exitoso para usuario:', data.usuario.username)
          return true
        } else if (data.token && data.usuario) {
          // Formato alternativo sin 'success'
          localStorage.setItem("token", data.token)
          localStorage.setItem("usuario", JSON.stringify(data.usuario))
          if (data.refresh_token) {
            localStorage.setItem("refresh_token", data.refresh_token)
          }
          setUsuario(data.usuario)
          setIsAuthenticated(true)
          console.log('✅ [Auth] Login exitoso (formato alternativo) para usuario:', data.usuario.username)
          return true
        } else {
          console.error('❌ [Auth] Respuesta OK pero formato inesperado:', data)
        }
      } else {
        // Log detallado del error
        const errorText = await response.text().catch(() => 'No se pudo leer el error')
        let errorData: any = {}
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { raw: errorText }
        }
        
        console.error('❌ [Auth] Error en login:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })
        
        // Si es un error 400 (credenciales inválidas), no intentar fallback
        if (response.status === 400 || response.status === 401) {
          return false
        }
      }

      // Solo usar datos de muestra si hay un error de conexión (no de autenticación)
      console.warn("⚠️ [Auth] Django no disponible o error de conexión")
      
      // En Docker, permitir fallback a datos de muestra para desarrollo/testing
      // Solo bloquear en producción real (cuando NEXT_PUBLIC_API_URL apunta a un dominio real)
      const isRealProduction = process.env.NEXT_PUBLIC_API_URL?.includes('https://') || 
                               process.env.NEXT_PUBLIC_API_URL?.includes('.com') ||
                               process.env.NEXT_PUBLIC_API_URL?.includes('.net')
      
      if (isRealProduction) {
        console.error('❌ [Auth] No se puede hacer login: Django no está disponible en producción')
        return false
      }
      
      console.warn("⚠️ [Auth] Usando datos de muestra como fallback (modo desarrollo/testing)")
      const usuarioMuestra = sampleUsuarios.find(u => u.username === username && u.activo)
      if (usuarioMuestra) {
        const mockToken = `mock-jwt-token-${usuarioMuestra.id}-${Date.now()}`
        const usuarioData = {
          ...usuarioMuestra,
          token: mockToken
        }
        localStorage.setItem("token", mockToken)
        localStorage.setItem("usuario", JSON.stringify(usuarioData))
        setUsuario(usuarioData)
        setIsAuthenticated(true)
        return true
      }

      return false
    } catch (error: any) {
      console.error("❌ [Auth] Error de conexión al hacer login:", {
        message: error.message,
        stack: error.stack,
        url: API_ENDPOINTS.AUTH.LOGIN,
      })

      // En Docker, permitir fallback a datos de muestra para desarrollo/testing
      const isRealProduction = process.env.NEXT_PUBLIC_API_URL?.includes('https://') || 
                               process.env.NEXT_PUBLIC_API_URL?.includes('.com') ||
                               process.env.NEXT_PUBLIC_API_URL?.includes('.net')
      
      if (isRealProduction) {
        console.error('❌ [Auth] No se puede hacer login: Error de conexión en producción')
        return false
      }

      // Fallback a datos de muestra en desarrollo/Docker
      console.warn("⚠️ [Auth] Usando datos de muestra como fallback (modo desarrollo/testing)")
      const usuarioMuestra = sampleUsuarios.find(u => u.username === username && u.activo)
      if (usuarioMuestra) {
        const mockToken = `mock-jwt-token-${usuarioMuestra.id}-${Date.now()}`
        const usuarioData = {
          ...usuarioMuestra,
          token: mockToken
        }
        localStorage.setItem("token", mockToken)
        localStorage.setItem("usuario", JSON.stringify(usuarioData))
        setUsuario(usuarioData)
        setIsAuthenticated(true)
        return true
      }

      return false
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem("token")
      
      // Intentar hacer logout en Django si hay token válido
      if (token && !token.startsWith('mock-jwt-token-')) {
        try {
          await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
          console.log('✅ [Auth] Logout exitoso en Django')
        } catch (error) {
          console.warn('⚠️ [Auth] Error al hacer logout en Django (continuando):', error)
        }
      }
    } catch (error) {
      console.warn('⚠️ [Auth] Error en proceso de logout:', error)
    } finally {
      // Limpiar siempre, incluso si falla el logout en Django
      setUsuario(null)
      setIsAuthenticated(false)
      localStorage.removeItem("token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("usuario")
      console.log('✅ [Auth] Sesión limpiada localmente')
    }
  }

  const tienePermiso = (modulo: ModuloSistema): boolean => {
    if (!usuario) return false
    const permisos = permisosPorRol[usuario.rol]
    return permisos ? permisos.includes(modulo) : false
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        rol: usuario?.rol || null,
        isAuthenticated,
        login,
        logout,
        tienePermiso,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
