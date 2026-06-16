export default function Services() {
  return (
    <section id="services" className="py-20 px-6 bg-gray-100">

      <h2 className="text-3xl font-bold text-center">
        Services
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold">Landing Pages</h3>
          <p>Responsive landing pages for clients.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold">Multi-Page Sites</h3>
          <p>Full websites for businesses.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold">Email Templates</h3>
          <p>Marketing email designs.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold">Website Updates</h3>
          <p>Fix bugs and update content.</p>
        </div>

      </div>

    </section>
  );
}