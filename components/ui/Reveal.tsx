import type { CSSProperties, PropsWithChildren } from 'react'
import { useEffect, useRef, useState } from 'react'

type RevealProps = PropsWithChildren<{
  className?: string
  delayMs?: number
  as?: 'div' | 'section'
}>

export default function Reveal({ children, className = '', delayMs = 0, as = 'div' }: RevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLElement | null>(null)
  const Tag = as

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.18,
      }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <Tag
      ref={(node) => {
        ref.current = node as HTMLElement | null
      }}
      className={[
        'reveal-item motion-reduce:translate-y-0 motion-reduce:opacity-100',
        isVisible ? 'reveal-item-visible' : '',
        className,
      ].join(' ')}
      style={{ '--reveal-delay': `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  )
}
