const Contact = () => {
  return (
    <section id="contact" className="py-20 px-6">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-xl shadow-slate-200/70 text-center">
        <h2 className="text-4xl font-bold text-slate-900">Let's Connect</h2>
        <p className="mt-4 text-slate-700">
          Send a message to discuss your next project, request a quote, or explore how Mamvo Labs can support your business goals.
        </p>

        <form className="mt-10 grid gap-4 sm:grid-cols-[1fr_auto]">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-3xl border border-slate-300 px-5 py-4 text-slate-900 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          <button className="rounded-3xl bg-black px-8 py-4 text-white transition hover:bg-orange-600">
            Submit
          </button>
        </form>
      </div>
    </section>
  )
}

export default Contact
