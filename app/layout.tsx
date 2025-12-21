import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FRAMASA - Sistema Multiempresa",
  description: "Sistema de gestión integral para múltiples empresas",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
