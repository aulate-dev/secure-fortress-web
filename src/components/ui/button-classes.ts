type ButtonVariant = 'primary' | 'secondary'
type ButtonSize = 'sm' | 'md'

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    'border border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/20 hover:-translate-y-0.5 hover:bg-blue-700 hover:border-blue-700 focus-visible:ring-blue-500',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 focus-visible:ring-blue-500',
}

const sizeClassMap: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
}

type ButtonClassNameOptions = {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
}

export const buttonClassNames = ({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: ButtonClassNameOptions = {}) =>
  [
    'inline-flex items-center justify-center rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
    variantClassMap[variant],
    sizeClassMap[size],
    fullWidth ? 'w-full' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

export type { ButtonSize, ButtonVariant }
