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
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiPost } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

export default function NuevoAgregadoPiedrineraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [codigo, setCodigo] = useState<string>("")
  const [nombre, setNombre] = useState<string>("")
  const [descripcion, setDescripcion] = useState<string>("")
  const [tipo, setTipo] = useState<string>("")
  const [granulometria, setGranulometria] = useState<string>("")
  const [precioVentaPorMetroCubico, setPrecioVentaPorMetroCubico] = useState<number>(0)
  const [costoProduccionPorMetroCubico, setCostoProduccionPorMetroCubico] = useState<number>(0)
  const [stockActualMetrosCubicos, setStockActualMetrosCubicos] = useState<number>(0)
  const [stockMinimoMetrosCubicos, setStockMinimoMetrosCubicos] = useState<number>(0)
  const [ubicacion, setUbicacion] = useState<string>("")
  const [humedadPorcentaje, setHumedadPorcentaje] = useState<number | undefined>(undefined)
  const [calidad, setCalidad] = useState<string>("")
  const [proveedor, setProveedor] = useState<string>("")
  const [fechaUltimaEntrada, setFechaUltimaEntrada] = useState<string>("")
  const [activo, setActivo] = useState<boolean>(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !codigo ||
      !nombre ||
      !tipo ||
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

    try {
      setLoading(true)

      // Preparar datos para enviar a la API
      const newAgregado = {
        codigo,
        nombre,
        descripcion: descripcion || null,
        tipo,
        granulometria: granulometria || null,
        precio_venta_m3: precioVentaPorMetroCubico,
        costo_produccion_m3: costoProduccionPorMetroCubico,
        stock_actual_m3: stockActualMetrosCubicos,
        stock_minimo_m3: stockMinimoMetrosCubicos,
        ubicacion: ubicacion || null,
        humedad_porcentaje: humedadPorcentaje || null,
        calidad: calidad || null,
        proveedor: proveedor || null,
        fecha_ultima_entrada: fechaUltimaEntrada || null,
        activo,
      }

      await apiPost(API_ENDPOINTS.PIEDRINERA.PRODUCTOS, newAgregado)

      toast({
        title: "Agregado Creado",
        description: `El agregado ${nombre} ha sido registrado exitosamente.`,
      })
      router.push("/piedrinera/productos")
    } catch (error: any) {
      console.error("Error al crear agregado:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el agregado. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Código único del agregado"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Arena de Río, Grava 3/4"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción detallada del agregado"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={tipo} onValueChange={setTipo} disabled={loading}>
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
                placeholder="Ej: 0-5mm, 3/4, 1/2"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="precioVentaPorMetroCubico">Precio de Venta por m³ (Q) *</Label>
              <Input
                id="precioVentaPorMetroCubico"
                type="number"
                value={precioVentaPorMetroCubico}
                onChange={(e) => setPrecioVentaPorMetroCubico(Number(e.target.value))}
                step="0.01"
                min="0"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="costoProduccionPorMetroCubico">Costo de Producción por m³ (Q) *</Label>
              <Input
                id="costoProduccionPorMetroCubico"
                type="number"
                value={costoProduccionPorMetroCubico}
                onChange={(e) => setCostoProduccionPorMetroCubico(Number(e.target.value))}
                step="0.01"
                min="0"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stockActualMetrosCubicos">Stock Actual (m³) *</Label>
              <Input
                id="stockActualMetrosCubicos"
                type="number"
                value={stockActualMetrosCubicos}
                onChange={(e) => setStockActualMetrosCubicos(Number(e.target.value))}
                step="0.01"
                min="0"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stockMinimoMetrosCubicos">Stock Mínimo (m³) *</Label>
              <Input
                id="stockMinimoMetrosCubicos"
                type="number"
                value={stockMinimoMetrosCubicos}
                onChange={(e) => setStockMinimoMetrosCubicos(Number(e.target.value))}
                step="0.01"
                min="0"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                id="ubicacion"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej: Patio A-1"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="humedadPorcentaje">Humedad (%)</Label>
              <Input
                id="humedadPorcentaje"
                type="number"
                value={humedadPorcentaje || ""}
                onChange={(e) => setHumedadPorcentaje(e.target.value ? Number(e.target.value) : undefined)}
                step="0.01"
                min="0"
                max="100"
                placeholder="Ej: 3.2"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="calidad">Calidad</Label>
              <Select value={calidad} onValueChange={setCalidad} disabled={loading}>
                <SelectTrigger id="calidad">
                  <SelectValue placeholder="Selecciona calidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excelente">Excelente</SelectItem>
                  <SelectItem value="Buena">Buena</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Input
                id="proveedor"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                placeholder="Nombre del proveedor"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaUltimaEntrada">Fecha Última Entrada</Label>
              <Input
                id="fechaUltimaEntrada"
                type="date"
                value={fechaUltimaEntrada}
                onChange={(e) => setFechaUltimaEntrada(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch id="activo" checked={activo} onCheckedChange={setActivo} disabled={loading} />
              <Label htmlFor="activo">Agregado Activo</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Agregado
          </Button>
        </div>
      </form>
    </div>
  )
}
