"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function NuevoAgregadoPiedrineraPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [codigo, setCodigo] = useState<string>("")
  const [nombre, setNombre] = useState<string>("")
  const [descripcion, setDescripcion] = useState<string>("")
  const [tipo, setTipo] = useState<string>("")
  const [granulometria, setGranulometria] = useState<string>("")
  const [precioVentaPorMetroCubico, setPrecioVentaPorMetroCubico] = useState<number>(0)
  const [costoProduccionPorMetroCubico, setCostoProduccionPorMetroCubico] = useState<number>(0)
  const [stockActualMetrosCubicos, setStockActualMetrosCubicos] = useState<number>(0)
  const [stockMinimoMetrosCubicos, setStockMinimoMetrosCubicos] = useState<number>(0)
  const [activo, setActivo] = useState<boolean>(true)

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

    const newAgregado = {
      id: `agr-${Date.now()}`, // Generar un ID único
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
      fechaCreacion: new Date().toISOString().split("T")[0],
      ultimaActualizacion: new Date().toISOString().split("T")[0],
    }

    console.log("Nuevo Agregado:", newAgregado)
    // Aquí integrarías con tu backend para guardar el agregado
    toast({
      title: "Agregado Creado",
      description: `El agregado ${newAgregado.nombre} ha sido registrado exitosamente.`,
    })
    router.push("/piedrinera/productos")
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nuevo Agregado</h1>
      <p className="text-muted-foreground">Registra un nuevo tipo de agregado (arena, grava, piedrín).</p>

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
                  <SelectItem value="Mezcla">Mezcla</SelectItem>
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
          <Button type="submit">Crear Agregado</Button>
        </div>
      </form>
    </div>
  )
}
