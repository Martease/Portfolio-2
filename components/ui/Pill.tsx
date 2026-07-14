import type { PropsWithChildren } from 'react'

type PillProps = PropsWithChildren<{
  className?: string
}>

export default function Pill({ children, className = '' }: PillProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border border-brand-cloud bg-brand-sand px-3 py-1 text-sm font-medium text-brand-ink',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
