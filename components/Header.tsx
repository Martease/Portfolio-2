const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Accomplishments', href: '#accomplishments' },
  { label: 'Contact', href: '#contact' },
  { label: 'Client Portal', href: '/client-portal' },
  { label: 'Back Office', href: '/back-office' },
]

const Header = () => {
  return (
    <header className="fixed top-0 right-0 w-full z-50 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <img
            src="/assets/images/IMG_0942.PNG"
            className="h-14 w-14 rounded-full object-cover"
            alt="Logo"
          />
          <span className="font-semibold text-orange-600">Mamvo Labs</span>
        </div>

        <nav>
          <ul className="flex flex-wrap items-center gap-2 text-sm font-medium text-black">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="rounded-full px-3 py-2 transition hover:text-orange-600"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href="/assets/CV.pdf"
          className="rounded-full border border-orange-600 px-4 py-2 text-orange-600 transition hover:bg-orange-600 hover:text-white"
        >
          Download CV
        </a>
      </div>
    </header>
  )
}

export default Header
