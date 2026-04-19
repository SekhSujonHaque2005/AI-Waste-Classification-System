import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SocialLogin from '../components/SocialLogin';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-green-50/30 flex flex-col items-center">
      <Navbar />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md card mt-10 p-8 shadow-xl bg-white rounded-3xl"
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-dark">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-bold uppercase tracking-tight opacity-70">Email Address</label>
            <input 
              type="email" 
              placeholder="eco@example.com"
              className="w-full p-4 p-x-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all transition-duration-300"
              required
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-bold uppercase tracking-tight opacity-70">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full p-4 p-x-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all transition-duration-300"
              required
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-4 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : 'Sign In'}
          </button>
        </form>

        <SocialLogin />

        <p className="text-center mt-8 text-gray-500 font-medium">
          Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline decoration-2">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
