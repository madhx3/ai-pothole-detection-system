import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      const response = await fetch(
        'http://localhost:5000/admin/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            username,
            password
          })
        }
      );

      const data = await response.json();

      if (data.success) {

        localStorage.setItem(
          'admin_token',
          data.token
        );

        navigate('/admin/dashboard');

      } else {

        setError('Invalid credentials');
      }

    } catch (err) {

      console.error(err);

      setError('Server error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl w-full max-w-md">

        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Admin Login
        </h1>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
          />

          {error && (
            <p className="text-red-400 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
          >
            Login
          </button>

        </form>

      </div>

    </div>
  );
}