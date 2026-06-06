import Footer from '../components/Footer';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductList from '../components/ProductList';
import ShopGuide from '../components/ShopGuide';

function Homes() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <ShopGuide />
        <section className="px-5 py-14">
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-600">Featured</p>
                <h2 className="mt-3 text-3xl font-extrabold text-slate-950">Popular products</h2>
              </div>
              <p className="max-w-md leading-7 text-slate-600">Start with a few practical picks from the shop.</p>
            </div>
            <ProductList featured />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Homes;
