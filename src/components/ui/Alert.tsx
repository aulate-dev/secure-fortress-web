import type { HTMLAttributes, PropsWithChildren } from 'react'

type AlertVariant = 'default' | 'destructive'

type AlertProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    variant?: AlertVariant
  }
>

const variantClassNames: Record<AlertVariant, string> = {
  default: 'border-slate-200 bg-slate-50 text-slate-700',
  destructive: 'border-red-200 bg-red-50 text-red-700',
}

export const Alert = ({ variant = 'default', className = '', children, ...props }: AlertProps) => (
  <div
    role="alert"
    className={`w-full rounded-md border px-3 py-2 text-xs ${variantClassNames[variant]} ${className}`.trim()}
    {...props}
  >
    {children}
  </div>
)
