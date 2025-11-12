"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getSampleInventarioBloquera } from "@/lib/sample-data"
import type { InventarioBloqueraItem } from "@/types/database"
import { ArrowLeft } from "lucide-react"

export default function AjustarInventarioBloqueraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const inventarioItems = getSampleInventarioBloquera()

  const [itemSeleccionado, setItemSeleccionado] = useState<string>("")
  const [tipoAjuste, setTipoAjuste] = useState<"entrada" | "salida">("entrada")
  const [cantidadAjuste, setCantidadAjuste] = useState<number>(0)
  const [razonAjuste, setRazonAjuste] = useState<string>("")

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemSeleccionado || cantidadAjuste <= 0 || !razonAjuste) {
      toast({
        title: "Error de validación",
        description: "Por favor, selecciona un artículo, ingresa una cantidad válida y una razón para el ajuste.",
        variant: "destructive",
      })
      return
    }

    const itemToAdjust = inventarioItems.find((item) => item.id === itemSeleccionado)
    if (!itemToAdjust) {
      toast({
        title: "Error",
        description: "Artículo de inventario no encontrado.",
        variant: "destructive",
      })
      return
    }

    let newQuantity = itemToAdjust.cantidad
    if (tipoAjuste === "entrada") {
      newQuantity += cantidadAjuste
    } else {
      if (newQuantity < cantidadAjuste) {
        toast({
          title: "Error de ajuste",
          description: "La cantidad de salida no puede ser mayor que el stock actual.",
          variant: "destructive",
        })
        return
      }
      newQuantity -= cantidadAjuste
    }

    const updatedItem: InventarioBloqueraItem = {
      ...itemToAdjust,
      cantidad: newQuantity,
      ultimaActualizacion: new Date().toISOString().split("T")[0],
    }

    console.log("Ajuste de Inventario:", {
      item: updatedItem,
      tipoAjuste,
      cantidadAjuste,
      razonAjuste,
    })
    // Aquí integrarías con tu backend para guardar el ajuste
    toast({
      title: "Inventario Ajustado",
      description: `El stock de ${updatedItem.nombreProducto} ha sido ajustado en ${tipoAjuste === "entrada" ? "+" : "-"}${cantidadAjuste}.`,
    })
    router.push("/bloquera/inventario")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Ajustar Inventario de Bloquera</h1>
      </div>
      <p className="text-muted-foreground">Realiza ajustes manuales de entrada o salida en el inventario de bloques.</p>

      <form onSubmit={handleAdjust} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Ajuste</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="item">Artículo de Inventario</Label>
              <Select value={itemSeleccionado} onValueChange={setItemSeleccionado}>
                <SelectTrigger id="item">
                  <SelectValue placeholder="Selecciona un artículo" />
                </SelectTrigger>
                <SelectContent>
                  {inventarioItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.nombreProducto} ({item.codigo}) - Stock: {item.cantidad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipoAjuste">Tipo de Ajuste</Label>
              <Select value={tipoAjuste} onValueChange={(value: "entrada" | "salida") => setTipoAjuste(value)}>
                <SelectTrigger id="tipoAjuste">
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada (Aumento)</SelectItem>
                  <SelectItem value="salida">Salida (Disminución)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cantidadAjuste">Cantidad a Ajustar</Label>
              <Input
                id="cantidadAjuste"
                type="number"
                value={cantidadAjuste}
                onChange={(e) => setCantidadAjuste(Number(e.target.value))}
                min="1"
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="razonAjuste">Razón del Ajuste</Label>
              <Textarea
                id="razonAjuste"
                placeholder="Ej: Inventario físico, devolución, merma, etc."
                value={razonAjuste}
                onChange={(e) => setRazonAjuste(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit">Realizar Ajuste</Button>
        </div>
      </form>
    </div>
  )
}
