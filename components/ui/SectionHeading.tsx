type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start'

  return (
    <div className={['flex flex-col gap-3', alignment].join(' ')}>
      {eyebrow ? <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-slate">{eyebrow}</p> : null}
      <h2 className="font-display text-3xl font-semibold text-brand-ink sm:text-4xl">{title}</h2>
      {description ? <p className="max-w-2xl text-brand-slate">{description}</p> : null}
    </div>
  )
}