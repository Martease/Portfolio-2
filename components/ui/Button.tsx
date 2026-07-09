import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonVariant = 'solid' | 'ghost' | 'outline'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
  }
>

const variantClassMap: Record<ButtonVariant, string> = {
  solid:
    'bg-brand-ember text-white shadow-lg shadow-brand-ember/30 hover:bg-brand-emberDeep focus-visible:ring-brand-ember/40',
  ghost:
    'bg-transparent text-brand-ink hover:bg-brand-cloud focus-visible:ring-brand-cloud',
  outline:
    'border border-brand-cloud text-brand-ink hover:border-brand-ember hover:text-brand-ember focus-visible:ring-brand-cloud',
}

export default function Button({ children, className = '', variant = 'solid', type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        variantClassMap[variant],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}