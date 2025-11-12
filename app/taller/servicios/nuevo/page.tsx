"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Settings, Clock, Users, DollarSign, Plus, X } from "lucide-react"
import Link from "next/link"

const categorias = ["Mantenimiento", "Reparación", "Overhaul", "Electrónica", "Soldadura", "Diagnóstico", "Calibración"]

const tiposEquipo = [
  "Excavadoras",
  "Camiones",
  "Grúas",
  "Retroexcavadoras",
  "Compactadoras",
  "Bulldozers",
  "Motoniveladoras",
  "Cargadores",
  "Todos",
]

const materialesDisponibles = [
  "Aceite Motor 15W-40",
  "Filtro de Aceite",
  "Filtro de Aire",
  "Aceite Hidráulico",
  "Pastillas de Freno",
  "Correas",
  "Mangueras Hidráulicas",
  "Grasa Multiuso",
  "Refrigerante",
  "Electrodos de Soldadura",
]

export default function NuevoServicioPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState<string[]>([])
  const [nuevoMaterial, setNuevoMaterial] = useState("")

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    categoria: "",
    descripcion: "",
    duracionHoras: "",
    tecnicosRequeridos: "",
    precioBase: "",
    tipoEquipo: "",
    frecuencia: "",
    instrucciones: "",
    observaciones: "",
    estado: "Activo",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    router.push("/taller/servicios")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const generarCodigo = () => {
    if (formData.categoria && formData.nombre) {
      const catCode = formData.categoria.substring(0, 4).toUpperCase()
      const nameCode = formData.nombre.substring(0, 3).toUpperCase().replace(/\s/g, "")
      const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      const codigo = `${catCode}-${nameCode}-${randomNum}`
      handleInputChange("codigo", codigo)
    }
  }

  const agregarMaterial = () => {
    if (nuevoMaterial && !materialesSeleccionados.includes(nuevoMaterial)) {
      setMaterialesSeleccionados([...materialesSeleccionados, nuevoMaterial])
      setNuevoMaterial("")
    }
  }

  const removerMaterial = (material: string) => {
    setMaterialesSeleccionados(materialesSeleccionados.filter((m) => m !== material))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/taller/servicios">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Servicio</h1>
          <p className="text-muted-foreground">Crear un nuevo servicio para el catálogo del taller</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Información Principal
                </CardTitle>
                <CardDescription>Datos básicos del servicio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo">Código del Servicio *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="codigo"
                        placeholder="Ej: MANT-ACE-001"
                        value={formData.codigo}
                        onChange={(e) => handleInputChange("codigo", e.target.value)}
                      />
                      <Button type="button" variant="outline" onClick={generarCodigo}>
                        Auto
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Servicio *</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Mantenimiento Preventivo Básico"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción *</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe detalladamente el servicio..."
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoEquipo">Tipo de Equipo *</Label>
                    <Select
                      value={formData.tipoEquipo}
                      onValueChange={(value) => handleInputChange("tipoEquipo", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposEquipo.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frecuencia">Frecuencia</Label>
                    <Input
                      id="frecuencia"
                      placeholder="Ej: Cada 250 horas"
                      value={formData.frecuencia}
                      onChange={(e) => handleInputChange("frecuencia", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instrucciones">Instrucciones de Trabajo</Label>
                  <Textarea
                    id="instrucciones"
                    placeholder="Instrucciones paso a paso para realizar el servicio..."
                    value={formData.instrucciones}
                    onChange={(e) => handleInputChange("instrucciones", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Observaciones adicionales..."
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange("observaciones", e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Materiales Incluidos */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Materiales Incluidos</CardTitle>
                <CardDescription>Materiales que se utilizan normalmente en este servicio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select value={nuevoMaterial} onValueChange={setNuevoMaterial}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialesDisponibles
                        .filter((material) => !materialesSeleccionados.includes(material))
                        .map((material) => (
                          <SelectItem key={material} value={material}>
                            {material}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={agregarMaterial} disabled={!nuevoMaterial}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {materialesSeleccionados.length > 0 && (
                  <div className="space-y-2">
                    <Label>Materiales Seleccionados:</Label>
                    <div className="flex flex-wrap gap-2">
                      {materialesSeleccionados.map((material) => (
                        <div
                          key={material}
                          className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                        >
                          <span>{material}</span>
                          <button
                            type="button"
                            onClick={() => removerMaterial(material)}
                            className="hover:bg-blue-200 rounded p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recursos y Costos */}
          <div className="space-y-6">
            {/* Recursos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recursos Requeridos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="duracionHoras">Duración (Horas) *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="duracionHoras"
                      type="number"
                      placeholder="0"
                      value={formData.duracionHoras}
                      onChange={(e) => handleInputChange("duracionHoras", e.target.value)}
                      className="pl-10"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tecnicosRequeridos">Técnicos Requeridos *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="tecnicosRequeridos"
                      type="number"
                      placeholder="1"
                      value={formData.tecnicosRequeridos}
                      onChange={(e) => handleInputChange("tecnicosRequeridos", e.target.value)}
                      className="pl-10"
                      min="1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Precio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Precio Base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="precioBase">Precio Base *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="precioBase"
                      type="number"
                      placeholder="0.00"
                      value={formData.precioBase}
                      onChange={(e) => handleInputChange("precioBase", e.target.value)}
                      className="pl-10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Cálculos automáticos */}
                {formData.duracionHoras && formData.precioBase && (
                  <div className="pt-3 border-t space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Precio por hora:</span>
                      <span className="font-medium">
                        $
                        {(Number.parseFloat(formData.precioBase) / Number.parseFloat(formData.duracionHoras)).toFixed(
                          2,
                        )}
                      </span>
                    </div>
                    {formData.tecnicosRequeridos && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Costo por técnico:</span>
                        <span className="font-medium">
                          $
                          {(
                            Number.parseFloat(formData.precioBase) / Number.parseFloat(formData.tecnicosRequeridos)
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estado */}
            <Card>
              <CardHeader>
                <CardTitle>Estado del Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t mt-4">
                  <h4 className="font-medium mb-2">Resumen</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Materiales:</span>
                      <span className="font-medium">{materialesSeleccionados.length} incluidos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Creado por:</span>
                      <span className="font-medium">Usuario Actual</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fecha:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4">
          <Link href="/taller/servicios">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Crear Servicio
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
