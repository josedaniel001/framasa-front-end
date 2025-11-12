"use client"

import { useState } from "react"
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
import { useToast } from "@/hooks/use-toast"
import type { VentaFerreteria, Pago } from "@/types/database"
import { EstadoPago } from "@/types/database"

interface RegistrarPagoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  venta: VentaFerreteria
  onPagoRegistrado: (pago: Pago) => void
}

export function RegistrarPagoDialog({
  open,
  onOpenChange,
  venta,
  onPagoRegistrado,
}: RegistrarPagoDialogProps) {
  const { toast } = useToast()
  const [monto, setMonto] = useState<string>("")
  const [fechaPago, setFechaPago] = useState<string>(new Date().toISOString().split("T")[0])
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "transferencia" | "cheque" | "otro">("efectivo")
  const [referencia, setReferencia] = useState<string>("")
  const [observaciones, setObservaciones] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const saldoPendiente = venta.saldoPendiente || venta.total - (venta.montoPagado || 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const montoNumero = parseFloat(monto)
    
    if (isNaN(montoNumero) || montoNumero <= 0) {
      toast({
        title: "Error de validación",
        description: "Por favor, ingresa un monto válido mayor a cero.",
        variant: "destructive",
      })
      return
    }

    if (montoNumero > saldoPendiente) {
      toast({
        title: "Error de validación",
        description: `El monto no puede ser mayor al saldo pendiente (Q${saldoPendiente.toFixed(2)}).`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simular guardado (en producción, aquí harías la llamada a la API)
    setTimeout(() => {
      const nuevoPago: Pago = {
        id: `pago-${Date.now()}`,
        ventaId: venta.id,
        monto: montoNumero,
        fechaPago: new Date(fechaPago),
        metodoPago: metodoPago,
        referencia: referencia || undefined,
        observaciones: observaciones || undefined,
        usuarioId: "1", // En producción, obtendrías esto del contexto de autenticación
        fechaCreacion: new Date(),
      }

      // Calcular nuevo estado de la venta
      const montoPagadoAnterior = venta.montoPagado || 0
      const nuevoMontoPagado = montoPagadoAnterior + montoNumero
      const nuevoSaldoPendiente = venta.total - nuevoMontoPagado

      let nuevoEstadoPago: EstadoPago
      if (nuevoSaldoPendiente <= 0) {
        nuevoEstadoPago = EstadoPago.PAGADO
      } else if (nuevoMontoPagado > 0 && nuevoMontoPagado < venta.total) {
        nuevoEstadoPago = EstadoPago.PARCIAL
      } else {
        nuevoEstadoPago = EstadoPago.PENDIENTE
      }

      onPagoRegistrado(nuevoPago)

      toast({
        title: "Pago Registrado",
        description: `Se ha registrado un pago de Q${montoNumero.toFixed(2)} para la venta ${venta.codigo}.`,
      })

      // Resetear formulario
      setMonto("")
      setFechaPago(new Date().toISOString().split("T")[0])
      setMetodoPago("efectivo")
      setReferencia("")
      setObservaciones("")
      setIsSubmitting(false)

      // Si está completamente pagado, cerrar el diálogo
      if (nuevoEstadoPago === EstadoPago.PAGADO) {
        onOpenChange(false)
      }
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Registra un pago para la venta {venta.codigo}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="saldo">Saldo Pendiente</Label>
            <Input
              id="saldo"
              value={`Q${saldoPendiente.toFixed(2)}`}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto del Pago *</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              min="0.01"
              max={saldoPendiente}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0.00"
              required
            />
            <p className="text-xs text-muted-foreground">
              Monto máximo: Q{saldoPendiente.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaPago">Fecha del Pago *</Label>
            <Input
              id="fechaPago"
              type="date"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metodoPago">Método de Pago *</Label>
            <Select value={metodoPago} onValueChange={(value: any) => setMetodoPago(value)}>
              <SelectTrigger id="metodoPago">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(metodoPago === "transferencia" || metodoPago === "cheque") && (
            <div className="space-y-2">
              <Label htmlFor="referencia">
                {metodoPago === "transferencia" ? "Número de Transacción" : "Número de Cheque"}
              </Label>
              <Input
                id="referencia"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder={
                  metodoPago === "transferencia"
                    ? "Ej: TRF-001234"
                    : "Ej: 123456"
                }
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar Pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

