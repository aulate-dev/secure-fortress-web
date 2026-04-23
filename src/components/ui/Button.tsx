import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { buttonClassNames, type ButtonSize, type ButtonVariant } from './button-classes'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
    size?: ButtonSize
    fullWidth?: boolean
  }
>

export const Button = ({
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={buttonClassNames({ variant, size, fullWidth, className })}
    {...props}
  >
    {children}
  </button>
)
