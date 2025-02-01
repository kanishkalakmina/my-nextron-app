import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useIPC } from '../hooks/useIPC';

const Login = () => {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const { login: ipcLogin } = useIPC();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await ipcLogin({
        username: formData.username,
        password: formData.password
      });

      if (result.success) {
        authLogin(); // Update auth context
        router.push('/dashboard');
      } else {
        setError(result.error || 'Invalid username or password');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - POS System</title>
      </Head>
      <div className="min-h-screen flex">
        {/* Left Section - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-sky-300 via-blue-200 to-indigo-200">
          <div className="absolute inset-0">
            {/* Animated Circles */}
            <div className="absolute top-[20%] left-[30%] w-64 h-64 bg-white/30 rounded-full mix-blend-overlay filter blur-xl animate-blob"></div>
            <div className="absolute bottom-[20%] right-[30%] w-64 h-64 bg-sky-200/40 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute top-[50%] left-[50%] w-64 h-64 bg-blue-200/30 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000"></div>
          </div>
          <div className="relative w-full flex flex-col items-center justify-center p-12 text-blue-900">
            <div className="w-24 h-24 mb-8 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-center">Welcome to POS System</h1>
            <p className="text-xl text-center text-blue-800/80">Streamline your business operations</p>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-white via-blue-50 to-sky-50">
          <div className="w-full max-w-md">
            {/* Glass Container */}
            <div className="backdrop-blur-lg bg-white/30 rounded-3xl shadow-2xl border border-white/30 p-8 relative overflow-hidden">
              {/* Glass Reflections */}
              <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-white/40 to-transparent transform -skew-y-6"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sky-100/30 rounded-full"></div>
              
              {/* Content */}
              <div className="relative space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-blue-900">Sign in</h2>
                  <p className="mt-2 text-sm text-blue-600/80">Enter your credentials to access your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-blue-900/80">
                        Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        className="mt-1 block w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl shadow-sm backdrop-blur-sm placeholder-blue-400/80 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition duration-200"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-blue-900/80">
                        Password
                      </label>
                      <div className="relative mt-1">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          className="block w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl shadow-sm backdrop-blur-sm placeholder-blue-400/80 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 transition duration-200 pr-12"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600/70 hover:text-blue-800 transition-colors duration-200"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50/50 backdrop-blur-sm border border-red-200 rounded-xl">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500/80 to-sky-500/80 hover:from-blue-600/90 hover:to-sky-600/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      'Sign in'
                    )}
                  </button>

                  <div className="text-center text-sm text-blue-600/70">
                    Secure login powered by POS System
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
};

export default Login;
