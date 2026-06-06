import { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { apiRequest, logout, saveLogin } from '../base_api/api';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { AuthContext } from '../context/AuthProvider';


function Login() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    logout();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('Logging in...');

    try {
      const data = await apiRequest('/login/', {
        auth: false,
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      saveLogin(data);
      setIsAuthenticated(true);
      navigate('/account');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="px-5 py-14">
        <section className="mx-auto max-w-[460px] rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-600">Welcome back</p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-950">Log in</h1>
          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-bold text-slate-800">
              Username
              <input
                className="min-h-11 rounded-lg border border-slate-200 px-3 font-normal outline-none transition focus:border-slate-400"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-800">
              Password
              <input
                className="min-h-11 rounded-lg border border-slate-200 px-3 font-normal outline-none transition focus:border-slate-400"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {message && <p className="text-sm font-semibold text-slate-600">{message}</p>}
            <button className="mt-2 min-h-11 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white" type="submit">
              Log In
            </button>
          </form>
          <p className="mt-5 text-sm text-slate-600">
            New here?{' '}
            <Link className="font-bold text-teal-700 no-underline hover:text-teal-800" to="/register">
              Create an account
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Login;
