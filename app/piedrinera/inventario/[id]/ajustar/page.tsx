"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getSampleInventarioPiedrinera } from "@/lib/sample-data"
import type { InventarioPiedrineraItem } from "@/types/database"
import { ArrowLeft } from "lucide-react"

interface AjustarInventarioPiedrineraPageProps {
  params: {
    id: string
  }
}

export default function AjustarInventarioPiedrineraPage({ params }: AjustarInventarioPiedrineraPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const inventarioItems = getSampleInventarioPiedrinera()
  const itemOriginal = inventarioItems.find((i) => i.id === params.id)

  const [tipoAjuste, setTipoAjuste] = useState<"entrada" | "salida">("entrada")
  const [cantidadAjuste, setCantidadAjuste] = useState<number>(0)
  const [razonAjuste, setRazonAjuste] = useState<string>("")

  useEffect(() => {
    if (!itemOriginal) {
      toast({
        title: "Agregado no encontrado",
        description: `El agregado con ID ${params.id} no existe en el inventario.`,
        variant: "destructive",
      })
      router.replace("/piedrinera/inventario")
    }
  }, [itemOriginal, params.id, router, toast])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!itemOriginal) {
      toast({
        title: "Agregado no encontrado",
        description: `El agregado con ID ${params.id} no existe en el inventario.`,
        variant: "destructive",
      })
      router.replace("/piedrinera/inventario")
      return
    }

    if (cantidadAjuste <= 0 || !razonAjuste) {
      toast({
        title: "Error de validación",
        description: "Por favor, ingresa una cantidad válida y una razón para el ajuste.",
        variant: "destructive",
      })
      return
    }

    let newQuantity = itemOriginal.cantidadMetrosCubicos
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

    const updatedItem: InventarioPiedrineraItem = {
      ...itemOriginal,
      cantidadMetrosCubicos: newQuantity,
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
      description: `El stock de ${updatedItem.nombreAgregado} ha sido ajustado en ${tipoAjuste === "entrada" ? "+" : "-"}${cantidadAjuste} m³.`,
    })
    router.push("/piedrinera/inventario")
  }

  if (!itemOriginal) {
    return null // O un componente de carga/error
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Ajustar Inventario: {itemOriginal.nombreAgregado}</h1>
      </div>
      <p className="text-muted-foreground">
        Realiza ajustes manuales de entrada o salida en el inventario de agregados.
      </p>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Ajuste</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
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
              <Label htmlFor="cantidadAjuste">Cantidad a Ajustar (m³)</Label>
              <Input
                id="cantidadAjuste"
                type="number"
                value={cantidadAjuste}
                onChange={(e) => setCantidadAjuste(Number(e.target.value))}
                step="0.01"
                min="0.01"
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
