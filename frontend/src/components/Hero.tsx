import React from 'react';

const Hero: React.FC = () => {
  return (
    // Equivalent to .home: flex-col, center items, full height, gap-5
    <section className="flex flex-col items-center justify-center min-h-screen text-center gap-5 p-4" id="home">
      
      {/* Equivalent to .background-image */}
      <div className="home-text">
        <img 
          src="/src/assets/images/Background.png.jpeg" 
          className="block mx-auto w-60 h-auto rounded-[70px] p-2.5 mt-[-20px]" 
          alt="Background" 
        />
      </div>

      {/* Equivalent to .about h2 / default h2 */}
      <h2 className="text-xl font-medium text-orange-600">Hello, I'm</h2>

      {/* Equivalent to h1 styling */}
      <h1 className="text-[30px] font-normal text-black my-0">Martease Martin</h1>

      {/* Equivalent to .home-text h5 styling */}
      <h4 className="text-xl font-medium mb-6">
        A FullStack Developer <span className="text-black">From Maryland</span>
      </h4>

      {/* Equivalent to .home-text p styling */}
      <p className="text-lg text-black leading-7 max-w-lg mb-5 font-sans">
        Full Stack Developer leveraging a background in trade services and entrepreneurship 
        to build intuitive, scalable web applications. Dedicated to crafting seamless 
        user experiences from the browser down to the database.
      </p>

      {/* Equivalent to .social */}
      <div className="flex justify-center gap-4 mt-5">
        <a href="https://linkedin.com/in/martease-martin-08663a338" 
           className="w-9 h-9 rounded-full flex items-center justify-center bg-orange-600 text-white text-lg hover:scale-110 hover:bg-black transition-all">
           <i className='bx bxl-linkedin'></i>
        </a>
        <a href="https://x.com/marteasemartin/status/1801975695683281022" 
           className="w-9 h-9 rounded-full flex items-center justify-center bg-orange-600 text-white text-lg hover:scale-110 hover:bg-black transition-all">
           <i className='bx bxl-twitter'></i>
        </a>
        <a href="#" 
           className="w-9 h-9 rounded-full flex items-center justify-center bg-orange-600 text-white text-lg hover:scale-110 hover:bg-black transition-all">
           <i className='bx bxl-instagram'></i>
        </a>
      </div>
    </section>
  );
};

export default Hero;
