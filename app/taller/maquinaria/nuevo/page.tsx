"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { Loader2, ArrowLeft } from "lucide-react"

interface TipoMaquinaria {
  value: string
  label: string
}

interface Empresa {
  value: string
  label: string
}

export default function NuevaMaquinariaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [tipos, setTipos] = useState<TipoMaquinaria[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])

  const [codigo, setCodigo] = useState<string>("")
  const [nombre, setNombre] = useState<string>("")
  const [empresa, setEmpresa] = useState<string>("")
  const [tipoMaquinaria, setTipoMaquinaria] = useState<string>("")
  const [marca, setMarca] = useState<string>("")

  // Función para generar código automáticamente
  const generarCodigo = (emp: string, tipo: string, marcaValue: string): string => {
    if (!emp || !tipo || !marcaValue) return ""

    // Obtener prefijo de empresa
    const prefijoEmpresa: Record<string, string> = {
      FERRETERIA: "FERR",
      BLOQUERA: "BLOQ",
      PIEDRINERA: "PIED",
      CONSTRUCTORA: "CONS",
    }
    const prefijoEmp = prefijoEmpresa[emp] || emp.substring(0, 4).toUpperCase()

    // Obtener prefijo de tipo de maquinaria
    // Mapear tipos comunes a abreviaciones más claras
    const tipoMap: Record<string, string> = {
      EXCAVADORA: "EXC",
      RETROEXCAVADORA: "RET",
      CARGADOR: "CAR",
      COMPACTADORA: "COM",
      VIBRADOR: "VIB",
      MEZCLADORA: "MEZ",
      CORTADORA: "COR",
      GENERADOR: "GEN",
      COMPRESOR: "COM",
      SOLDADORA: "SOL",
      OTRO: "OTR",
    }
    const prefijoTipo = tipoMap[tipo] || tipo.substring(0, 3).toUpperCase()

    // Obtener prefijo de marca (primeras 3 letras, sin espacios)
    const marcaLimpia = marcaValue.replace(/\s+/g, "").toUpperCase()
    const prefijoMarca = marcaLimpia.substring(0, 3)

    // Generar código: EMP-TIPO-MARCA
    // El backend puede agregar un número secuencial si es necesario
    return `${prefijoEmp}-${prefijoTipo}-${prefijoMarca}`
  }

  // Actualizar código cuando cambien empresa, tipo o marca
  useEffect(() => {
    if (empresa && tipoMaquinaria && marca) {
      const codigoGenerado = generarCodigo(empresa, tipoMaquinaria, marca)
      setCodigo(codigoGenerado)
    } else {
      setCodigo("")
    }
  }, [empresa, tipoMaquinaria, marca])
  const [modelo, setModelo] = useState<string>("")
  const [numeroSerie, setNumeroSerie] = useState<string>("")
  const [añoFabricacion, setAñoFabricacion] = useState<number | undefined>(undefined)
  const [estadoActual, setEstadoActual] = useState<string>("operativa")
  const [fechaUltimoMantenimiento, setFechaUltimoMantenimiento] = useState<string>("")
  const [fechaProximoMantenimiento, setFechaProximoMantenimiento] = useState<string>("")
  const [horasOperacion, setHorasOperacion] = useState<number>(0)
  const [kilometraje, setKilometraje] = useState<number>(0)
  const [seguroVigente, setSeguroVigente] = useState<boolean>(true)
  const [documentacionVigente, setDocumentacionVigente] = useState<boolean>(true)
  const [ubicacionActual, setUbicacionActual] = useState<string>("")
  const [observaciones, setObservaciones] = useState<string>("")
  const [activo, setActivo] = useState<boolean>(true)

  // Cargar tipos y empresas
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true)
        const [tiposData, empresasData] = await Promise.all([
          apiGet<TipoMaquinaria[]>(API_ENDPOINTS.TALLER.MAQUINARIA_TIPOS),
          apiGet<Empresa[]>(API_ENDPOINTS.TALLER.MAQUINARIA_EMPRESAS),
        ])

        setTipos(Array.isArray(tiposData) ? tiposData : [])
        setEmpresas(Array.isArray(empresasData) ? empresasData : [])
      } catch (error: any) {
        console.error("Error al cargar datos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los tipos y empresas. Por favor, recarga la página.",
          variant: "destructive",
        })
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que empresa, tipo y marca estén seleccionados para generar código
    if (!empresa || !tipoMaquinaria || !marca) {
      toast({
        title: "Error de validación",
        description: "Por favor, selecciona empresa, tipo de maquinaria y marca para generar el código.",
        variant: "destructive",
      })
      return
    }

    // Generar código si no existe
    const codigoFinal = codigo || generarCodigo(empresa, tipoMaquinaria, marca)

    if (!codigoFinal || !nombre || !empresa || !tipoMaquinaria || !marca || !modelo || !estadoActual) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    if (añoFabricacion && añoFabricacion < 1900) {
      toast({
        title: "Error de validación",
        description: "El año de fabricación debe ser mayor o igual a 1900.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const nuevaMaquinaria = {
        codigo: codigoFinal,
        nombre,
        empresa,
        tipo_maquinaria: tipoMaquinaria,
        marca,
        modelo,
        numero_serie: numeroSerie || null,
        año_fabricacion: añoFabricacion || null,
        estado_actual: estadoActual,
        fecha_ultimo_mantenimiento: fechaUltimoMantenimiento || null,
        fecha_proximo_mantenimiento: fechaProximoMantenimiento || null,
        horas_operacion: horasOperacion || 0,
        kilometraje: kilometraje || 0,
        seguro_vigente: seguroVigente,
        documentacion_vigente: documentacionVigente,
        ubicacion_actual: ubicacionActual || null,
        observaciones: observaciones || null,
        activo: activo,
      }

      const result = await apiPost(API_ENDPOINTS.TALLER.MAQUINARIA, nuevaMaquinaria)

      toast({
        title: "Maquinaria Registrada",
        description: `La maquinaria ${codigoFinal} ha sido registrada exitosamente.`,
      })
      router.push(`/taller/maquinaria/${result.id || result.id}`)
    } catch (error: any) {
      console.error("Error al crear maquinaria:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la maquinaria. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Cargando...</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()} disabled={loading}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Nueva Maquinaria</h1>
      </div>
      <p className="text-muted-foreground">Registra una nueva maquinaria para el taller.</p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                value={codigo}
                placeholder="Se generará automáticamente"
                required
                disabled={true}
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                El código se genera automáticamente basado en la empresa, tipo y marca seleccionados.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Excavadora CAT 320"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="empresa">Empresa *</Label>
              <Select value={empresa} onValueChange={setEmpresa} disabled={loading} required>
                <SelectTrigger id="empresa">
                  <SelectValue placeholder="Selecciona empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((emp) => (
                    <SelectItem key={emp.value} value={emp.value}>
                      {emp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipoMaquinaria">Tipo de Maquinaria *</Label>
              <Select value={tipoMaquinaria} onValueChange={setTipoMaquinaria} disabled={loading} required>
                <SelectTrigger id="tipoMaquinaria">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej: Caterpillar"
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
                placeholder="Ej: 320"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="numeroSerie">Número de Serie</Label>
              <Input
                id="numeroSerie"
                value={numeroSerie}
                onChange={(e) => setNumeroSerie(e.target.value)}
                placeholder="Ej: CAT320-2020-001"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="añoFabricacion">Año de Fabricación</Label>
              <Input
                id="añoFabricacion"
                type="number"
                value={añoFabricacion || ""}
                onChange={(e) => setAñoFabricacion(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ej: 2020"
                min="1900"
                max={new Date().getFullYear() + 1}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estadoActual">Estado Actual *</Label>
              <Select value={estadoActual} onValueChange={setEstadoActual} disabled={loading} required>
                <SelectTrigger id="estadoActual">
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operativa">Operativa</SelectItem>
                  <SelectItem value="en_mantenimiento">En Mantenimiento</SelectItem>
                  <SelectItem value="fuera_de_servicio">Fuera de Servicio</SelectItem>
                  <SelectItem value="reservada">Reservada</SelectItem>
                  <SelectItem value="reparacion">En Reparación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ubicacionActual">Ubicación Actual</Label>
              <Input
                id="ubicacionActual"
                value={ubicacionActual}
                onChange={(e) => setUbicacionActual(e.target.value)}
                placeholder="Ej: Obra Central"
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mantenimiento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="fechaUltimoMantenimiento">Último Mantenimiento</Label>
              <Input
                id="fechaUltimoMantenimiento"
                type="date"
                value={fechaUltimoMantenimiento}
                onChange={(e) => setFechaUltimoMantenimiento(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaProximoMantenimiento">Próximo Mantenimiento</Label>
              <Input
                id="fechaProximoMantenimiento"
                type="date"
                value={fechaProximoMantenimiento}
                onChange={(e) => setFechaProximoMantenimiento(e.target.value)}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentación y Estado</CardTitle>
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
                id="documentacionVigente"
                checked={documentacionVigente}
                onCheckedChange={setDocumentacionVigente}
                disabled={loading}
              />
              <Label htmlFor="documentacionVigente">Documentación Vigente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="activo"
                checked={activo}
                onCheckedChange={setActivo}
                disabled={loading}
              />
              <Label htmlFor="activo">Activo</Label>
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
                placeholder="Notas sobre el estado de la maquinaria, reparaciones recientes, etc..."
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
            Registrar Maquinaria
          </Button>
        </div>
      </form>
    </div>
  )
}

