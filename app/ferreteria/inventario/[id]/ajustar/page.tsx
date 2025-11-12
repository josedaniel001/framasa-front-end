"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getSampleInventarioFerreteria, getSampleProductosFerreteria } from "@/lib/sample-data"
import { ArrowLeft, Package, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

interface AjustarInventarioItemPageProps {
  params: {
    id: string
  }
}

export default function AjustarInventarioItemPage({ params }: AjustarInventarioItemPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const inventarioItems = getSampleInventarioFerreteria()
  const productos = getSampleProductosFerreteria()

  const [itemOriginal, setItemOriginal] = useState(
    inventarioItems.find((item) => item.id === params.id)
  )

  const [tipoAjuste, setTipoAjuste] = useState<"entrada" | "salida" | "ajuste">("entrada")
  const [cantidadAjuste, setCantidadAjuste] = useState<number>(0)
  const [razonAjuste, setRazonAjuste] = useState<string>("")

  useEffect(() => {
    if (!itemOriginal) {
      toast({
        title: "Producto no encontrado",
        description: "El producto de inventario especificado no existe.",
        variant: "destructive",
      })
      router.replace("/ferreteria/inventario")
    }
  }, [itemOriginal, router, toast])

  if (!itemOriginal) {
    return null
  }

  const productoCompleto = productos.find((p) => p.id === itemOriginal.productoId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (cantidadAjuste <= 0 || !razonAjuste.trim()) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    let nuevaCantidad = itemOriginal.cantidad

    if (tipoAjuste === "entrada") {
      nuevaCantidad += cantidadAjuste
    } else if (tipoAjuste === "salida") {
      if (itemOriginal.cantidad < cantidadAjuste) {
        toast({
          title: "Error de ajuste",
          description: "La cantidad de salida no puede ser mayor que el stock actual.",
          variant: "destructive",
        })
        return
      }
      nuevaCantidad -= cantidadAjuste
    } else if (tipoAjuste === "ajuste") {
      if (cantidadAjuste < 0) {
        toast({
          title: "Error de ajuste",
          description: "La cantidad no puede ser negativa.",
          variant: "destructive",
        })
        return
      }
      nuevaCantidad = cantidadAjuste
    }

    // Aquí integrarías con tu backend para guardar el ajuste
    console.log("Ajuste de Inventario:", {
      itemId: itemOriginal.id,
      producto: itemOriginal.nombreProducto,
      tipoAjuste,
      cantidadAnterior: itemOriginal.cantidad,
      cantidadAjuste,
      cantidadNueva: nuevaCantidad,
      razonAjuste,
      fecha: new Date().toISOString(),
    })

    toast({
      title: "Inventario Ajustado",
      description: `El stock de ${itemOriginal.nombreProducto} ha sido ajustado exitosamente.`,
    })

    setTimeout(() => {
      router.push("/ferreteria/inventario")
    }, 1500)
  }

  const getTextoAjuste = () => {
    if (tipoAjuste === "entrada") {
      return `Cantidad actual: ${itemOriginal.cantidad} → Nueva cantidad: ${itemOriginal.cantidad + cantidadAjuste}`
    } else if (tipoAjuste === "salida") {
      return `Cantidad actual: ${itemOriginal.cantidad} → Nueva cantidad: ${itemOriginal.cantidad - cantidadAjuste}`
    } else {
      return `Cantidad actual: ${itemOriginal.cantidad} → Nueva cantidad: ${cantidadAjuste}`
    }
  }

  const diferenciaStock = itemOriginal.cantidad - itemOriginal.stockMinimo

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Link href="/ferreteria/inventario">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Ajustar Inventario: {itemOriginal.nombreProducto}</h1>
          <p className="text-muted-foreground">Realiza un ajuste manual de inventario para este producto.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Información del Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-semibold">{itemOriginal.nombreProducto}</p>
                <p className="text-sm text-muted-foreground">Código: {itemOriginal.codigo}</p>
              </div>
            </div>
            <div className="pt-2 border-t space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Categoría:</span>
                <span className="text-sm font-medium">{itemOriginal.categoria}</span>
              </div>
              {productoCompleto && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Unidad:</span>
                  <span className="text-sm font-medium capitalize">{productoCompleto.unidadMedida}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Precio Unitario:</span>
                <span className="text-sm font-medium">Q{itemOriginal.precioUnitario.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Stock Actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-3xl font-bold">{itemOriginal.cantidad}</p>
              <p className="text-xs text-muted-foreground">Unidades en inventario</p>
            </div>
            <div className="pt-2 border-t space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stock Mínimo:</span>
                <span className="text-sm font-medium">{itemOriginal.stockMinimo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Diferencia:</span>
                <Badge variant={diferenciaStock >= 0 ? "secondary" : "destructive"}>
                  {diferenciaStock >= 0 ? "+" : ""}{diferenciaStock}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Valor Total:</span>
                <span className="text-sm font-medium">
                  Q{(itemOriginal.cantidad * itemOriginal.precioUnitario).toFixed(2)}
                </span>
              </div>
            </div>
            {itemOriginal.cantidad <= itemOriginal.stockMinimo && (
              <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded text-destructive text-sm mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>Stock bajo mínimo</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumen del Ajuste</CardTitle>
          </CardHeader>
          <CardContent>
            {cantidadAjuste > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {tipoAjuste === "entrada" ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : tipoAjuste === "salida" ? (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  ) : (
                    <Package className="h-5 w-5 text-blue-500" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {tipoAjuste === "entrada"
                        ? "Entrada"
                        : tipoAjuste === "salida"
                          ? "Salida"
                          : "Ajuste Manual"}
                    </p>
                    <p className="text-xs text-muted-foreground">Tipo de movimiento</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm font-semibold text-muted-foreground">Previsualización:</p>
                  <p className="text-base font-medium mt-1">{getTextoAjuste()}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Completa el formulario para ver el resumen del ajuste.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Ajuste</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="tipoAjuste">Tipo de Ajuste</Label>
              <Select value={tipoAjuste} onValueChange={(value: "entrada" | "salida" | "ajuste") => setTipoAjuste(value)}>
                <SelectTrigger id="tipoAjuste">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada (Aumento de stock)</SelectItem>
                  <SelectItem value="salida">Salida (Disminución de stock)</SelectItem>
                  <SelectItem value="ajuste">Ajuste Manual (Cantidad exacta)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cantidadAjuste">
                {tipoAjuste === "ajuste" ? "Nueva Cantidad" : "Cantidad a Ajustar"}
              </Label>
              <Input
                id="cantidadAjuste"
                type="number"
                value={cantidadAjuste || ""}
                onChange={(e) => setCantidadAjuste(Number(e.target.value))}
                step="1"
                min={tipoAjuste === "ajuste" ? "0" : "0.01"}
                required
                placeholder={tipoAjuste === "ajuste" ? "Ingresa la cantidad final" : "Ingresa la cantidad"}
              />
              {tipoAjuste === "ajuste" && (
                <p className="text-xs text-muted-foreground">
                  Se establecerá la cantidad exacta especificada, independientemente del stock actual.
                </p>
              )}
            </div>
            {cantidadAjuste > 0 && (
              <div className="md:col-span-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {getTextoAjuste()}
                </p>
              </div>
            )}
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="razonAjuste">Razón del Ajuste *</Label>
              <Textarea
                id="razonAjuste"
                value={razonAjuste}
                onChange={(e) => setRazonAjuste(e.target.value)}
                placeholder="Describe el motivo del ajuste de inventario..."
                rows={3}
                required
              />
              <p className="text-xs text-muted-foreground">
                Ejemplo: "Corrección por conteo físico", "Mercancía dañada", "Devolución de cliente", "Stock inicial", etc.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link href="/ferreteria/inventario">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={cantidadAjuste <= 0 || !razonAjuste.trim()}>
            Aplicar Ajuste
          </Button>
        </div>
      </form>
    </div>
  )
}

