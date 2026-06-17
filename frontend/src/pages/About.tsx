export default function About() {
  return (
    <section id="about" className="py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow-md text-gray-900">
        <h1 className="text-3xl md:text-4xl font-semibold mb-6">
          About Mamvo Labs: Architecture at the Intersection of Logic and Innovation
        </h1>

        <p className="text-gray-700 leading-relaxed mb-8">
          At Mamvo Labs, we don't just write code; we architect digital infrastructure designed to perform, scale, and endure. Founded by and built on the principles of precision and continuous improvement, Mamvo Labs serves as the technical engine for ambitious projects and enterprise-level solutions.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">The Philosophy</h2>

        <p className="text-gray-700 leading-relaxed mb-8">
          We operate at the intersection of complex backend logic and intuitive user experiences. We believe that technology should be a quiet, powerful force—invisible to the user, yet robust enough to support enterprise-grade demands. Whether we are engineering data-driven platforms or streamlining operational workflows, our focus remains on clean, maintainable architecture.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">The Approach: Systematic Excellence</h2>

        <p className="text-gray-700 leading-relaxed mb-6">
          Our process is rooted in a highly structured, systematic framework. We utilize a PALA-driven methodology (Projects, Actions, Learning, Archives) to ensure that every line of code serves a strategic business objective. We don't believe in "moving fast and breaking things"—we believe in building with intentionality.
        </p>

        <ul className="list-[circle] marker:text-gray-700 pl-6 space-y-4 mb-8">
          <li>
            <span className="font-semibold">Engineering-First Mindset:</span> We prioritize backend stability, cloud architecture, and data engineering, ensuring every system is built on a foundation of reliability.
          </li>

          <li>
            <span className="font-semibold">Technological Integration:</span> From integrating complex APIs to building custom discovery engines, we specialize in bridging the gap between raw data and actionable digital products.
          </li>

          <li>
            <span className="font-semibold">Professional Continuity:</span> With deep roots in the software development space, we approach every contract with the discipline of a developer and the vision of an entrepreneur.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mb-3">Our Commitment</h3>

        <p className="text-gray-700 leading-relaxed">
          We are currently pushing the boundaries of what is possible in web architecture, specializing in stacks like Next.js and FastAPI to deliver high-performance digital hubs. Mamvo Labs is not just a service provider; we are a long-term technical partner dedicated to bringing sophisticated, scalable ideas to life.
        </p>
        <div className="mt-6">
          <button className="bg-black text-white px-4 py-2 rounded-xl hover:bg-orange-500 hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400">
            Hire Me
          </button>
        </div>
      </div>
    </section>
  );
}