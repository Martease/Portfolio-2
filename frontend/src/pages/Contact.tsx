export default function Contact() {
  return (
    <section id="contact" className="py-20 px-6 text-center">

      <h2 className="text-3xl font-bold">Let's Connect</h2>

      <form className="mt-6 flex flex-col md:flex-row gap-4 justify-center">

        <input
          type="email"
          placeholder="Enter your email"
          className="border p-3 rounded-xl w-64"
        />

        <button className="bg-black text-white px-6 py-3 rounded-xl">
          Submit
        </button>

      </form>

    </section>
  );
}