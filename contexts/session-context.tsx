"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LogOut, Clock } from "lucide-react"

interface SessionContextType {
  showSessionExpired: () => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isExpired, setIsExpired] = useState(false)

  const showSessionExpired = useCallback(() => {
    // Solo mostrar si no está ya mostrando
    if (!isExpired) {
      setIsExpired(true)
    }
  }, [isExpired])

  const handleAccept = () => {
    // Limpiar localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    setIsExpired(false)
    // Usar window.location.href para forzar una recarga completa
    // Esto reinicia todo el estado de React y evita problemas de sincronización
    window.location.href = "/login"
  }

  return (
    <SessionContext.Provider value={{ showSessionExpired }}>
      {children}
      
      <AlertDialog open={isExpired} onOpenChange={() => {}}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 mb-4">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <AlertDialogTitle className="text-xl">Sesión Expirada</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Tu sesión ha expirado por inactividad o el token ya no es válido. 
              Por favor, inicia sesión nuevamente para continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction 
              onClick={handleAccept}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Ir al Login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}

// Variable global para acceder desde api-client (que no es un componente React)
let globalShowSessionExpired: (() => void) | null = null

export function setGlobalSessionHandler(handler: () => void) {
  globalShowSessionExpired = handler
}

export function triggerSessionExpired() {
  if (globalShowSessionExpired) {
    globalShowSessionExpired()
  }
}

