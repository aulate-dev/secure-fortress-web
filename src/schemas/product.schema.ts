import { z } from 'zod'

const noHtmlChars = /^[^<>]+$/

export const productSchema = z.object({
  sku_alfanumerico: z
    .string()
    .trim()
    .min(1, 'El codigo es obligatorio.')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El codigo solo permite letras, numeros, guion y guion bajo.')
    .regex(noHtmlChars, 'El codigo contiene caracteres invalidos.'),
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .regex(noHtmlChars, 'El nombre contiene caracteres invalidos.'),
  descripcion: z
    .string()
    .trim()
    .min(1, 'La descripcion es obligatoria.')
    .regex(noHtmlChars, 'La descripcion contiene caracteres invalidos.'),
  cantidad: z.coerce.number().min(0, 'La cantidad debe ser mayor o igual a 0.'),
  precio: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0.'),
})

export type ProductFormInput = z.input<typeof productSchema>
export type ProductFormData = z.output<typeof productSchema>
