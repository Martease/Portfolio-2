import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="home" id="home">
      <div className="home-text">
        <img src="/src/assets/images/Background.png.jpeg" className="background-image" alt="Background" />
      </div>
      <h2>Hello, I'm</h2>
      <h1>Martease Martin</h1>
      <h4>A Frontend Developer <span>From Maryland</span></h4>
    <p>
       Full Stack Developer leveraging a background in trade services and entrepreneurship 
       to build intuitive, scalable web applications. Dedicated to crafting seamless 
       user experiences from the browser down to the database.
    </p>

      <div className="social">
        <a href="https://linkedin.com/in/martease-martin-08663a338"><i className='bx bxl-linkedin'></i></a>
        <a href="https://x.com/marteasemartin/status/1801975695683281022"><i className='bx bxl-twitter'></i></a>
        <a href="#"><i className='bx bxl-instagram'></i></a>
      </div>
    </section>
  );
};

export default Hero;
