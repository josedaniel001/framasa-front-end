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

export default function NuevoClientePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [nombre, setNombre] = useState<string>("")
  const [nit, setNit] = useState<string>("")
  const [direccion, setDireccion] = useState<string>("")
  const [telefono, setTelefono] = useState<string>("")
  const [email, setEmail] = useState<string>("")

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

    const newCliente = {
      id: `cli-${Date.now()}`, // Generar un ID único
      nombre,
      nit,
      direccion,
      telefono,
      email,
      fechaRegistro: new Date().toISOString().split("T")[0],
    }

    console.log("Nuevo Cliente:", newCliente)
    // Aquí integrarías con tu backend para guardar el cliente
    toast({
      title: "Cliente Creado",
      description: `El cliente ${newCliente.nombre} ha sido registrado exitosamente.`,
    })
    router.push("/ferreteria/clientes")
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
          <Button type="submit">Crear Cliente</Button>
        </div>
      </form>
    </div>
  )
}
