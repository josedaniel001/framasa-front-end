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

export default function NuevoCamionPiedrineraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [placa, setPlaca] = useState<string>("")
  const [marca, setMarca] = useState<string>("")
  const [modelo, setModelo] = useState<string>("")
  const [capacidadMetrosCubicos, setCapacidadMetrosCubicos] = useState<number>(0)
  const [estado, setEstado] = useState<string>("Disponible")
  const [ultimoMantenimiento, setUltimoMantenimiento] = useState<string>("")
  const [proximoMantenimiento, setProximoMantenimiento] = useState<string>("")
  const [kilometraje, setKilometraje] = useState<number>(0)
  const [horasOperacion, setHorasOperacion] = useState<number>(0)
  const [consumoCombustible, setConsumoCombustible] = useState<number>(0)
  const [seguroVigente, setSeguroVigente] = useState<boolean>(true)
  const [revisionTecnicaVigente, setRevisionTecnicaVigente] = useState<boolean>(true)
  const [documentacionVigente, setDocumentacionVigente] = useState<boolean>(true)
  const [observaciones, setObservaciones] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!placa || !marca || !modelo || capacidadMetrosCubicos <= 0 || !estado) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Preparar datos para enviar a la API
      const newCamion = {
        placa,
        marca,
        modelo,
        capacidad_m3: capacidadMetrosCubicos,
        estado_actual: estado,
        fecha_ultimo_mantenimiento: ultimoMantenimiento || null,
        fecha_proximo_mantenimiento: proximoMantenimiento || null,
        kilometraje,
        horas_operacion: horasOperacion,
        consumo_l_100km: consumoCombustible,
        seguro_vigente: seguroVigente,
        revision_tecnica_vigente: revisionTecnicaVigente,
        documentacion_vigente: documentacionVigente,
        observaciones: observaciones || null,
        activo: true,
      }

      await apiPost(API_ENDPOINTS.PIEDRINERA.CAMIONES, newCamion)

      toast({
        title: "Camión Registrado",
        description: `El camión con placa ${placa} ha sido registrado exitosamente.`,
      })
      router.push("/piedrinera/camiones")
    } catch (error: any) {
      console.error("Error al crear camión:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el camión. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                placeholder="Ej: C-123ABC"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej: Freightliner, Kenworth"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ej: Cascadia, T680"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacidadMetrosCubicos">Capacidad (m³) *</Label>
              <Input
                id="capacidadMetrosCubicos"
                type="number"
                value={capacidadMetrosCubicos}
                onChange={(e) => setCapacidadMetrosCubicos(Number(e.target.value))}
                step="0.01"
                min="0.01"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select value={estado} onValueChange={setEstado} disabled={loading}>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="En Ruta">En Ruta</SelectItem>
                  <SelectItem value="Cargando">Cargando</SelectItem>
                  <SelectItem value="Descargando">Descargando</SelectItem>
                  <SelectItem value="En Mantenimiento">En Mantenimiento</SelectItem>
                  <SelectItem value="Fuera de Servicio">Fuera de Servicio</SelectItem>
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
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proximoMantenimiento">Próximo Mantenimiento</Label>
              <Input
                id="proximoMantenimiento"
                type="date"
                value={proximoMantenimiento}
                onChange={(e) => setProximoMantenimiento(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kilometraje">Kilometraje</Label>
              <Input
                id="kilometraje"
                type="number"
                value={kilometraje}
                onChange={(e) => setKilometraje(Number(e.target.value))}
                min="0"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="horasOperacion">Horas de Operación</Label>
              <Input
                id="horasOperacion"
                type="number"
                value={horasOperacion}
                onChange={(e) => setHorasOperacion(Number(e.target.value))}
                min="0"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="consumoCombustible">Consumo (L/100km)</Label>
              <Input
                id="consumoCombustible"
                type="number"
                step="0.01"
                value={consumoCombustible}
                onChange={(e) => setConsumoCombustible(Number(e.target.value))}
                min="0"
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentación y Seguros</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="seguroVigente"
                checked={seguroVigente}
                onCheckedChange={setSeguroVigente}
                disabled={loading}
              />
              <Label htmlFor="seguroVigente">Seguro Vigente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="revisionTecnicaVigente"
                checked={revisionTecnicaVigente}
                onCheckedChange={setRevisionTecnicaVigente}
                disabled={loading}
              />
              <Label htmlFor="revisionTecnicaVigente">Revisión Técnica Vigente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="documentacionVigente"
                checked={documentacionVigente}
                onCheckedChange={setDocumentacionVigente}
                disabled={loading}
              />
              <Label htmlFor="documentacionVigente">Documentación Vigente</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas sobre el estado del vehículo, reparaciones recientes, etc..."
                rows={3}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar Camión
          </Button>
        </div>
      </form>
    </div>
  )
}
