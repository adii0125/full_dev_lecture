const steps = [
  { title: 'Browse', text: 'Scan a focused list of available products.' },
  { title: 'Compare', text: 'Open the details page to review price and description.' },
  { title: 'Start', text: 'Create an account when you are ready to shop.' },
];

function ShopGuide() {
  return (
    <section className="bg-slate-50 px-5 py-14">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-600">How it works</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-950">A simple way to shop</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" key={step.title}>
              <span className="grid size-10 place-items-center rounded-lg bg-slate-900 text-sm font-extrabold text-white">
                {index + 1}
              </span>
              <h3 className="mt-5 text-xl font-bold text-slate-950">{step.title}</h3>
              <p className="mt-2 leading-7 text-slate-600">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ShopGuide;
