import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Registrar Nuevo Lote de Producción</h1>
      <p className="text-muted-foreground">Cargando formulario...</p>

      <form className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Lote de Producción</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="agregado">Agregado Producido</Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fechaProduccion">Fecha de Producción</Label>
              <Input id="fechaProduccion" type="date" disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cantidadProducidaMetrosCubicos">Cantidad Producida (m³)</Label>
              <Input id="cantidadProducidaMetrosCubicos" type="number" disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="costoTotalLote">Costo Total del Lote (Q)</Label>
              <Input id="costoTotalLote" type="number" disabled />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="supervisor">Supervisor</Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea id="notas" placeholder="Cargando..." disabled />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled>
            Cancelar
          </Button>
          <Button type="submit" disabled>
            Registrar Lote
          </Button>
        </div>
      </form>
    </div>
  )
}
