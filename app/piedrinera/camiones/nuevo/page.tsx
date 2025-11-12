"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { CamionPiedrinera } from "@/types/database"

export default function NuevoCamionPiedrineraPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [placa, setPlaca] = useState<string>("")
  const [marca, setMarca] = useState<string>("")
  const [modelo, setModelo] = useState<string>("")
  const [capacidadMetrosCubicos, setCapacidadMetrosCubicos] = useState<number>(0)
  const [estado, setEstado] = useState<CamionPiedrinera["estado"]>("Disponible")
  const [ultimoMantenimiento, setUltimoMantenimiento] = useState<string>("")
  const [proximoMantenimiento, setProximoMantenimiento] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!placa || !marca || !modelo || capacidadMetrosCubicos <= 0 || !estado) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    const newCamion: CamionPiedrinera = {
      id: `cam-${Date.now()}`, // Generar un ID único
      placa,
      marca,
      modelo,
      capacidadMetrosCubicos,
      estado,
      ultimoMantenimiento,
      proximoMantenimiento,
    }

    console.log("Nuevo Camión:", newCamion)
    // Aquí integrarías con tu backend para guardar el camión
    toast({
      title: "Camión Registrado",
      description: `El camión con placa ${newCamion.placa} ha sido registrado exitosamente.`,
    })
    router.push("/piedrinera/camiones")
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nuevo Camión</h1>
      <p className="text-muted-foreground">Registra un nuevo camión para la flota de la piedrinera.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Camión</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="placa">Placa</Label>
              <Input
                id="placa"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                placeholder="Ej: C-123ABC"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej: Freightliner, Kenworth"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ej: Cascadia, T680"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacidadMetrosCubicos">Capacidad (m³)</Label>
              <Input
                id="capacidadMetrosCubicos"
                type="number"
                value={capacidadMetrosCubicos}
                onChange={(e) => setCapacidadMetrosCubicos(Number(e.target.value))}
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={estado} onValueChange={(value: CamionPiedrinera["estado"]) => setEstado(value)}>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="En Ruta">En Ruta</SelectItem>
                  <SelectItem value="En Mantenimiento">En Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ultimoMantenimiento">Último Mantenimiento</Label>
              <Input
                id="ultimoMantenimiento"
                type="date"
                value={ultimoMantenimiento}
                onChange={(e) => setUltimoMantenimiento(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proximoMantenimiento">Próximo Mantenimiento</Label>
              <Input
                id="proximoMantenimiento"
                type="date"
                value={proximoMantenimiento}
                onChange={(e) => setProximoMantenimiento(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit">Registrar Camión</Button>
        </div>
      </form>
    </div>
  )
}
