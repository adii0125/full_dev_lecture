import { Route, Routes } from 'react-router-dom';
import Account from './pages/Account';
import Checkout from './pages/Checkout';
import Homes from './pages/Homes';
import Login from './pages/Login';
import ProductDetails from './pages/ProductDetails';
import Products from './pages/Products';
import Register from './pages/Register';
import { PrivateRoute } from './context/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homes />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/account"
        element={
          <PrivateRoute>
            <Account />
          </PrivateRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
