import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header id="header">
      <div className="container">
        <nav>
          {/* Use your logo image path */}
          <img src="src/assets/images/IMG_0942.PNG" className="logo" alt="Logo" />
          
          <ul className="navlist">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/portfolio">Portfolio</Link></li>
            <li><Link to="/accomplishments">Accomplishments</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>

          {/* You can keep this as an <a> tag if it links to an external file like a PDF */}
          <a href="Scropt/CV.pdf" className="top-btn">Download CV</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
