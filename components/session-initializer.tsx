"use client"

import { useEffect } from "react"
import { useSession, setGlobalSessionHandler } from "@/contexts/session-context"

/**
 * Componente que inicializa el handler global de sesión
 * Debe estar dentro de SessionProvider
 */
export function SessionInitializer() {
  const { showSessionExpired } = useSession()

  useEffect(() => {
    // Registrar el handler global para que api-client pueda usarlo
    setGlobalSessionHandler(showSessionExpired)
  }, [showSessionExpired])

  return null
}

