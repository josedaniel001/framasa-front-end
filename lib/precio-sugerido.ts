/**
 * Calculadora de precio sugerido con IA
 * Basado en precio de costo, contexto de Guatemala y factores del mercado
 */

export type TipoModulo = 'FERRETERIA' | 'BLOQUERA' | 'PIEDRINERA'

interface ParametrosPrecio {
  costoUnitario: number
  tipoModulo: TipoModulo
  categoria?: string
  nombre?: string
}

interface PrecioSugerido {
  precio: number
  margenGanancia: number
  porcentajeGanancia: number
  razonamiento: string
}

/**
 * Factores de margen de ganancia por módulo (basados en mercado guatemalteco)
 */
const MARGENES_POR_MODULO: Record<TipoModulo, { min: number; max: number; promedio: number }> = {
  FERRETERIA: {
    min: 0.25, // 25% mínimo
    max: 0.60, // 60% máximo
    promedio: 0.40, // 40% promedio
  },
  BLOQUERA: {
    min: 0.20, // 20% mínimo
    max: 0.50, // 50% máximo
    promedio: 0.35, // 35% promedio
  },
  PIEDRINERA: {
    min: 0.15, // 15% mínimo
    max: 0.45, // 45% máximo
    promedio: 0.30, // 30% promedio
  },
}

/**
 * Factores adicionales basados en categorías comunes
 */
const FACTORES_CATEGORIA: Record<string, number> = {
  // Ferretería
  'Herramientas': 1.15, // 15% más caro
  'Materiales Eléctricos': 1.20,
  'Pinturas': 1.25,
  'Plomería': 1.10,
  'Construcción': 1.05,
  // Bloquera
  'Bloque de 15': 1.0,
  'Ladrillo': 1.0,
  'Adoquín': 1.15,
  // Piedrinera
  'Arena': 1.0,
  'Grava': 1.05,
  'Piedrín': 1.10,
  'Mezcla': 1.15,
}

/**
 * Calcula el precio sugerido usando IA (simulada con algoritmos inteligentes)
 * Basado en el contexto del mercado guatemalteco
 */
export async function calcularPrecioSugerido(
  parametros: ParametrosPrecio
): Promise<PrecioSugerido> {
  const { costoUnitario, tipoModulo, categoria, nombre } = parametros

  if (costoUnitario <= 0) {
    return {
      precio: 0,
      margenGanancia: 0,
      porcentajeGanancia: 0,
      razonamiento: 'El costo debe ser mayor a cero para calcular un precio sugerido.',
    }
  }

  // Obtener márgenes base del módulo
  const margenes = MARGENES_POR_MODULO[tipoModulo]

  // Calcular factor de categoría
  let factorCategoria = 1.0
  if (categoria) {
    const categoriaNormalizada = categoria.toLowerCase()
    for (const [key, factor] of Object.entries(FACTORES_CATEGORIA)) {
      if (categoriaNormalizada.includes(key.toLowerCase())) {
        factorCategoria = factor
        break
      }
    }
  }

  // Calcular margen dinámico basado en el costo
  // Productos de menor costo tienen márgenes más altos
  let margenAplicado = margenes.promedio

  if (costoUnitario < 10) {
    // Productos muy baratos: margen más alto
    margenAplicado = margenes.max * 0.9
  } else if (costoUnitario < 50) {
    // Productos de costo medio-bajo: margen promedio-alto
    margenAplicado = margenes.promedio * 1.1
  } else if (costoUnitario < 200) {
    // Productos de costo medio: margen promedio
    margenAplicado = margenes.promedio
  } else if (costoUnitario < 1000) {
    // Productos de costo alto: margen promedio-bajo
    margenAplicado = margenes.promedio * 0.9
  } else {
    // Productos muy caros: margen más bajo pero absoluto más alto
    margenAplicado = margenes.min * 1.2
  }

  // Aplicar factor de categoría
  margenAplicado *= factorCategoria

  // Asegurar que el margen esté dentro de los límites
  margenAplicado = Math.max(margenes.min, Math.min(margenes.max, margenAplicado))

  // Calcular precio sugerido
  const precioSugerido = costoUnitario * (1 + margenAplicado)

  // Redondear a 2 decimales
  const precioRedondeado = Math.round(precioSugerido * 100) / 100

  // Calcular margen de ganancia absoluto
  const margenGanancia = precioRedondeado - costoUnitario
  const porcentajeGanancia = (margenAplicado * 100)

  // Generar razonamiento
  const razonamiento = generarRazonamiento(
    tipoModulo,
    costoUnitario,
    precioRedondeado,
    margenAplicado,
    categoria
  )

  return {
    precio: precioRedondeado,
    margenGanancia,
    porcentajeGanancia: Math.round(porcentajeGanancia * 100) / 100,
    razonamiento,
  }
}

/**
 * Genera un razonamiento explicativo del precio sugerido
 */
function generarRazonamiento(
  tipoModulo: TipoModulo,
  costo: number,
  precio: number,
  margen: number,
  categoria?: string
): string {
  const margenPorcentaje = Math.round(margen * 100)
  const ganancia = precio - costo

  let razonamiento = `Precio sugerido basado en el mercado guatemalteco: `
  
  razonamiento += `Costo de Q${costo.toFixed(2)}, con un margen de ganancia del ${margenPorcentaje}% `
  razonamiento += `(${tipoModulo.toLowerCase()}), resulta en un precio de venta sugerido de Q${precio.toFixed(2)}. `
  razonamiento += `Esto genera una ganancia de Q${ganancia.toFixed(2)} por unidad.`

  if (categoria) {
    razonamiento += ` El factor de categoría "${categoria}" ha sido considerado en el cálculo.`
  }

  razonamiento += ` Este precio está alineado con las prácticas del mercado guatemalteco para este tipo de producto.`

  return razonamiento
}

/**
 * Calcula precio sugerido de forma síncrona (sin IA, solo cálculos)
 * Útil para cálculos rápidos en el frontend
 */
export function calcularPrecioSugeridoSync(
  parametros: ParametrosPrecio
): PrecioSugerido {
  const { costoUnitario, tipoModulo, categoria } = parametros

  if (costoUnitario <= 0) {
    return {
      precio: 0,
      margenGanancia: 0,
      porcentajeGanancia: 0,
      razonamiento: 'El costo debe ser mayor a cero.',
    }
  }

  const margenes = MARGENES_POR_MODULO[tipoModulo]
  let factorCategoria = 1.0

  if (categoria) {
    const categoriaNormalizada = categoria.toLowerCase()
    for (const [key, factor] of Object.entries(FACTORES_CATEGORIA)) {
      if (categoriaNormalizada.includes(key.toLowerCase())) {
        factorCategoria = factor
        break
      }
    }
  }

  let margenAplicado = margenes.promedio

  if (costoUnitario < 10) {
    margenAplicado = margenes.max * 0.9
  } else if (costoUnitario < 50) {
    margenAplicado = margenes.promedio * 1.1
  } else if (costoUnitario < 200) {
    margenAplicado = margenes.promedio
  } else if (costoUnitario < 1000) {
    margenAplicado = margenes.promedio * 0.9
  } else {
    margenAplicado = margenes.min * 1.2
  }

  margenAplicado *= factorCategoria
  margenAplicado = Math.max(margenes.min, Math.min(margenes.max, margenAplicado))

  const precioSugerido = costoUnitario * (1 + margenAplicado)
  const precioRedondeado = Math.round(precioSugerido * 100) / 100
  const margenGanancia = precioRedondeado - costoUnitario
  const porcentajeGanancia = Math.round(margenAplicado * 10000) / 100

  return {
    precio: precioRedondeado,
    margenGanancia,
    porcentajeGanancia,
    razonamiento: generarRazonamiento(tipoModulo, costoUnitario, precioRedondeado, margenAplicado, categoria),
  }
}

