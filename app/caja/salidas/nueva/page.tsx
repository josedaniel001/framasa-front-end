"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, MinusCircle, ArrowLeft, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface MovimientoSalida {
  id: string
  empresa: string
  monto: number
  descripcion: string
  referencia?: string
}

export default function NuevaSalidaCajaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [modoMultiple, setModoMultiple] = useState(false)
  const [movimientos, setMovimientos] = useState<MovimientoSalida[]>([])

  const [formData, setFormData] = useState({
    empresa: "",
    monto: "",
    descripcion: "",
    referencia: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const agregarMovimiento = () => {
    // Validaciones
    if (!formData.empresa) {
      toast({
        title: "Error",
        description: "Selecciona una empresa",
        variant: "destructive",
      })
      return
    }

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un monto válido mayor a 0",
        variant: "destructive",
      })
      return
    }

    if (!formData.descripcion.trim()) {
      toast({
        title: "Error",
        description: "Ingresa una descripción",
        variant: "destructive",
      })
      return
    }

    const nuevoMovimiento: MovimientoSalida = {
      id: Date.now().toString(),
      empresa: formData.empresa,
      monto: parseFloat(formData.monto),
      descripcion: formData.descripcion.trim(),
      referencia: formData.referencia.trim() || undefined,
    }

    setMovimientos(prev => [...prev, nuevoMovimiento])

    // Resetear formulario
    setFormData({
      empresa: "",
      monto: "",
      descripcion: "",
      referencia: "",
    })

    toast({
      title: "Movimiento Agregado",
      description: "El movimiento ha sido agregado a la lista",
    })
  }

  const eliminarMovimiento = (id: string) => {
    setMovimientos(prev => prev.filter(m => m.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (modoMultiple) {
      if (movimientos.length === 0) {
        toast({
          title: "Error",
          description: "Agrega al menos un movimiento",
          variant: "destructive",
        })
        return
      }
    } else {
      // Validaciones para modo simple
      if (!formData.empresa) {
        toast({
          title: "Error",
          description: "Selecciona una empresa",
          variant: "destructive",
        })
        return
      }

      if (!formData.monto || parseFloat(formData.monto) <= 0) {
        toast({
          title: "Error",
          description: "Ingresa un monto válido mayor a 0",
          variant: "destructive",
        })
        return
      }

      if (!formData.descripcion.trim()) {
        toast({
          title: "Error",
          description: "Ingresa una descripción",
          variant: "destructive",
        })
        return
      }
    }

    try {
      setSubmitting(true)

      const movimientosAEnviar = modoMultiple ? movimientos : [{
        empresa: formData.empresa,
        monto: parseFloat(formData.monto),
        descripcion: formData.descripcion.trim(),
        referencia: formData.referencia.trim() || undefined,
      }]

      // Simulación de API call - en producción esto iría a la API real
      const salidasData = movimientosAEnviar.map(movimiento => ({
        tipo: 'SALIDA',
        empresa: movimiento.empresa,
        monto: movimiento.monto,
        descripcion: movimiento.descripcion,
        referencia: movimiento.referencia,
        fecha: new Date().toISOString(),
      }))

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log("Nuevas salidas de caja:", salidasData)

      const totalMovimientos = salidasData.length
      const totalMonto = salidasData.reduce((sum, salida) => sum + salida.monto, 0)

      toast({
        title: "Salidas Registradas",
        description: `${totalMovimientos} salida(s) por un total de Q${totalMonto.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} registrada(s) exitosamente`,
      })

      // Redirigir a la página principal de caja
      router.push("/caja")

    } catch (error: any) {
      console.error("Error al registrar salidas:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudieron registrar las salidas",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const totalMovimientos = modoMultiple
    ? movimientos.reduce((sum, m) => sum + m.monto, 0)
    : (formData.monto ? parseFloat(formData.monto) : 0)

  const formatMonto = (monto: number) => {
    return `Q${monto.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Link href="/caja">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nueva Salida de Caja</h1>
          <p className="text-muted-foreground">Registra una nueva salida de efectivo del sistema de caja.</p>
        </div>
      </div>

      {/* Switch para modo múltiple */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Registro Múltiple</Label>
              <p className="text-sm text-muted-foreground">
                Permite registrar múltiples salidas en una sola operación
              </p>
            </div>
            <Switch
              checked={modoMultiple}
              onCheckedChange={setModoMultiple}
            />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Salida</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="empresa">Empresa *</Label>
                <Select
                  value={formData.empresa}
                  onValueChange={(value) => handleInputChange("empresa", value)}
                >
                  <SelectTrigger id="empresa">
                    <SelectValue placeholder="Selecciona una empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FERRETERIA">Ferretería</SelectItem>
                    <SelectItem value="BLOQUERA">Bloquera</SelectItem>
                    <SelectItem value="PIEDRINERA">Piedrinera</SelectItem>
                    <SelectItem value="TALLER">Taller</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="monto">Monto (Q) *</Label>
                <Input
                  id="monto"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.monto}
                  onChange={(e) => handleInputChange("monto", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe el motivo de la salida (ej: Pago de servicios, compra de materiales, etc.)"
                value={formData.descripcion}
                onChange={(e) => handleInputChange("descripcion", e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="referencia">Referencia (Opcional)</Label>
              <Input
                id="referencia"
                type="text"
                placeholder="Número de recibo, factura, etc."
                value={formData.referencia}
                onChange={(e) => handleInputChange("referencia", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Referencia opcional para identificar la transacción (número de recibo, factura, etc.)
              </p>
            </div>

            {modoMultiple && (
              <div className="flex justify-end pt-4">
                <Button type="button" onClick={agregarMovimiento} variant="outline">
                  <MinusCircle className="mr-2 h-4 w-4" />
                  Agregar Movimiento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla de movimientos múltiples */}
        {modoMultiple && movimientos.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Movimientos Agregados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientos.map((movimiento) => (
                    <TableRow key={movimiento.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {movimiento.empresa === "FERRETERIA" ? "Ferretería" :
                           movimiento.empresa === "BLOQUERA" ? "Bloquera" :
                           movimiento.empresa === "PIEDRINERA" ? "Piedrinera" :
                           movimiento.empresa === "TALLER" ? "Taller" : movimiento.empresa}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={movimiento.descripcion}>
                        {movimiento.descripcion}
                      </TableCell>
                      <TableCell className="font-medium text-red-600">
                        -{formatMonto(movimiento.monto)}
                      </TableCell>
                      <TableCell>
                        {movimiento.referencia && (
                          <Badge variant="secondary">{movimiento.referencia}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarMovimiento(movimiento.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            {modoMultiple ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total de Movimientos:</span>
                  <span className="font-medium">{movimientos.length}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                  <span>Total a Registrar:</span>
                  <span className="text-red-600">-{formatMonto(totalMovimientos)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Tipo de Movimiento:</span>
                  <span className="text-red-600">SALIDAS MÚLTIPLES</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empresa:</span>
                  <span className="font-medium">
                    {formData.empresa === "FERRETERIA" ? "Ferretería" :
                     formData.empresa === "BLOQUERA" ? "Bloquera" :
                     formData.empresa === "PIEDRINERA" ? "Piedrinera" :
                     formData.empresa === "TALLER" ? "Taller" : "No seleccionada"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto:</span>
                  <span className="font-medium text-red-600">
                    -{formatMonto(totalMovimientos)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Tipo de Movimiento:</span>
                  <span className="text-red-600">SALIDA</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 mt-4">
          <Link href="/caja">
            <Button type="button" variant="outline" disabled={submitting}>
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <MinusCircle className="mr-2 h-4 w-4" />
                {modoMultiple ? `Registrar ${movimientos.length} Salidas` : "Registrar Salida"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
