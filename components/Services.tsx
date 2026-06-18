import { formatUsd, servicesForCards } from '../lib/serviceCatalog'

const Services = () => {
  const handlePurchase = async (service: (typeof servicesForCards)[number]) => {
    try {
      // Create a Stripe checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: service.title,
          amount: service.amount,
        }),
      });

      const data = await response.json().catch(() => ({} as { message?: string; url?: string }));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error('Checkout session did not return a redirect URL.');
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const message = error instanceof Error ? error.message : 'Failed to initiate checkout. Please try again.';
      alert(message);
    }
  };

  return (
    <section id="services" className="py-20 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-center text-orange-900">Services</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-orange-700">
          Professional digital solutions focused on performance, reliability, and polished user experiences.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {servicesForCards.map((item) => (
            <button
              key={item.title}
              onClick={() => handlePurchase(item)}
              className={`${item.bg} group block rounded-3xl border border-orange-200 p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer text-left w-full`}
            >
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-orange-900">{item.title}</h3>
                  <p className="mt-3 text-orange-700">{item.description}</p>
                  <p className="mt-2 text-lg font-semibold text-orange-900">Starting at {formatUsd(item.amount)}</p>
                </div>
                <div className="inline-flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-sm transition duration-300 group-hover:bg-orange-100">
                  <span className="font-medium text-orange-900">Purchase</span>
                  <span className="text-orange-600">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
