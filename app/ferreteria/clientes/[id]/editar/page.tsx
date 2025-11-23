"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { ClienteFerreteria } from "@/types/database"
import { ArrowLeft, Loader2 } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPut } from "@/lib/api-client"

interface EditarClientePageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditarClientePage({ params }: EditarClientePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { id } = use(params)

  const [nombre, setNombre] = useState<string>("")
  const [nit, setNit] = useState<string>("")
  const [direccion, setDireccion] = useState<string>("")
  const [telefono, setTelefono] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [activo, setActivo] = useState<boolean>(true)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Cargar cliente desde la API
  useEffect(() => {
    const loadCliente = async () => {
      try {
        setLoading(true)
        const clienteData = await apiGet<ClienteFerreteria>(`${API_ENDPOINTS.FERRETERIA.CLIENTES}/${id}`)
        
        setNombre(clienteData.nombre || "")
        setNit(clienteData.nit || "")
        setDireccion(clienteData.direccion || "")
        setTelefono(clienteData.telefono || "")
        setEmail(clienteData.email || "")
        setActivo(clienteData.activo !== undefined ? clienteData.activo : true)
      } catch (error: any) {
        console.error("Error al cargar cliente:", error)
        toast({
          title: "Error",
          description: error.message || "Error al cargar el cliente. Por favor, inténtelo de nuevo.",
          variant: "destructive",
        })
        router.push("/ferreteria/clientes")
      } finally {
        setLoading(false)
      }
    }

    loadCliente()
  }, [id, router, toast])

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
      }

      await apiPut(`${API_ENDPOINTS.FERRETERIA.CLIENTES}/${id}`, clienteData)

      toast({
        title: "Cliente Actualizado",
        description: `El cliente ${nombre} ha sido actualizado exitosamente.`,
      })
      router.push("/ferreteria/clientes")
    } catch (error: any) {
      console.error("Error al actualizar cliente:", error)
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el cliente. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Cargando cliente...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Cliente: {nombre || "Cargando..."}</h1>
      </div>
      <p className="text-muted-foreground">Modifica la información del cliente.</p>

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
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
