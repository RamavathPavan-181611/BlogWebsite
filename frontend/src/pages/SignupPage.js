import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, UserPlus, WandSparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const strongPassword = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  const values = new Uint32Array(16);
  window.crypto.getRandomValues(values);
  return Array.from(values, (value) => characters[value % characters.length]).join('');
};

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const suggestPassword = () => {
    const password = strongPassword();
    setForm((previous) => ({ ...previous, password, confirmPassword: password }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await api.register({
        name: form.name,
        email: form.email,
        password: form.password
      });
      login(response.user, response.token);
      toast.success('Account created successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,}$/.test(form.password);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Create your account</h1>
          <p className="text-gray-400">Join the BlogPlatform community</p>
        </div>

        <div className="bg-gray-custom border border-gray-800 rounded-xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-medium text-gray-300">Name
              <input name="name" value={form.name} onChange={handleChange} className="input-field mt-2" placeholder="Your name" minLength="2" required />
            </label>
            <label className="block text-sm font-medium text-gray-300">Email Address
              <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field mt-2" placeholder="Enter your email" required />
            </label>
            <label className="block text-sm font-medium text-gray-300">Password
              <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field mt-2" placeholder="Create a strong password" minLength="10" required />
            </label>
            <button type="button" onClick={suggestPassword} className="btn-secondary w-full flex items-center justify-center gap-2">
              <WandSparkles size={18} /> Suggest a strong password
            </button>
            <p className={passwordStrong ? 'text-sm text-success-400' : 'text-sm text-gray-500'}>
              Use at least 10 characters with uppercase, lowercase, number, and special character.
            </p>
            <label className="block text-sm font-medium text-gray-300">Confirm Password
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="input-field mt-2" placeholder="Repeat your password" minLength="10" required />
            </label>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? 'Creating account...' : <><UserPlus size={18} /> Create account</>}
            </button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
            <KeyRound size={14} /> Your password is securely hashed before storage.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;