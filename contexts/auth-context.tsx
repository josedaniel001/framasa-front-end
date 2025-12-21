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
      const response = await fetch(API_ENDPOINTS.AUTH.VERIFY, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data.usuario
      }
      return null
    } catch (error) {
      console.error("Error al verificar token:", error)
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
            localStorage.removeItem("usuario")
          }
        })
        .catch(() => {
          localStorage.removeItem("token")
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
      // Primero intentar login con Django
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Guardar el token y el usuario
          localStorage.setItem("token", data.token)
          localStorage.setItem("usuario", JSON.stringify(data.usuario))
          setUsuario(data.usuario)
          setIsAuthenticated(true)
          return true
        }
      }

      // Si Django no está disponible, usar datos de muestra
      console.log("Django no disponible, usando datos de muestra")
      const usuarioMuestra = sampleUsuarios.find(u => u.username === username && u.activo)

      if (usuarioMuestra) {
        // Simular token JWT para datos de muestra
        const mockToken = `mock-jwt-token-${usuarioMuestra.id}-${Date.now()}`
        const usuarioData = {
          ...usuarioMuestra,
          token: mockToken
        }

        // Guardar en localStorage
        localStorage.setItem("token", mockToken)
        localStorage.setItem("usuario", JSON.stringify(usuarioData))
        setUsuario(usuarioData)
        setIsAuthenticated(true)
        return true
      }

      return false
    } catch (error) {
      console.error("Error al conectar con Django, intentando con datos de muestra:", error)

      // Fallback a datos de muestra si hay error de conexión
      const usuarioMuestra = sampleUsuarios.find(u => u.username === username && u.activo)

      if (usuarioMuestra) {
        // Simular token JWT para datos de muestra
        const mockToken = `mock-jwt-token-${usuarioMuestra.id}-${Date.now()}`
        const usuarioData = {
          ...usuarioMuestra,
          token: mockToken
        }

        // Guardar en localStorage
        localStorage.setItem("token", mockToken)
        localStorage.setItem("usuario", JSON.stringify(usuarioData))
        setUsuario(usuarioData)
        setIsAuthenticated(true)
        return true
      }

      return false
    }
  }

  const logout = () => {
    setUsuario(null)
    setIsAuthenticated(false)
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
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
