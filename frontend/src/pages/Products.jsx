import Footer from '../components/Footer';
import Header from '../components/Header';
import ProductList from '../components/ProductList';

function Products() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="px-5 py-14">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-600">Shop</p>
            <h1 className="mt-3 text-4xl font-extrabold text-slate-950">Products</h1>
            <p className="mt-4 leading-8 text-slate-600">
              Browse the current product selection and open any item for more detail.
            </p>
          </div>
          <ProductList />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Products;
