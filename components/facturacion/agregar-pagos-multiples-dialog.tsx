"use client"

import { useState, useEffect } from "react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiGet, apiPost } from "@/lib/api-client"
import { Loader2, Plus, X, DollarSign } from "lucide-react"

interface PagoForm {
  tipo_pago: "EFECTIVO" | "TARJETA" | "FIADO"
  monto: string
  referencia: string
  observaciones: string
}

interface Cliente {
  id: number
  nombre: string
  permite_fiado?: boolean
  limite_credito?: number
  saldo_actual?: number
  credito_disponible?: number
}

interface AgregarPagosMultiplesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  facturaId: number | null
  clienteId: number
  totalFactura: number
  saldoPendiente: number
  onPagosAgregados: () => void
}

export function AgregarPagosMultiplesDialog({
  open,
  onOpenChange,
  facturaId,
  clienteId,
  totalFactura,
  saldoPendiente,
  onPagosAgregados,
}: AgregarPagosMultiplesDialogProps) {
  const { toast } = useToast()
  const { usuario } = useAuth()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loadingCliente, setLoadingCliente] = useState(false)
  const [pagos, setPagos] = useState<PagoForm[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cargar información del cliente al abrir el diálogo
  useEffect(() => {
    if (open && clienteId) {
      loadCliente()
      // Agregar un pago inicial vacío
      setPagos([
        {
          tipo_pago: "EFECTIVO",
          monto: "",
          referencia: "",
          observaciones: "",
        },
      ])
    } else if (!open) {
      // Resetear al cerrar
      setPagos([])
      setCliente(null)
    }
  }, [open, clienteId])

  const loadCliente = async () => {
    try {
      setLoadingCliente(true)
      const data = await apiGet<any>(API_ENDPOINTS.FERRETERIA.CLIENTES)
      const clientesData = Array.isArray(data) ? data : data?.results || data?.data || []
      const clienteData = clientesData.find((c: any) => c.id === clienteId)
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

  const agregarPago = () => {
    setPagos([
      ...pagos,
      {
        tipo_pago: "EFECTIVO",
        monto: "",
        referencia: "",
        observaciones: "",
      },
    ])
  }

  const eliminarPago = (index: number) => {
    setPagos(pagos.filter((_, i) => i !== index))
  }

  const actualizarPago = (index: number, campo: keyof PagoForm, valor: string) => {
    const nuevosPagos = [...pagos]
    nuevosPagos[index] = { ...nuevosPagos[index], [campo]: valor }
    setPagos(nuevosPagos)
  }

  const calcularTotalPagos = () => {
    return pagos.reduce((sum, pago) => {
      const monto = parseFloat(pago.monto) || 0
      return sum + monto
    }, 0)
  }

  const validarPagos = (): string | null => {
    const totalPagos = calcularTotalPagos()

    if (totalPagos <= 0) {
      return "Debes agregar al menos un pago con monto mayor a 0"
    }

    if (totalPagos > saldoPendiente) {
      return `El total de pagos (Q${totalPagos.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) excede el saldo pendiente (Q${saldoPendiente.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
    }

    // Validar pagos a fiado
    const totalFiado = pagos
      .filter((p) => p.tipo_pago === "FIADO")
      .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0)

    if (totalFiado > 0) {
      if (!cliente?.permite_fiado) {
        return "El cliente no tiene permitido el fiado"
      }

      const creditoDisponible = cliente.credito_disponible || 0
      if (totalFiado > creditoDisponible) {
        return `El monto a fiado (Q${totalFiado.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) excede el crédito disponible (Q${creditoDisponible.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
      }
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!facturaId) {
      toast({
        title: "Error",
        description: "No se encontró el ID de la factura. Vuelve a generar la venta.",
        variant: "destructive",
      })
      return
    }

    if (!usuario) {
      toast({
        title: "Error de autenticación",
        description: "No se pudo identificar al usuario. Inicia sesión nuevamente.",
        variant: "destructive",
      })
      return
    }

    const error = validarPagos()
    if (error) {
      toast({
        title: "Error de validación",
        description: error,
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const pagosData = pagos
        .filter((p) => parseFloat(p.monto) > 0)
        .map((p) => ({
          factura: facturaId,
          usuario: usuario.id,
          tipo_pago: p.tipo_pago,
          monto: parseFloat(p.monto),
          referencia: p.referencia.trim() || undefined,
          observaciones: p.observaciones.trim() || undefined,
        }))

      await apiPost<any>(API_ENDPOINTS.FACTURACION.FACTURA_AGREGAR_PAGOS_MULTIPLES(facturaId), {
        pagos: pagosData,
      })

      toast({
        title: "Pagos Registrados",
        description: `Se han registrado ${pagosData.length} pago(s) exitosamente.`,
      })

      onPagosAgregados()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error al agregar pagos:", error)
      const errorMessage = error.message || "No se pudieron registrar los pagos"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalPagos = calcularTotalPagos()
  const creditoDisponible = cliente?.credito_disponible || 0
  const totalFiado = pagos
    .filter((p) => p.tipo_pago === "FIADO")
    .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Pagos</DialogTitle>
          <DialogDescription>
            Registra uno o múltiples pagos para esta factura. Puedes combinar efectivo, tarjeta y fiado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información de saldo y crédito */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label className="text-xs text-muted-foreground">Saldo Pendiente</Label>
              <div className="text-lg font-bold">
                Q{saldoPendiente.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            {cliente?.permite_fiado && (
              <div>
                <Label className="text-xs text-muted-foreground">Crédito Disponible</Label>
                <div className="text-lg font-bold text-green-600">
                  Q{creditoDisponible.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            )}
          </div>

          {/* Lista de pagos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Pagos</Label>
              <Button type="button" variant="outline" size="sm" onClick={agregarPago}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Pago
              </Button>
            </div>

            {pagos.map((pago, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Pago {index + 1}</Label>
                  {pagos.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => eliminarPago(index)}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo de Pago *</Label>
                    <Select
                      value={pago.tipo_pago}
                      onValueChange={(value: any) => actualizarPago(index, "tipo_pago", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                        <SelectItem value="TARJETA">Tarjeta</SelectItem>
                        {cliente?.permite_fiado && <SelectItem value="FIADO">Fiado</SelectItem>}
                      </SelectContent>
                    </Select>
                    {pago.tipo_pago === "FIADO" && !cliente?.permite_fiado && (
                      <p className="text-xs text-red-500 mt-1">El cliente no permite fiado</p>
                    )}
                  </div>

                  <div>
                    <Label>Monto *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={pago.monto}
                      onChange={(e) => actualizarPago(index, "monto", e.target.value)}
                      placeholder="0.00"
                      required
                    />
                    {pago.tipo_pago === "FIADO" && parseFloat(pago.monto) > creditoDisponible && (
                      <p className="text-xs text-red-500 mt-1">
                        Excede crédito disponible (Q{creditoDisponible.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </p>
                    )}
                  </div>

                  {pago.tipo_pago === "TARJETA" && (
                    <div>
                      <Label>Número de Tarjeta / Referencia</Label>
                      <Input
                        value={pago.referencia}
                        onChange={(e) => actualizarPago(index, "referencia", e.target.value)}
                        placeholder="Ej: ****1234"
                      />
                    </div>
                  )}

                  <div className={pago.tipo_pago === "TARJETA" ? "" : "md:col-span-2"}>
                    <Label>Observaciones</Label>
                    <Textarea
                      value={pago.observaciones}
                      onChange={(e) => actualizarPago(index, "observaciones", e.target.value)}
                      placeholder="Notas adicionales..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Total de Pagos:</span>
              <span className="font-bold">
                Q{totalPagos.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {totalPagos > saldoPendiente && (
              <p className="text-sm text-red-500">
                El total excede el saldo pendiente por Q
                {(totalPagos - saldoPendiente).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
            {totalFiado > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total a Fiado:</span>
                  <span className="font-medium">Q{totalFiado.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {totalFiado > creditoDisponible && (
                  <p className="text-xs text-red-500">
                    Excede crédito disponible por Q
                    {(totalFiado - creditoDisponible).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span>Saldo Restante:</span>
              <span className={`font-bold ${saldoPendiente - totalPagos > 0 ? "text-red-600" : "text-green-600"}`}>
                Q{(saldoPendiente - totalPagos).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || pagos.length === 0}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Registrar Pagos
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

