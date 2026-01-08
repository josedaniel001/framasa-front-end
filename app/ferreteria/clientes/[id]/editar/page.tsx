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
import { Switch } from "@/components/ui/switch"

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
  const [permiteFiado, setPermiteFiado] = useState<boolean>(false)
  const [limiteCredito, setLimiteCredito] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Cargar cliente desde la API
  useEffect(() => {
    const loadCliente = async () => {
      try {
        setLoading(true)
        // Construir URL correctamente removiendo el slash final si existe
        const clienteUrl = API_ENDPOINTS.FERRETERIA.CLIENTES.endsWith('/') 
          ? `${API_ENDPOINTS.FERRETERIA.CLIENTES}${id}/`
          : `${API_ENDPOINTS.FERRETERIA.CLIENTES}/${id}/`
        
        const clienteRaw = await apiGet<any>(clienteUrl)
        
        // Mapear datos del backend (snake_case) al formato del frontend
        const clienteData: ClienteFerreteria = {
          id: clienteRaw.id,
          nombre: clienteRaw.nombre || "",
          nit: clienteRaw.nit || null,
          direccion: clienteRaw.direccion || null,
          telefono: clienteRaw.telefono || null,
          email: clienteRaw.email || null,
          activo: clienteRaw.activo !== undefined ? clienteRaw.activo : true,
          permite_fiado: clienteRaw.permite_fiado ?? clienteRaw.permiteFiado ?? false,
          permiteFiado: clienteRaw.permite_fiado ?? clienteRaw.permiteFiado ?? false,
          limite_credito: clienteRaw.limite_credito ?? clienteRaw.limiteCredito ?? 0,
          limiteCredito: clienteRaw.limite_credito ?? clienteRaw.limiteCredito ?? 0,
          saldo_actual: clienteRaw.saldo_actual ?? clienteRaw.saldoActual ?? 0,
          saldoActual: clienteRaw.saldo_actual ?? clienteRaw.saldoActual ?? 0,
          credito_disponible: clienteRaw.credito_disponible ?? clienteRaw.creditoDisponible ?? 0,
          creditoDisponible: clienteRaw.credito_disponible ?? clienteRaw.creditoDisponible ?? 0,
          puede_comprar_fiado: clienteRaw.puede_comprar_fiado ?? clienteRaw.puedeComprarFiado ?? false,
          puedeComprarFiado: clienteRaw.puede_comprar_fiado ?? clienteRaw.puedeComprarFiado ?? false,
          fecha_registro: clienteRaw.fecha_registro || clienteRaw.fechaRegistro || clienteRaw.created_at || '',
          created_at: clienteRaw.created_at || clienteRaw.fecha_registro || '',
          updated_at: clienteRaw.updated_at || '',
        }
        
        setNombre(clienteData.nombre || "")
        setNit(clienteData.nit || "")
        setDireccion(clienteData.direccion || "")
        setTelefono(clienteData.telefono || "")
        setEmail(clienteData.email || "")
        setActivo(clienteData.activo !== undefined ? clienteData.activo : true)
        setPermiteFiado(clienteData.permite_fiado ?? clienteData.permiteFiado ?? false)
        setLimiteCredito(clienteData.limite_credito ?? clienteData.limiteCredito ?? 0)
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
        permite_fiado: permiteFiado,
        limite_credito: permiteFiado ? limiteCredito : 0,
      }

      // Construir URL correctamente removiendo el slash final si existe
      const clienteUrl = API_ENDPOINTS.FERRETERIA.CLIENTES.endsWith('/') 
        ? `${API_ENDPOINTS.FERRETERIA.CLIENTES}${id}/`
        : `${API_ENDPOINTS.FERRETERIA.CLIENTES}/${id}/`
      
      await apiPut(clienteUrl, clienteData)

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
