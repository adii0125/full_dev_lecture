import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../base_api/base';
import { getImageUrl } from '../base_api/api';

function ProductList({ featured = false }) {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('Loading products...');

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await axios.get(`${BASE_URL}/api/products/`);
        setProducts(response.data);
        setMessage('');
      } catch (error) {
        setMessage('Products are not available right now.');
      }
    }

    loadProducts();
  }, []);

  const visibleProducts = featured ? products.slice(0, 3) : products;

  if (message) {
    return <p className="rounded-lg border border-slate-200 bg-white p-5 text-slate-600">{message}</p>;
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {visibleProducts.map((product) => (
        <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" key={product.id}>
          <img className="aspect-[4/3] w-full object-cover" src={getImageUrl(product.image)} alt={product.product_name} />
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-950">{product.product_name}</h3>
              <p className="whitespace-nowrap text-sm font-extrabold text-teal-700">PHP {product.product_price}</p>
            </div>
            <p className="mt-3 line-clamp-2 leading-7 text-slate-600">{product.description}</p>
            <Link
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-bold text-white no-underline transition hover:bg-slate-800"
              to={`/products/${product.id}`}
            >
              View Details
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export default ProductList;
