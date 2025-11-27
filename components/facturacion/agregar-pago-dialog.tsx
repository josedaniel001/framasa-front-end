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
import { API_ENDPOINTS } from "@/lib/api-config"
import { apiPost } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

interface AgregarPagoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  facturaId: number
  saldoPendiente: number
  onPagoAgregado: () => void
}

export function AgregarPagoDialog({
  open,
  onOpenChange,
  facturaId,
  saldoPendiente,
  onPagoAgregado,
}: AgregarPagoDialogProps) {
  const { toast } = useToast()
  const [tipoPago, setTipoPago] = useState<"EFECTIVO" | "TARJETA" | "FIADO">("EFECTIVO")
  const [monto, setMonto] = useState<string>("")
  const [referencia, setReferencia] = useState<string>("")
  const [observaciones, setObservaciones] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
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
        description: `El monto no puede ser mayor al saldo pendiente (Q${saldoPendiente.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const pagoData = {
        pagos: [
          {
            tipo_pago: tipoPago,
            monto: montoNumero,
            referencia: referencia.trim() || undefined,
            observaciones: observaciones.trim() || undefined,
          },
        ],
      }

      await apiPost<any>(API_ENDPOINTS.FACTURACION.FACTURA_AGREGAR_PAGOS_MULTIPLES(facturaId), pagoData)

      toast({
        title: "Pago Registrado",
        description: `Se ha registrado un pago de Q${montoNumero.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
      })

      // Resetear formulario
      setMonto("")
      setReferencia("")
      setObservaciones("")
      setTipoPago("EFECTIVO")

      onPagoAgregado()
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Registra un pago para la factura
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="saldo">Saldo Pendiente</Label>
            <Input
              id="saldo"
              value={`Q${saldoPendiente.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoPago">Tipo de Pago *</Label>
            <Select value={tipoPago} onValueChange={(value: any) => setTipoPago(value)}>
              <SelectTrigger id="tipoPago">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                <SelectItem value="TARJETA">Tarjeta</SelectItem>
                <SelectItem value="FIADO">Fiado</SelectItem>
              </SelectContent>
            </Select>
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
              Monto máximo: Q{saldoPendiente.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar Pago"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

