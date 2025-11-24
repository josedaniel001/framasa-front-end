"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiPost } from "@/lib/api-client"
import { Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export default function NuevoClientePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [nombre, setNombre] = useState<string>("")
  const [nit, setNit] = useState<string>("")
  const [direccion, setDireccion] = useState<string>("")
  const [telefono, setTelefono] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [activo, setActivo] = useState<boolean>(true)
  const [permiteFiado, setPermiteFiado] = useState<boolean>(false)
  const [limiteCredito, setLimiteCredito] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre || !telefono) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa los campos obligatorios (Nombre y Teléfono).",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const clienteData = {
        nombre,
        nit: nit || null,
        direccion: direccion || null,
        telefono,
        email: email || null,
        activo,
        permite_fiado: permiteFiado,
        limite_credito: permiteFiado ? limiteCredito : 0,
      }

      await apiPost(API_ENDPOINTS.FERRETERIA.CLIENTES, clienteData)

      toast({
        title: "Cliente Creado",
        description: `El cliente ${nombre} ha sido registrado exitosamente.`,
      })
      router.push("/ferreteria/clientes")
    } catch (error: any) {
      console.error("Error al crear cliente:", error)
      
      // Manejar el caso específico cuando el endpoint no existe en Django
      let errorMessage = error.message || "Error al crear el cliente. Por favor, inténtelo de nuevo."
      
      if (error.status === 404 || error.message?.includes('404') || error.message?.includes('Endpoint no disponible')) {
        errorMessage = "El endpoint de clientes no está disponible en el backend. Por favor, contacta al administrador del sistema para implementar esta funcionalidad."
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nuevo Cliente</h1>
      <p className="text-muted-foreground">Registra un nuevo cliente en el sistema de ferretería.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre Completo / Razón Social</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del cliente o empresa"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nit">NIT</Label>
              <Input
                id="nit"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                placeholder="Número de Identificación Tributaria"
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección completa del cliente"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Número de teléfono"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="activo" checked={activo} onCheckedChange={setActivo} />
              <Label htmlFor="activo">Cliente Activo</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Crédito</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Switch id="permiteFiado" checked={permiteFiado} onCheckedChange={setPermiteFiado} />
              <Label htmlFor="permiteFiado">Permitir Fiado</Label>
            </div>
            {permiteFiado && (
              <div className="grid gap-2">
                <Label htmlFor="limiteCredito">Límite de Crédito (Q)</Label>
                <Input
                  id="limiteCredito"
                  type="number"
                  value={limiteCredito}
                  onChange={(e) => setLimiteCredito(Number(e.target.value))}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Monto máximo que el cliente puede comprar a crédito
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Cliente"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
