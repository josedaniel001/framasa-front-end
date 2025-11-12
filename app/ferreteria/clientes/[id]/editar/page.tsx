"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getSampleClientesFerreteria } from "@/lib/sample-data"
import type { ClienteFerreteria } from "@/types/database"
import { ArrowLeft } from "lucide-react"

interface EditarClientePageProps {
  params: {
    id: string
  }
}

export default function EditarClientePage({ params }: EditarClientePageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const clientes = getSampleClientesFerreteria()
  const clienteOriginal = clientes.find((c) => c.id === params.id)

  const [nombre, setNombre] = useState<string>(clienteOriginal?.nombre || "")
  const [nit, setNit] = useState<string>(clienteOriginal?.nit || "")
  const [direccion, setDireccion] = useState<string>(clienteOriginal?.direccion || "")
  const [telefono, setTelefono] = useState<string>(clienteOriginal?.telefono || "")
  const [email, setEmail] = useState<string>(clienteOriginal?.email || "")

  useEffect(() => {
    if (!clienteOriginal) {
      toast({
        title: "Cliente no encontrado",
        description: `El cliente con ID ${params.id} no existe.`,
        variant: "destructive",
      })
      router.replace("/ferreteria/clientes") // Redirigir si el cliente no existe
    }
  }, [clienteOriginal, params.id, router, toast])

  if (!clienteOriginal) {
    return null // O un componente de carga/error
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre || !nit || !telefono) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa los campos obligatorios (Nombre, NIT, Teléfono).",
        variant: "destructive",
      })
      return
    }

    const updatedCliente: ClienteFerreteria = {
      ...clienteOriginal,
      nombre,
      nit,
      direccion,
      telefono,
      email,
      // fechaRegistro no se actualiza, es la fecha de creación
    }

    console.log("Cliente Actualizado:", updatedCliente)
    // Aquí integrarías con tu backend para guardar los cambios
    toast({
      title: "Cliente Actualizado",
      description: `El cliente ${updatedCliente.nombre} ha sido actualizado exitosamente.`,
    })
    router.push("/ferreteria/clientes") // Redirigir a la lista de clientes
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Cliente: {clienteOriginal.nombre}</h1>
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
                required
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
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Cambios</Button>
        </div>
      </form>
    </div>
  )
}
