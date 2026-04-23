import { z } from 'zod'

const noHtmlChars = /^[^<>]+$/

const hasEmojiOrPictographic = (value: string): boolean =>
  /\p{Extended_Pictographic}/u.test(value) || /\uFE0F/u.test(value)

const usernameSchema = z
  .string()
  .trim()
  .min(1, 'El nombre de usuario es obligatorio.')
  .max(100, 'El nombre de usuario es demasiado largo.')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Solo se permiten letras, numeros, guion y guion bajo.')
  .regex(noHtmlChars, 'El nombre de usuario contiene caracteres invalidos.')
  .refine((value) => !hasEmojiOrPictographic(value), {
    message: 'No se permiten emojis ni caracteres especiales extraños.',
  })

const emailSchema = z
  .string()
  .trim()
  .min(1, 'El correo es obligatorio.')
  .email('El formato del correo es invalido.')
  .regex(noHtmlChars, 'El correo contiene caracteres invalidos.')
  .transform((value) => value.toLowerCase())

const roleSchema = z.enum(['SuperAdmin', 'Auditor', 'Registrador'], {
  message: 'El rol debe ser SuperAdmin, Auditor o Registrador.',
})

const passwordRequiredSchema = z
  .string()
  .min(1, 'La contrasena es obligatoria.')
  .min(12, 'La contrasena debe tener al menos 12 caracteres.')
  .regex(noHtmlChars, 'La contrasena contiene caracteres invalidos.')
  .refine((value) => !hasEmojiOrPictographic(value), {
    message: 'No se permiten emojis ni caracteres especiales extraños.',
  })

const passwordOptionalSchema = z
  .string()
  .optional()
  .transform((value) => (value ?? '').trim())
  .superRefine((value, ctx) => {
    if (value.length === 0) {
      return
    }
    if (value.length < 12) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Si informa contrasena, debe tener al menos 12 caracteres.',
      })
      return
    }
    if (!noHtmlChars.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La contrasena contiene caracteres invalidos.',
      })
      return
    }
    if (hasEmojiOrPictographic(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'No se permiten emojis ni caracteres especiales extraños.',
      })
    }
  })

export const createUserFormSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  role: roleSchema,
  password: passwordRequiredSchema,
})

export const editUserFormSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  role: roleSchema,
  password: passwordOptionalSchema,
})

export type CreateUserFormInput = z.input<typeof createUserFormSchema>
export type CreateUserFormData = z.output<typeof createUserFormSchema>

export type EditUserFormInput = z.input<typeof editUserFormSchema>
export type EditUserFormData = z.output<typeof editUserFormSchema>
