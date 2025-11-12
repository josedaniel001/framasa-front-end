"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getSampleAgregadosPiedrinera } from "@/lib/sample-data"
import type { AgregadoPiedrinera } from "@/types/database"
import { ArrowLeft } from "lucide-react"

interface EditarAgregadoPiedrineraPageProps {
  params: {
    id: string
  }
}

export default function EditarAgregadoPiedrineraPage({ params }: EditarAgregadoPiedrineraPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const agregados = getSampleAgregadosPiedrinera()
  const agregadoOriginal = agregados.find((a) => a.id === params.id)

  const [codigo, setCodigo] = useState<string>(agregadoOriginal?.codigo || "")
  const [nombre, setNombre] = useState<string>(agregadoOriginal?.nombre || "")
  const [descripcion, setDescripcion] = useState<string>(agregadoOriginal?.descripcion || "")
  const [tipo, setTipo] = useState<string>(agregadoOriginal?.tipo || "")
  const [granulometria, setGranulometria] = useState<string>(agregadoOriginal?.granulometria || "")
  const [precioVentaPorMetroCubico, setPrecioVentaPorMetroCubico] = useState<number>(
    agregadoOriginal?.precioVentaPorMetroCubico || 0,
  )
  const [costoProduccionPorMetroCubico, setCostoProduccionPorMetroCubico] = useState<number>(
    agregadoOriginal?.costoProduccionPorMetroCubico || 0,
  )
  const [stockActualMetrosCubicos, setStockActualMetrosCubicos] = useState<number>(
    agregadoOriginal?.stockActualMetrosCubicos || 0,
  )
  const [stockMinimoMetrosCubicos, setStockMinimoMetrosCubicos] = useState<number>(
    agregadoOriginal?.stockMinimoMetrosCubicos || 0,
  )
  const [activo, setActivo] = useState<boolean>(agregadoOriginal?.activo || false)

  useEffect(() => {
    if (!agregadoOriginal) {
      toast({
        title: "Agregado no encontrado",
        description: `El agregado con ID ${params.id} no existe.`,
        variant: "destructive",
      })
      router.replace("/piedrinera/productos")
    }
  }, [agregadoOriginal, params.id, router, toast])

  if (!agregadoOriginal) {
    return null // O un componente de carga/error
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !codigo ||
      !nombre ||
      !tipo ||
      !granulometria ||
      precioVentaPorMetroCubico <= 0 ||
      costoProduccionPorMetroCubico <= 0
    ) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios y asegúrate de que los precios sean válidos.",
        variant: "destructive",
      })
      return
    }

    const updatedAgregado: AgregadoPiedrinera = {
      ...agregadoOriginal,
      codigo,
      nombre,
      descripcion,
      tipo,
      granulometria,
      precioVentaPorMetroCubico,
      costoProduccionPorMetroCubico,
      stockActualMetrosCubicos,
      stockMinimoMetrosCubicos,
      activo,
      ultimaActualizacion: new Date().toISOString().split("T")[0],
    }

    console.log("Agregado Actualizado:", updatedAgregado)
    // Aquí integrarías con tu backend para guardar los cambios
    toast({
      title: "Agregado Actualizado",
      description: `El agregado ${updatedAgregado.nombre} ha sido actualizado exitosamente.`,
    })
    router.push(`/piedrinera/productos/${updatedAgregado.id}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Agregado: {agregadoOriginal.nombre}</h1>
      </div>
      <p className="text-muted-foreground">Modifica la información del agregado.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Agregado</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Código único del agregado"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Arena de Río, Grava 3/4"
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción detallada del agregado"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arena">Arena</SelectItem>
                  <SelectItem value="Grava">Grava</SelectItem>
                  <SelectItem value="Piedrín">Piedrín</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="granulometria">Granulometría</Label>
              <Input
                id="granulometria"
                value={granulometria}
                onChange={(e) => setGranulometria(e.target.value)}
                placeholder="Ej: Fino, 3/4, 1/2"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="precioVentaPorMetroCubico">Precio de Venta por m³ (Q)</Label>
              <Input
                id="precioVentaPorMetroCubico"
                type="number"
                value={precioVentaPorMetroCubico}
                onChange={(e) => setPrecioVentaPorMetroCubico(Number(e.target.value))}
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="costoProduccionPorMetroCubico">Costo de Producción por m³ (Q)</Label>
              <Input
                id="costoProduccionPorMetroCubico"
                type="number"
                value={costoProduccionPorMetroCubico}
                onChange={(e) => setCostoProduccionPorMetroCubico(Number(e.target.value))}
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stockActualMetrosCubicos">Stock Actual (m³)</Label>
              <Input
                id="stockActualMetrosCubicos"
                type="number"
                value={stockActualMetrosCubicos}
                onChange={(e) => setStockActualMetrosCubicos(Number(e.target.value))}
                min="0"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stockMinimoMetrosCubicos">Stock Mínimo (m³)</Label>
              <Input
                id="stockMinimoMetrosCubicos"
                type="number"
                value={stockMinimoMetrosCubicos}
                onChange={(e) => setStockMinimoMetrosCubicos(Number(e.target.value))}
                min="0"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="activo" checked={activo} onCheckedChange={setActivo} />
              <Label htmlFor="activo">Agregado Activo</Label>
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
