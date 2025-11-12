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
import { ArrowLeft, Save, Calendar, Clock, Wrench } from "lucide-react"
import Link from "next/link"

const equipos = [
  "Excavadora CAT 320D",
  "Camión Volvo FH16",
  "Retroexcavadora JCB 3CX",
  "Grúa Liebherr LTM 1050",
  "Compactadora Dynapac CA250",
  "Bulldozer CAT D6T",
  "Motoniveladora CAT 140M",
  "Cargador Frontal CAT 950M",
]

const tecnicos = [
  "Carlos Méndez",
  "Miguel Torres",
  "Ana Rodríguez",
  "Luis Vargas",
  "Pedro Jiménez",
  "Roberto Silva",
  "Antonio López",
  "María González",
]

export default function NuevaOrdenPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    equipo: "",
    tipo: "",
    descripcion: "",
    prioridad: "",
    tecnico: "",
    fechaEstimada: "",
    horasEstimadas: "",
    observaciones: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    router.push("/taller/ordenes")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/taller/ordenes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nueva Orden de Trabajo</h1>
          <p className="text-muted-foreground">Crear una nueva orden de mantenimiento o reparación</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Información Principal
                </CardTitle>
                <CardDescription>Datos básicos de la orden de trabajo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipo">Equipo *</Label>
                    <Select value={formData.equipo} onValueChange={(value) => handleInputChange("equipo", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar equipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipos.map((equipo) => (
                          <SelectItem key={equipo} value={equipo}>
                            {equipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Mantenimiento *</Label>
                    <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Preventivo">Preventivo</SelectItem>
                        <SelectItem value="Correctivo">Correctivo</SelectItem>
                        <SelectItem value="Predictivo">Predictivo</SelectItem>
                        <SelectItem value="Emergencia">Emergencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción del Trabajo *</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe detalladamente el trabajo a realizar..."
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prioridad">Prioridad *</Label>
                    <Select value={formData.prioridad} onValueChange={(value) => handleInputChange("prioridad", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baja">Baja</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Crítica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tecnico">Técnico Asignado *</Label>
                    <Select value={formData.tecnico} onValueChange={(value) => handleInputChange("tecnico", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        {tecnicos.map((tecnico) => (
                          <SelectItem key={tecnico} value={tecnico}>
                            {tecnico}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
          </div>

          {/* Programación */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Programación
                </CardTitle>
                <CardDescription>Fechas y tiempos estimados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaEstimada">Fecha Estimada *</Label>
                  <Input
                    id="fechaEstimada"
                    type="date"
                    value={formData.fechaEstimada}
                    onChange={(e) => handleInputChange("fechaEstimada", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horasEstimadas">Horas Estimadas *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="horasEstimadas"
                      type="number"
                      placeholder="0"
                      value={formData.horasEstimadas}
                      onChange={(e) => handleInputChange("horasEstimadas", e.target.value)}
                      className="pl-10"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>

                {/* Resumen */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Resumen</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estado:</span>
                      <span className="font-medium">Pendiente</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Creado por:</span>
                      <span className="font-medium">Usuario Actual</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fecha creación:</span>
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
          <Link href="/taller/ordenes">
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
                Crear Orden
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
