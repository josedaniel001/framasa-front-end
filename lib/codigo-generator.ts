/**
 * Generador de códigos automáticos para productos
 * Genera códigos basados en módulo, categoría/tipo, nombre y numeración
 * 
 * SOLO PARA: Ferretería, Bloquera, Piedrinera
 */

// ============================================================
// SECCIÓN 1: GENERADOR DE CÓDIGOS PARA PRODUCTOS
// (Ferretería, Bloquera, Piedrinera)
// ============================================================

export type ModuloProducto = 'FERRETERIA' | 'BLOQUERA' | 'PIEDRINERA'

// Alias para compatibilidad con código existente
export type Modulo = ModuloProducto

/**
 * Genera un código automático para un producto
 * 
 * Formato: [PREFIJO]-[CATEGORIA/TIPO]-[INICIALES]-[NUMERO]
 * 
 * Ejemplos:
 * - Ferretería: FERR-CAT-ABC-001
 * - Bloquera: BLOQ-BLO-ABC-001
 * - Piedrinera: PIED-ARE-ABC-001
 */
export function generarCodigoProducto(
  modulo: ModuloProducto,
  categoriaTipo: string,
  nombre: string,
  numeroSecuencial: number
): string {
  // Prefijo del módulo
  const prefijo = getPrefijoModuloProducto(modulo)
  
  // Abreviatura de categoría/tipo (máximo 3-4 caracteres)
  const abrevCategoria = obtenerAbreviaturaProducto(categoriaTipo, 3)
  
  // Iniciales del nombre (máximo 3 caracteres)
  const iniciales = obtenerInicialesProducto(nombre, 3)
  
  // Número secuencial con padding de 3 dígitos
  const numero = numeroSecuencial.toString().padStart(3, '0')
  
  return `${prefijo}-${abrevCategoria}-${iniciales}-${numero}`
}

/**
 * Obtiene el prefijo del módulo de productos
 */
function getPrefijoModuloProducto(modulo: ModuloProducto): string {
  const prefijos: Record<ModuloProducto, string> = {
    FERRETERIA: 'FERR',
    BLOQUERA: 'BLOQ',
    PIEDRINERA: 'PIED',
  }
  return prefijos[modulo]
}

/**
 * Obtiene una abreviatura de un texto para productos
 * Toma las primeras letras mayúsculas o las primeras letras de cada palabra
 */
function obtenerAbreviaturaProducto(texto: string, maxLength: number): string {
  if (!texto) return 'GEN'
  
  // Limpiar y normalizar
  const limpio = texto.trim().toUpperCase()
  
  // Si tiene espacios, tomar primera letra de cada palabra
  if (limpio.includes(' ')) {
    const palabras = limpio.split(' ').filter(p => p.length > 0)
    const abrev = palabras
      .slice(0, maxLength)
      .map(p => p[0])
      .join('')
    return abrev.padEnd(maxLength, 'X').substring(0, maxLength)
  }
  
  // Si no tiene espacios, tomar las primeras letras
  // Filtrar solo letras
  const letras = limpio.replace(/[^A-Z]/g, '')
  if (letras.length === 0) return 'GEN'
  
  return letras.substring(0, maxLength).padEnd(maxLength, 'X')
}

/**
 * Obtiene las iniciales de un nombre de producto
 * Toma la primera letra de cada palabra (máximo maxLength palabras)
 */
function obtenerInicialesProducto(nombre: string, maxLength: number): string {
  if (!nombre) return 'XXX'
  
  const palabras = nombre
    .trim()
    .split(/\s+/)
    .filter(p => p.length > 0)
    .slice(0, maxLength)
  
  if (palabras.length === 0) return 'XXX'
  
  const iniciales = palabras
    .map(p => {
      // Tomar la primera letra válida
      const primeraLetra = p.match(/[A-Za-z]/)?.[0]
      return primeraLetra ? primeraLetra.toUpperCase() : ''
    })
    .filter(i => i.length > 0)
    .join('')
  
  // Si no hay suficientes iniciales, rellenar con X
  return iniciales.padEnd(maxLength, 'X').substring(0, maxLength)
}

/**
 * Genera un código sugerido basado en los datos del producto
 * Este código puede ser usado como sugerencia y el usuario puede editarlo
 */
export function sugerirCodigoProducto(
  modulo: ModuloProducto,
  categoriaTipo: string,
  nombre: string,
  productosExistentes?: Array<{ codigo: string }>
): string {
  // Contar productos existentes con el mismo prefijo y categoría
  const prefijo = getPrefijoModuloProducto(modulo)
  const abrevCategoria = obtenerAbreviaturaProducto(categoriaTipo, 3)
  const iniciales = obtenerInicialesProducto(nombre, 3)
  
  // Buscar el siguiente número disponible
  let numeroSecuencial = 1
  
  if (productosExistentes && productosExistentes.length > 0) {
    // Filtrar códigos que coincidan con el patrón
    const patron = new RegExp(`^${prefijo}-${abrevCategoria}-${iniciales}-(\\d+)$`)
    
    const numerosExistentes = productosExistentes
      .map(p => {
        const match = p.codigo.match(patron)
        return match ? parseInt(match[1], 10) : null
      })
      .filter((n): n is number => n !== null)
      .sort((a, b) => b - a)
    
    if (numerosExistentes.length > 0) {
      numeroSecuencial = numerosExistentes[0] + 1
    }
  }
  
  return generarCodigoProducto(modulo, categoriaTipo, nombre, numeroSecuencial)
}

/**
 * Valida si un código de producto sigue el formato esperado
 */
export function validarFormatoCodigo(codigo: string, modulo: ModuloProducto): boolean {
  const prefijo = getPrefijoModuloProducto(modulo)
  const patron = new RegExp(`^${prefijo}-[A-Z0-9]{1,4}-[A-Z]{3}-\\d{3}$`)
  return patron.test(codigo)
}


// ============================================================
// SECCIÓN 2: GENERADOR DE CÓDIGOS PARA ÓRDENES DE TRABAJO
// (Módulo Taller - Completamente independiente)
// ============================================================

export type TipoMantenimiento = 'PREVENTIVO' | 'CORRECTIVO' | 'EMERGENCIA' | 'LEGAL_INSPECCION'

/**
 * Obtiene la abreviatura del tipo de mantenimiento
 * EXCLUSIVO para órdenes de trabajo
 */
function getAbreviaturaTipoMantenimiento(tipo: TipoMantenimiento): string {
  const abreviaturas: Record<TipoMantenimiento, string> = {
    PREVENTIVO: 'PRE',
    CORRECTIVO: 'COR',
    EMERGENCIA: 'EME',
    LEGAL_INSPECCION: 'LEG',
  }
  return abreviaturas[tipo] || 'GEN'
}

/**
 * Obtiene una abreviatura del nombre de maquinaria
 * EXCLUSIVO para órdenes de trabajo
 */
function obtenerAbreviaturaMaquinaria(nombreMaquinaria: string, maxLength: number): string {
  if (!nombreMaquinaria) return 'MAQ'
  
  // Limpiar y normalizar
  const limpio = nombreMaquinaria.trim().toUpperCase()
  
  // Si tiene espacios, tomar primera letra de cada palabra
  if (limpio.includes(' ')) {
    const palabras = limpio.split(' ').filter(p => p.length > 0)
    const abrev = palabras
      .slice(0, maxLength)
      .map(p => p[0])
      .join('')
    return abrev.padEnd(maxLength, 'X').substring(0, maxLength)
  }
  
  // Si no tiene espacios, tomar las primeras letras
  const letras = limpio.replace(/[^A-Z]/g, '')
  if (letras.length === 0) return 'MAQ'
  
  return letras.substring(0, maxLength).padEnd(maxLength, 'X')
}

/**
 * Genera un código automático para una orden de trabajo
 * 
 * Formato: OT-[TIPO_MANT]-[MAQUINARIA]-[NUMERO]
 * 
 * Ejemplos:
 * - OT-PRE-EXC-001 (Preventivo - Excavadora - 001)
 * - OT-COR-CAM-002 (Correctivo - Camión - 002)
 * - OT-EME-RET-003 (Emergencia - Retroexcavadora - 003)
 * - OT-LEG-GRU-004 (Legal/Inspección - Grúa - 004)
 * 
 * NOTA: Esta función es INDEPENDIENTE de las funciones de productos
 */
export function generarCodigoOrdenTrabajo(
  tipoMantenimiento: TipoMantenimiento,
  maquinariaNombre: string,
  numeroSecuencial: number
): string {
  // Prefijo fijo de orden de trabajo
  const prefijo = 'OT'
  
  // Abreviatura del tipo de mantenimiento (función propia)
  const abrevTipo = getAbreviaturaTipoMantenimiento(tipoMantenimiento)
  
  // Abreviatura de la maquinaria (función propia, máximo 3 caracteres)
  const abrevMaquinaria = obtenerAbreviaturaMaquinaria(maquinariaNombre, 3)
  
  // Número secuencial con padding de 3 dígitos
  const numero = numeroSecuencial.toString().padStart(3, '0')
  
  return `${prefijo}-${abrevTipo}-${abrevMaquinaria}-${numero}`
}

/**
 * Genera un código sugerido para una orden de trabajo
 * Este código puede ser usado como sugerencia y el usuario puede editarlo
 * 
 * NOTA: Esta función es INDEPENDIENTE de las funciones de productos
 */
export function sugerirCodigoOrdenTrabajo(
  tipoMantenimiento: TipoMantenimiento,
  maquinariaNombre: string,
  ordenesExistentes?: Array<{ codigo_orden?: string; codigoOrden?: string }>
): string {
  const abrevTipo = getAbreviaturaTipoMantenimiento(tipoMantenimiento)
  const abrevMaquinaria = obtenerAbreviaturaMaquinaria(maquinariaNombre, 3)
  
  // Buscar el siguiente número disponible
  let numeroSecuencial = 1
  
  if (ordenesExistentes && ordenesExistentes.length > 0) {
    // Filtrar códigos que coincidan con el patrón OT-XXX-XXX-NNN
    const patron = new RegExp(`^OT-${abrevTipo}-${abrevMaquinaria}-(\\d+)$`)
    
    const numerosExistentes = ordenesExistentes
      .map(o => {
        const codigo = o.codigo_orden || o.codigoOrden || ''
        const match = codigo.match(patron)
        return match ? parseInt(match[1], 10) : null
      })
      .filter((n): n is number => n !== null)
      .sort((a, b) => b - a)
    
    if (numerosExistentes.length > 0) {
      numeroSecuencial = numerosExistentes[0] + 1
    } else {
      // Si no hay coincidencias exactas, buscar cualquier número del patrón general
      const patronGeneral = /^OT-[A-Z]{3}-[A-Z]{3}-(\d+)$/
      const todosLosNumeros = ordenesExistentes
        .map(o => {
          const codigo = o.codigo_orden || o.codigoOrden || ''
          const match = codigo.match(patronGeneral)
          return match ? parseInt(match[1], 10) : null
        })
        .filter((n): n is number => n !== null)
        .sort((a, b) => b - a)
      
      if (todosLosNumeros.length > 0) {
        numeroSecuencial = todosLosNumeros[0] + 1
      }
    }
  }
  
  return generarCodigoOrdenTrabajo(tipoMantenimiento, maquinariaNombre, numeroSecuencial)
}

/**
 * Valida si un código de orden de trabajo sigue el formato esperado
 * 
 * NOTA: Esta función es INDEPENDIENTE de las funciones de productos
 */
export function validarFormatoCodigoOrden(codigo: string): boolean {
  // Formato: OT-XXX-XXX-NNN
  const patron = /^OT-[A-Z]{3}-[A-Z]{3}-\d{3}$/
  return patron.test(codigo)
}
