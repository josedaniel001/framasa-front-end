"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Usuario, RolSistema, ModuloSistema } from "@/types/database"
import { sampleUsuarios, permisosPorRol } from "@/lib/sample-data"

interface AuthContextType {
  usuario: Usuario | null
  rol: RolSistema | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  tienePermiso: (modulo: ModuloSistema) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem("usuario")
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setUsuario(user)
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulación de autenticación
    const user = sampleUsuarios.find((u) => u.username === username)

    if (user && password === "admin123") {
      setUsuario(user)
      setIsAuthenticated(true)
      localStorage.setItem("usuario", JSON.stringify(user))
      return true
    }

    return false
  }

  const logout = () => {
    setUsuario(null)
    setIsAuthenticated(false)
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
