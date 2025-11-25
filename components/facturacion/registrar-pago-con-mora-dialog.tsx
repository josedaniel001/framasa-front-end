"use client"

import { useState, useEffect } from "react"
import type React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { Loader2, DollarSign, AlertTriangle, Calculator } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Factura {
  id: number
  numero_factura: string
  cliente_id: number
  cliente_nombre: string
  total: number
  saldo_pendiente: number
  fecha_vencimiento: string | null
  estado: string
}

interface Cliente {
  id: number
  nombre: string
  permite_fiado?: boolean
  limite_credito?: number
  saldo_actual?: number
  credito_disponible?: number
}

interface RegistrarPagoConMoraDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  factura: Factura
  onPagoRegistrado: () => void
}

export function RegistrarPagoConMoraDialog({
  open,
  onOpenChange,
  factura,
  onPagoRegistrado,
}: RegistrarPagoConMoraDialogProps) {
  const { toast } = useToast()
  const { usuario } = useAuth()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loadingCliente, setLoadingCliente] = useState(false)
  const [tipoPago, setTipoPago] = useState<"EFECTIVO" | "TARJETA">("EFECTIVO")
  const [monto, setMonto] = useState<string>("")
  const [referencia, setReferencia] = useState<string>("")
  const [observaciones, setObservaciones] = useState<string>("")
  const [aplicarMora, setAplicarMora] = useState(false)
  const [moraPorcentaje, setMoraPorcentaje] = useState<string>("5")
  const [moraMonto, setMoraMonto] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calcular días vencidos
  const diasVencidos = factura.fecha_vencimiento
    ? Math.max(0, Math.floor((new Date().getTime() - new Date(factura.fecha_vencimiento).getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const estaVencida = diasVencidos > 0

  // Cargar información del cliente
  useEffect(() => {
    if (open && factura.cliente_id) {
      loadCliente()
      // Establecer monto inicial como saldo pendiente
      setMonto(factura.saldo_pendiente.toString())
    } else if (!open) {
      // Resetear al cerrar
      setMonto("")
      setReferencia("")
      setObservaciones("")
      setTipoPago("EFECTIVO")
      setAplicarMora(false)
      setMoraPorcentaje("5")
      setMoraMonto(0)
    }
  }, [open, factura])

  // Calcular mora cuando cambian los valores
  useEffect(() => {
    if (aplicarMora && estaVencida && moraPorcentaje) {
      const porcentaje = parseFloat(moraPorcentaje) || 0
      const montoBase = parseFloat(monto) || factura.saldo_pendiente
      const mora = (montoBase * porcentaje) / 100
      setMoraMonto(mora)
    } else {
      setMoraMonto(0)
    }
  }, [aplicarMora, moraPorcentaje, monto, factura.saldo_pendiente, estaVencida])

  const loadCliente = async () => {
    try {
      setLoadingCliente(true)
      const data = await apiGet<any>(API_ENDPOINTS.FERRETERIA.CLIENTES)
      const clientesData = Array.isArray(data) ? data : data?.results || data?.data || []
      const clienteData = clientesData.find((c: any) => c.id === factura.cliente_id)
      if (clienteData) {
        setCliente({
          id: clienteData.id,
          nombre: clienteData.nombre,
          permite_fiado: clienteData.permite_fiado || clienteData.permiteFiado || false,
          limite_credito: clienteData.limite_credito || clienteData.limiteCredito || 0,
          saldo_actual: clienteData.saldo_actual || clienteData.saldoActual || 0,
          credito_disponible: clienteData.credito_disponible || clienteData.creditoDisponible || 0,
        })
      }
    } catch (error) {
      console.error("Error al cargar cliente:", error)
    } finally {
      setLoadingCliente(false)
    }
  }

  const totalConMora = () => {
    const montoNumero = parseFloat(monto) || 0
    return montoNumero + moraMonto
  }

  // Función para calcular mora automáticamente basada en días de atraso
  const calcularMoraAutomatica = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    if (!estaVencida || diasVencidos <= 0) {
      toast({
        title: "Información",
        description: "La factura no está vencida, no se puede calcular mora.",
        variant: "default",
      })
      return
    }

    // Si no hay monto establecido, usar el saldo pendiente completo
    const montoBase = parseFloat(monto) || factura.saldo_pendiente
    if (!monto || monto === "0" || monto === "") {
      setMonto(factura.saldo_pendiente.toString())
    }

    // Calcular porcentaje de mora basado en días de atraso
    // Ejemplo: 1% por cada 30 días de atraso, mínimo 1%
    const periodos30Dias = Math.ceil(diasVencidos / 30)
    const porcentajeCalculado = Math.max(1, periodos30Dias) // Mínimo 1%, aumenta por cada 30 días

    // Activar mora y establecer porcentaje
    setAplicarMora(true)
    setMoraPorcentaje(porcentajeCalculado.toString())

    toast({
      title: "Mora Calculada",
      description: `Se ha calculado una mora del ${porcentajeCalculado}% basada en ${diasVencidos} día(s) de atraso.`,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!usuario) {
      toast({
        title: "Error de autenticación",
        description: "No se pudo obtener la información del usuario. Por favor, inicia sesión de nuevo.",
        variant: "destructive",
      })
      return
    }

    const montoNumero = parseFloat(monto)

    if (isNaN(montoNumero) || montoNumero <= 0) {
      toast({
        title: "Error de validación",
        description: "Por favor, ingresa un monto válido mayor a cero.",
        variant: "destructive",
      })
      return
    }

    if (montoNumero > factura.saldo_pendiente) {
      toast({
        title: "Error de validación",
        description: `El monto no puede ser mayor al saldo pendiente (Q${factura.saldo_pendiente.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).`,
        variant: "destructive",
      })
      return
    }

    // No se permite fiado en cuentas por cobrar
    if (tipoPago === "FIADO") {
      toast({
        title: "Error",
        description: "No se puede pagar una cuenta por cobrar con fiado. Solo se permite efectivo o tarjeta.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Si hay mora, crear un pago adicional para la mora
      const pagos: any[] = [
        {
          factura: factura.id,
          usuario: usuario.id,
          tipo_pago: tipoPago,
          monto: montoNumero,
          referencia: referencia.trim() || undefined,
          observaciones: observaciones.trim() || undefined,
        },
      ]

      // Si se aplica mora, agregar un pago adicional para la mora
      if (aplicarMora && moraMonto > 0) {
        pagos.push({
          factura: factura.id,
          usuario: usuario.id,
          tipo_pago: tipoPago, // La mora se paga con el mismo método
          monto: moraMonto,
          referencia: referencia.trim() || undefined,
          observaciones: `Mora por ${diasVencidos} día(s) vencido(s) - ${moraPorcentaje}%`,
        })
      }

      await apiPost<any>(API_ENDPOINTS.FACTURACION.FACTURA_AGREGAR_PAGOS_MULTIPLES(factura.id), {
        pagos,
      })

      toast({
        title: "Pago Registrado",
        description: `Se ha registrado el pago${aplicarMora && moraMonto > 0 ? ` con mora de Q${moraMonto.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""}.`,
      })

      onPagoRegistrado()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error al agregar pago:", error)
      const errorMessage = error.message || "No se pudo registrar el pago"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Registra un pago para la factura {factura.numero_factura}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Información de la factura */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium">{factura.cliente_nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saldo Pendiente:</span>
                <span className="font-bold">
                  Q{factura.saldo_pendiente.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {factura.fecha_vencimiento && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha Vencimiento:</span>
                  <span className={estaVencida ? "font-semibold text-red-600" : ""}>
                    {new Date(factura.fecha_vencimiento).toLocaleDateString("es-GT")}
                    {estaVencida && ` (${diasVencidos} día(s) vencido(s))`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Opción de mora - siempre visible */}
          <Card className={`border-orange-200 ${estaVencida ? "bg-orange-50 dark:bg-orange-950/20" : "bg-gray-50 dark:bg-gray-950/20"}`}>
            <CardContent className="pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${estaVencida ? "text-orange-600" : "text-gray-600"}`} />
                  <Label htmlFor="aplicarMora" className="font-medium text-sm sm:text-base">
                    Aplicar Mora por Vencimiento
                    {estaVencida && <span className="text-red-600 ml-1 text-xs sm:text-sm">({diasVencidos} día(s) vencido(s))</span>}
                  </Label>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={calcularMoraAutomatica}
                    className="text-xs whitespace-nowrap"
                    disabled={!estaVencida}
                    title={!estaVencida ? "La factura no está vencida" : "Calcular mora automáticamente"}
                  >
                    <Calculator className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Calcular Automático</span>
                    <span className="sm:hidden">Calcular</span>
                  </Button>
                  <Switch
                    id="aplicarMora"
                    checked={aplicarMora}
                    onCheckedChange={setAplicarMora}
                  />
                </div>
              </div>
                {aplicarMora && (
                  <div className="space-y-2 pl-0 sm:pl-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="moraPorcentaje">Porcentaje de Mora (%)</Label>
                        <Input
                          id="moraPorcentaje"
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={moraPorcentaje}
                          onChange={(e) => setMoraPorcentaje(e.target.value)}
                          placeholder="5"
                          className="w-full"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="w-full">
                          <Label>Mora Calculada</Label>
                          <div className="text-base sm:text-lg font-bold text-orange-600">
                            Q{moraMonto.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      La mora se calculará sobre el monto del pago.
                      {estaVencida && ` ${diasVencidos} día(s) vencido(s).`}
                      {!estaVencida && " Puedes calcular mora manualmente ingresando un porcentaje."}
                    </p>
                  </div>
                )}
                {!estaVencida && !aplicarMora && (
                  <p className="text-xs text-muted-foreground pl-0 sm:pl-6">
                    La factura no está vencida. Puedes activar la mora manualmente si es necesario.
                  </p>
                )}
              </CardContent>
            </Card>

          <div className="space-y-2">
            <Label htmlFor="tipoPago">Tipo de Pago *</Label>
            <Select value={tipoPago} onValueChange={(value: any) => setTipoPago(value)}>
              <SelectTrigger id="tipoPago">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                <SelectItem value="TARJETA">Tarjeta</SelectItem>
                {/* No se permite fiado en cuentas por cobrar - ya es una deuda pendiente */}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Solo se permite efectivo o tarjeta para pagar cuentas por cobrar.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto del Pago *</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              min="0.01"
              max={factura.saldo_pendiente}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0.00"
              required
            />
            <p className="text-xs text-muted-foreground">
              Monto máximo: Q{factura.saldo_pendiente.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {tipoPago === "TARJETA" && (
            <div className="space-y-2">
              <Label htmlFor="referencia">Número de Tarjeta / Referencia</Label>
              <Input
                id="referencia"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ej: ****1234"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas adicionales sobre el pago..."
              rows={3}
            />
          </div>

          {/* Resumen */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Monto del Pago:</span>
                <span className="font-medium">
                  Q{(parseFloat(monto) || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {aplicarMora && moraMonto > 0 && (
                <div className="flex justify-between">
                  <span>Mora ({moraPorcentaje}%):</span>
                  <span className="font-medium text-orange-600">
                    Q{moraMonto.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-bold text-lg">
                <span>Total a Pagar:</span>
                <span>
                  Q{totalConMora().toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="sticky bottom-0 bg-background border-t pt-4 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Registrar Pago
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

