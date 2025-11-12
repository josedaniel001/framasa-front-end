import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Nuevo Despacho</h1>
      <p className="text-muted-foreground">Cargando formulario...</p>

      <form className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Despacho</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha de Despacho</Label>
              <Input id="fecha" type="date" disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="camion">Camión</Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="piloto">Piloto</Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="agregado">Agregado</Label>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cantidadMetrosCubicos">Cantidad (m³)</Label>
              <Input id="cantidadMetrosCubicos" type="number" disabled />
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
            Crear Despacho
          </Button>
        </div>
      </form>
    </div>
  )
}
