import img from "../assets/images/Agency group.png";

export default function About() {
  return (
    <section id="about" className="py-20 px-6 flex flex-col md:flex-row items-center gap-10">

      <img src={img} className="w-96 rounded-xl" />

      <div>
        <h2 className="text-3xl font-bold">I'm a Developer</h2>

        <p className="mt-4 text-gray-600">
          I build modern websites using HTML, CSS, JavaScript, and React.
        </p>

        <button className="mt-6 bg-black text-white px-4 py-2 rounded-xl">
          Hire Me
        </button>
      </div>

    </section>
  );
}