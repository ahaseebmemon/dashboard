import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';

// The validation rules
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Toggles between login and register views
  const [isSignUp, setIsSignUp] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setAuthError(null);
    setSuccessMessage(null);

    if (isSignUp) {
      // Sign Up Routing
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
      } else {
        setSuccessMessage("Account created successfully! You can now sign in.");
        setIsSignUp(false);
        setIsLoading(false);
        reset();
      }
    } else {
      // Sign In Routing
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-100 dark:border-slate-700 transition-colors">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {isSignUp ? 'Create your admin account credentials' : 'Enter your credentials to access your account'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 outline-none transition-all"
            placeholder="you@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Password</label>
          <input
            type="password"
            {...register('password')}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 outline-none transition-all"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        {authError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm text-center font-medium">
            {authError}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-lg text-sm text-center font-medium">
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsSignUp(!isSignUp);
            setAuthError(null);
            setSuccessMessage(null);
          }}
          className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
        >
          {isSignUp 
            ? 'Already have an account? Sign In' 
            : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}
