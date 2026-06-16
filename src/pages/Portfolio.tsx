import handy from "../assets/images/Handy logo.PNG";

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-20 px-6">

      <h2 className="text-3xl font-bold text-center">
        Portfolio
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mt-10">

        <a href="#" className="block shadow rounded-xl overflow-hidden">
          <img src={handy} />
          <div className="p-4">
            <h3 className="font-bold">Multi-Page Website</h3>
          </div>
        </a>

      </div>

    </section>
  );
}