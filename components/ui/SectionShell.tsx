import type { PropsWithChildren } from 'react'

type SectionShellProps = PropsWithChildren<{
  id?: string
  className?: string
  containerClassName?: string
  as?: 'section' | 'div'
}>

export default function SectionShell({
  children,
  id,
  className = '',
  containerClassName = '',
  as = 'section',
}: SectionShellProps) {
  const Tag = as

  return (
    <Tag id={id} className={['px-6 py-20', className].join(' ').trim()}>
      <div className={['mx-auto max-w-7xl', containerClassName].join(' ').trim()}>{children}</div>
    </Tag>
  )
}
