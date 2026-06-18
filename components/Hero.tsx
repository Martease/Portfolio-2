const Hero = () => {
  return (
    <section id="home" className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 py-24 text-center">
      <div className="rounded-[70px] bg-slate-100 p-4 shadow-xl shadow-orange-100/40">
        <img
          src="/assets/images/Background.png.jpeg"
          alt="Background"
          className="mx-auto h-60 w-60 rounded-[70px] object-cover"
        />
      </div>

      <p className="text-xl font-medium text-orange-600">Hello, I'm</p>
      <h1 className="text-4xl font-semibold text-black sm:text-5xl">Martease Martin</h1>
      <h4 className="text-xl font-medium text-slate-700">
        A FullStack Developer <span className="text-black">From Maryland</span>
      </h4>
      <p className="max-w-2xl text-lg leading-8 text-slate-700">
        Full Stack Developer leveraging a background in trade services and entrepreneurship to build intuitive, scalable web applications. Dedicated to crafting seamless user experiences from the browser down to the database.
      </p>

      <div className="flex items-center justify-center gap-4">
        <a
          href="https://linkedin.com/in/martease-martin-08663a338"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white transition hover:bg-black"
        >
          in
        </a>
        <a
          href="https://x.com/marteasemartin/status/1801975695683281022"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white transition hover:bg-black"
        >
          x
        </a>
        <a
          href="#contact"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-600 text-white transition hover:bg-black"
        >
          ig
        </a>
      </div>
    </section>
  )
}

export default Hero
