export default function Accomplishments() {
  return (
    <section id="accomplishments" className="py-20 px-6 bg-gray-100">

      <h2 className="text-3xl font-bold text-center">
        Accomplishments
      </h2>

      <div className="grid md:grid-cols-2 gap-6 mt-10">

        <div className="bg-white p-6 rounded-xl shadow">
          <h3>Intro to Generative AI</h3>
          <img
            src="../assets/images/AI course.png"
            alt="Intro to Generative AI"
            className="mt-4 rounded-xl"
          />

        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3>Intro to Cloud Computing</h3>
          <img
            src="../assets/images/Cloud computing.png"
            alt="Intro to Cloud Computing"
            className="mt-4 rounded-xl"
          />
        </div>

      </div>

    </section>
  );
}