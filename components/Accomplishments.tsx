const buildImageUrl = (name: string) => `/assets/images/${encodeURIComponent(name)}`

const Accomplishments = () => {
  return (
    <section id="accomplishments" className="py-20 px-6 bg-slate-100">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-center text-slate-900">Accomplishments</h2>

        <div className="grid gap-6 mt-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-md">
            <h3 className="text-2xl font-semibold text-slate-900">Intro to Generative AI</h3>
            <img
              src={buildImageUrl('AI course.png')}
              alt="Intro to Generative AI"
              className="mt-4 w-full rounded-3xl object-cover"
            />
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-md">
            <h3 className="text-2xl font-semibold text-slate-900">Intro to Cloud Computing</h3>
            <img
              src={buildImageUrl('Cloud computing.png')}
              alt="Intro to Cloud Computing"
              className="mt-4 w-full rounded-3xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Accomplishments
