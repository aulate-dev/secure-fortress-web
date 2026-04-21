import { z } from 'zod'

const noHtmlChars = /^[^<>]+$/

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo es obligatorio.')
    .email('El formato del correo es inválido.')
    .regex(noHtmlChars, 'El correo contiene caracteres inválidos.')
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .trim()
    .min(1, 'La contraseña es obligatoria.')
    .min(12, 'La contraseña debe tener al menos 12 caracteres.')
    .regex(noHtmlChars, 'La contraseña contiene caracteres inválidos.'),
})

export type LoginFormData = z.infer<typeof loginSchema>
