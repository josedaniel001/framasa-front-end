"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getSampleInventarioFerreteria } from "@/lib/sample-data"
import { ArrowLeft, Package, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AjustarInventarioFerreteriaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const inventarioItems = getSampleInventarioFerreteria()

  const [itemSeleccionado, setItemSeleccionado] = useState<string>("")
  const [tipoAjuste, setTipoAjuste] = useState<"entrada" | "salida" | "ajuste">("entrada")
  const [cantidadAjuste, setCantidadAjuste] = useState<number>(0)
  const [razonAjuste, setRazonAjuste] = useState<string>("")

  const itemSeleccionadoData = inventarioItems.find((item) => item.id === itemSeleccionado)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemSeleccionado || cantidadAjuste <= 0 || !razonAjuste.trim()) {
      toast({
        title: "Error de validación",
        description: "Por favor, completa todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    if (!itemSeleccionadoData) {
      toast({
        title: "Error",
        description: "Producto de inventario no encontrado.",
        variant: "destructive",
      })
      return
    }

    let nuevaCantidad = itemSeleccionadoData.cantidad

    if (tipoAjuste === "entrada") {
      nuevaCantidad += cantidadAjuste
    } else if (tipoAjuste === "salida") {
      if (itemSeleccionadoData.cantidad < cantidadAjuste) {
        toast({
          title: "Error de ajuste",
          description: "La cantidad de salida no puede ser mayor que el stock actual.",
          variant: "destructive",
        })
        return
      }
      nuevaCantidad -= cantidadAjuste
    } else if (tipoAjuste === "ajuste") {
      // Ajuste manual: establecer cantidad exacta
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
      itemId: itemSeleccionado,
      producto: itemSeleccionadoData.nombreProducto,
      tipoAjuste,
      cantidadAnterior: itemSeleccionadoData.cantidad,
      cantidadAjuste,
      cantidadNueva: nuevaCantidad,
      razonAjuste,
      fecha: new Date().toISOString(),
    })

    toast({
      title: "Inventario Ajustado",
      description: `El stock de ${itemSeleccionadoData.nombreProducto} ha sido ajustado. Nueva cantidad: ${nuevaCantidad}`,
    })

    // Resetear formulario
    setItemSeleccionado("")
    setTipoAjuste("entrada")
    setCantidadAjuste(0)
    setRazonAjuste("")

    // Opcional: redirigir después de un breve delay
    setTimeout(() => {
      router.push("/ferreteria/inventario")
    }, 1500)
  }

  const getTextoAjuste = () => {
    if (!itemSeleccionadoData) return ""
    if (tipoAjuste === "entrada") {
      return `Cantidad actual: ${itemSeleccionadoData.cantidad} → Nueva cantidad: ${itemSeleccionadoData.cantidad + cantidadAjuste}`
    } else if (tipoAjuste === "salida") {
      return `Cantidad actual: ${itemSeleccionadoData.cantidad} → Nueva cantidad: ${itemSeleccionadoData.cantidad - cantidadAjuste}`
    } else {
      return `Cantidad actual: ${itemSeleccionadoData.cantidad} → Nueva cantidad: ${cantidadAjuste}`
    }
  }

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
          <h1 className="text-3xl font-bold">Ajustar Inventario</h1>
          <p className="text-muted-foreground">Realiza ajustes manuales de entrada, salida o corrección en el inventario.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="producto">Producto</Label>
              <Select value={itemSeleccionado} onValueChange={setItemSeleccionado}>
                <SelectTrigger id="producto">
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {inventarioItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{item.codigo} - {item.nombreProducto}</span>
                        <Badge variant={item.cantidad <= item.stockMinimo ? "destructive" : "secondary"} className="ml-2">
                          Stock: {item.cantidad}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {itemSeleccionadoData && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-semibold">{itemSeleccionadoData.nombreProducto}</p>
                    <p className="text-sm text-muted-foreground">
                      Código: {itemSeleccionadoData.codigo} | Categoría: {itemSeleccionadoData.categoria}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Actual</p>
                    <p className="text-lg font-bold">{itemSeleccionadoData.cantidad}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock Mínimo</p>
                    <p className="text-lg font-bold">{itemSeleccionadoData.stockMinimo}</p>
                  </div>
                </div>
                {itemSeleccionadoData.cantidad <= itemSeleccionadoData.stockMinimo && (
                  <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>El stock actual está por debajo del mínimo requerido</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
            </div>
            {itemSeleccionadoData && cantidadAjuste > 0 && (
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
                Ejemplo: "Corrección por conteo físico", "Mercancía dañada", "Devolución de cliente", etc.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link href="/ferreteria/inventario">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={!itemSeleccionado || cantidadAjuste <= 0 || !razonAjuste.trim()}>
            Aplicar Ajuste
          </Button>
        </div>
      </form>
    </div>
  )
}

