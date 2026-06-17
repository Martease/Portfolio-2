const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Accomplishments', href: '#accomplishments' },
  { label: 'Contact', href: '#contact' },
  { label: 'Client Portal', href: '/client-portal' },
];

const Header = () => {
  return (
    // Fixed header at the top, full width, flex alignment
    <header className="fixed top-0 right-0 w-full z-[1000] flex items-center p-2.5 bg-white/90 backdrop-blur-md">
      <div className="container">
        <nav className="flex items-center justify-between flex-wrap text-orange-600">
          
          {/* Logo with specific dimensions and rounded style */}
          <img src="src/assets/images/IMG_0942.PNG" className="w-[140px] h-[140px] p-2.5 rounded-full" alt="Logo" />
          
          {/* Navigation list */}
          <ul className="flex list-none p-0 m-0">
            {navItems.map((item) => (
              <li key={item.label} className="text-medium relative">
                <a
                  href={item.href}
                  className="font-medium px-2.5 py-2.5 text-black transition-colors duration-300 hover:text-orange-600 relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-orange-600 after:bottom-[-3px] after:left-0 hover:after:w-full after:transition-all after:duration-300"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Download Button */}
          <a href="Scropt/CV.pdf" className="inline-block px-[30px] py-[9px] border-2 border-orange-600 rounded-[30px] text-orange-600 font-medium transition-all duration-500 hover:scale-110 hover:bg-orange-600 hover:text-white">
            Download CV
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
