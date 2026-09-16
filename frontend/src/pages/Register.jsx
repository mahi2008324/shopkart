import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

const FIELDS = [
  { name: 'fullName',  type: 'text',     label: 'Full Name',      icon: User,  placeholder: 'John Doe' },
  { name: 'email',     type: 'email',    label: 'Email Address',  icon: Mail,  placeholder: 'john@example.com' },
  { name: 'password',  type: 'password', label: 'Password',       icon: Lock,  placeholder: 'At least 6 characters' },
  { name: 'phone',     type: 'tel',      label: 'Phone Number',   icon: Phone, placeholder: '9876543210' },
];

const Register = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim())   newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim())      newErrors.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password)          newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'At least 6 characters';
    if (!formData.phone.trim())      newErrors.phone    = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const result = await register({
        fullName: formData.fullName.trim(),
        email:    formData.email.trim(),
        password: formData.password,
        phone:    formData.phone.trim(),
      });
      if (result.success) {
        navigate('/login', {
          state: { message: 'Account created! Please sign in to continue.' },
        });
      } else {
        setServerError(result.message || 'Registration failed. Please try again.');
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* Glassmorphism card */}
      <div className="max-w-md w-full space-y-6 bg-white/80 backdrop-blur-xl border border-black/6 p-8 rounded-3xl shadow-lg">

        {/* Header */}
        <div className="text-center">
          <div
            className="mx-auto w-11 h-11 rounded-2xl flex items-center justify-center text-white mb-4"
            style={{ background: '#1d1d1f' }}
          >
            <User className="w-5 h-5" />
          </div>
          <h1
            className="text-headline text-2xl font-bold"
            style={{ color: '#1d1d1f' }}
          >
            Create your account
          </h1>
          <p className="mt-1 text-body text-sm text-gray-500">
            Join ShopKart to manage your orders &amp; profile
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="rounded-2xl bg-red-50 p-3.5 border border-red-100 flex items-start space-x-3 text-red-800 text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="font-medium">{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {FIELDS.map(({ name, type, label, icon: Icon, placeholder }) => (
            <div key={name}>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                {label} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Icon className="w-4 h-4" />
                </div>
                <input
                  id={`register-${name}`}
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className={`input-apple block w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 ${
                    errors[name] ? 'border-red-300' : 'border-black/8'
                  }`}
                />
              </div>
              {errors[name] && (
                <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors[name]}</span>
                </p>
              )}
            </div>
          ))}

          <button
            id="register-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="press w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            style={{ background: '#1d1d1f' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account…</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-1 border-t border-black/5">
          <p className="text-body text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold transition-colors"
              style={{ color: '#1d1d1f' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
