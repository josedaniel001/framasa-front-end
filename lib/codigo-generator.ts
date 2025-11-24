/**
 * Generador de códigos automáticos para productos
 * Genera códigos basados en módulo, categoría/tipo, nombre y numeración
 */

export type Modulo = 'FERRETERIA' | 'BLOQUERA' | 'PIEDRINERA'

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
  modulo: Modulo,
  categoriaTipo: string,
  nombre: string,
  numeroSecuencial: number
): string {
  // Prefijo del módulo
  const prefijo = getPrefijoModulo(modulo)
  
  // Abreviatura de categoría/tipo (máximo 3-4 caracteres)
  const abrevCategoria = obtenerAbreviatura(categoriaTipo, 3)
  
  // Iniciales del nombre (máximo 3 caracteres)
  const iniciales = obtenerIniciales(nombre, 3)
  
  // Número secuencial con padding de 3 dígitos
  const numero = numeroSecuencial.toString().padStart(3, '0')
  
  return `${prefijo}-${abrevCategoria}-${iniciales}-${numero}`
}

/**
 * Obtiene el prefijo del módulo
 */
function getPrefijoModulo(modulo: Modulo): string {
  const prefijos: Record<Modulo, string> = {
    FERRETERIA: 'FERR',
    BLOQUERA: 'BLOQ',
    PIEDRINERA: 'PIED',
  }
  return prefijos[modulo]
}

/**
 * Obtiene una abreviatura de un texto
 * Toma las primeras letras mayúsculas o las primeras letras de cada palabra
 */
function obtenerAbreviatura(texto: string, maxLength: number): string {
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
 * Obtiene las iniciales de un nombre
 * Toma la primera letra de cada palabra (máximo maxLength palabras)
 */
function obtenerIniciales(nombre: string, maxLength: number): string {
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
  modulo: Modulo,
  categoriaTipo: string,
  nombre: string,
  productosExistentes?: Array<{ codigo: string }>
): string {
  // Contar productos existentes con el mismo prefijo y categoría
  const prefijo = getPrefijoModulo(modulo)
  const abrevCategoria = obtenerAbreviatura(categoriaTipo, 3)
  const iniciales = obtenerIniciales(nombre, 3)
  
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
 * Valida si un código sigue el formato esperado
 */
export function validarFormatoCodigo(codigo: string, modulo: Modulo): boolean {
  const prefijo = getPrefijoModulo(modulo)
  const patron = new RegExp(`^${prefijo}-[A-Z0-9]{1,4}-[A-Z]{3}-\\d{3}$`)
  return patron.test(codigo)
}

