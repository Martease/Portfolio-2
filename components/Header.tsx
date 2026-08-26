import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { brandFoundation, publicNavItems } from '../lib/brand'

const trackableSections = publicNavItems
  .map((item) => item.sectionId)
  .filter((sectionId): sectionId is string => Boolean(sectionId))

export default function Header() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const onRouteOrHashChange = () => {
      setIsMenuOpen(false)

      if (router.pathname === '/' && window.location.hash) {
        setActiveSection(window.location.hash.replace('#', ''))
      } else if (router.pathname === '/') {
        setActiveSection('home')
      } else {
        setActiveSection('')
      }
    }

    onRouteOrHashChange()
    window.addEventListener('hashchange', onRouteOrHashChange)
    return () => window.removeEventListener('hashchange', onRouteOrHashChange)
  }, [router.pathname])

  useEffect(() => {
    const sections = trackableSections
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section))

    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible.length) {
          setActiveSection(visible[0].target.id)
        }
      },
      {
        rootMargin: '-45% 0px -45% 0px',
        threshold: [0.2, 0.5, 0.8],
      }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [router.pathname])

  const navItems = useMemo(() => {
    const items = publicNavItems.map((item) => {
      const isSectionLink = Boolean(item.sectionId)
      const isActive = isSectionLink
        ? router.pathname === '/' && activeSection === item.sectionId
        : router.pathname === item.href || router.pathname.startsWith(`${item.href}/`)

      return { ...item, isActive }
    })

    if (status === 'authenticated' && session?.user?.role === 'admin') {
      const isActive = router.pathname.startsWith('/back-office')
      items.push({
        label: 'Back Office',
        href: '/back-office',
        isActive,
      })
    }

    return items
  }, [activeSection, router.pathname, session?.user?.role, status])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-cloud/70 glass-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label={`${brandFoundation.companyName} home`}>
          <img
            src={brandFoundation.logo.markSrc}
            className="h-12 w-12 rounded-full border border-brand-cloud object-cover"
            alt={brandFoundation.logo.alt}
          />
          <div className="hidden sm:block">
            <p className="font-display text-lg leading-tight text-brand-ink">{brandFoundation.companyName}</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-slate">{brandFoundation.tagline}</p>
          </div>
        </Link>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-cloud text-brand-ink lg:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-controls="site-navigation"
          aria-label="Toggle menu"
        >
          <span className="sr-only">Open main menu</span>
          <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
            <span className={['h-0.5 w-full bg-current transition-transform', isMenuOpen ? 'translate-y-2 rotate-45' : ''].join(' ')} />
            <span className={['h-0.5 w-full bg-current transition-opacity', isMenuOpen ? 'opacity-0' : ''].join(' ')} />
            <span className={['h-0.5 w-full bg-current transition-transform', isMenuOpen ? '-translate-y-2 -rotate-45' : ''].join(' ')} />
          </span>
        </button>

        <nav
          id="site-navigation"
          className={[
            'absolute left-0 top-full w-full border-b border-brand-cloud bg-white px-5 py-4 shadow-halo lg:static lg:w-auto lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none',
            isMenuOpen ? 'block' : 'hidden lg:block',
          ].join(' ')}
        >
          <ul className="flex flex-col items-start gap-1 text-sm font-semibold text-brand-slate lg:flex-row lg:items-center lg:gap-1">
            {navItems.map((item) => (
              <li key={item.label} className="w-full lg:w-auto">
                {item.sectionId ? (
                  <a
                    href={item.href}
                    className={[
                      'block rounded-full px-4 py-2 transition-colors',
                      item.isActive ? 'bg-brand-ember text-white' : 'hover:bg-brand-cloud/70 hover:text-brand-ink',
                    ].join(' ')}
                    aria-current={item.isActive ? 'page' : undefined}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className={[
                      'block rounded-full px-4 py-2 transition-colors',
                      item.isActive ? 'bg-brand-ember text-white' : 'hover:bg-brand-cloud/70 hover:text-brand-ink',
                    ].join(' ')}
                    aria-current={item.isActive ? 'page' : undefined}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            {status === 'authenticated' ? (
              <li className="w-full lg:ml-2 lg:w-auto">
                <button
                  type="button"
                  className="block w-full rounded-full border border-brand-cloud px-4 py-2 text-left text-brand-ink transition-colors hover:border-brand-ember hover:text-brand-ember lg:w-auto"
                  onClick={() => {
                    setIsMenuOpen(false)
                    void signOut({ callbackUrl: '/login' })
                  }}
                >
                  Logout
                </button>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>
    </header>
  )
}
