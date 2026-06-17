import Hero from '../components/Hero';
// import About from '../components/About'; // Coming soon
// import Services from '../components/Services'; // Coming soon

const Home = () => {
  return (
    <div id="home" className="home-container">
      {/* The Hero is the first thing users see */}
      <Hero />
      
      {/* You can keep this page as the top hero section and render the rest in App */}
    </div>
  );
};

export default Home;
