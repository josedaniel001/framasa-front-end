"use client"

import { useState, useEffect } from "react"
import { useAuth as useAuthContext } from "@/contexts/auth-context"

/**
 * Hook extendido de autenticación que incluye el token
 * Wrapper del contexto de autenticación con funcionalidades adicionales
 */
export function useAuth() {
  const authContext = useAuthContext()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Obtener el token de localStorage
    const storedToken = localStorage.getItem("token")
    setToken(storedToken)
  }, [authContext.isAuthenticated])

  return {
    ...authContext,
    token,
  }
}

