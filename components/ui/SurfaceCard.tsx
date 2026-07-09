import type { HTMLAttributes, PropsWithChildren } from 'react'

type SurfaceCardProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    interactive?: boolean
  }
>

export default function SurfaceCard({ children, className = '', interactive = false, ...rest }: SurfaceCardProps) {
  return (
    <div
      className={[
        'rounded-3xl border border-brand-cloud bg-white p-6 shadow-sm',
        interactive ? 'transition hover:-translate-y-0.5 hover:shadow-md' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}