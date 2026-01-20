
import React, { useState } from 'react';
import { useLogin } from "../../../_queries/auth.query";
import { useSmartNavigation } from '../../../hooks/useSmartNavigation';
import { useNotification } from '../../../context/NotificationContext';
import FluxFlowLogo from './FluxFlowLogo';

export default function Login() {
  const [localUsername, setLocalUsername] = useState('');
  const [localPassword, setLocalPassword] = useState('');
  const [fadeClass] = useState('fade-in');

  const { notify } = useNotification();
  const loginMutation = useLogin();
  const { navigateToDefaultPage, isNavigating: navigationLoading } = useSmartNavigation();

  const handleSubmit = (e) => {
    e.preventDefault();

    loginMutation.mutate(
      { username: localUsername, password: localPassword },
      {
        onSuccess: () => {
          notify({
            title: "Login Successful",
            message: `Welcome back, ${localUsername}!`,
          });

          navigateToDefaultPage();
        },
        onError: (err) => {
          notify({
            title: "Error: Login Failed",
            message: err.message || "Invalid username or password",
          });
        },
      }
    );
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-5 ${fadeClass}`}
         style={{
           background: '#0a0a0f',
           backgroundImage: `
             linear-gradient(90deg, rgba(74, 144, 226, 0.04) 1px, transparent 1px),
             linear-gradient(0deg, rgba(74, 144, 226, 0.04) 1px, transparent 1px),
             linear-gradient(45deg, rgba(74, 144, 226, 0.025) 1px, transparent 1px),
             linear-gradient(-45deg, rgba(74, 144, 226, 0.025) 1px, transparent 1px)
           `,
           backgroundSize: '60px 60px, 60px 60px, 40px 40px, 40px 40px',
           backgroundPosition: '0 0, 0 0, 0 0, 0 0'
         }}>
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 pointer-events-none"
           style={{
             background: `
               radial-gradient(circle at 20% 30%, rgba(74, 144, 226, 0.08) 0%, transparent 50%),
               radial-gradient(circle at 80% 70%, rgba(74, 144, 226, 0.06) 0%, transparent 50%)
             `
           }} />

      <div className="w-full max-w-[440px] bg-[#1a1b26] border-3 border-[#2d3548] p-12 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative z-10 backdrop-blur-sm">
        
        {/* Logo */}
        <div className="text-center mb-12">
          <FluxFlowLogo variant="default" className="select-none mx-auto" />
          {/* <hr className="mt-4 text-[#71757D]" ></hr> */}
          {/* <div className="mt-4 text-[#71757D] text-sm font-medium tracking-wide">
            Sign in to continue
          </div> */}
        </div>

        {/* Login Form */}
        <form id="login-form" className="flex flex-col gap-3" onSubmit={handleSubmit}>
          
          {/* Username/Email Field */}
          <div className="flex flex-col gap-2.5">
            <label htmlFor="username" className="text-sm font-semibold text-[#a8b2c1] tracking-wide">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={localUsername}
              onChange={e => setLocalUsername(e.target.value)}
              required
              autoComplete="username"
              className="bg-[#12131a] border border-[#2d3548] text-[#e1e4e8] px-4 py-3.5 text-[15px] font-medium transition-all duration-200 focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2]/20 focus:bg-[#171822] placeholder:text-[#5a6375] placeholder:font-normal hover:border-[#3d4556]"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2.5 mb-6">
            <label htmlFor="password" className="text-sm font-semibold text-[#a8b2c1] tracking-wide">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={localPassword}
              onChange={e => setLocalPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="bg-[#12131a] border border-[#2d3548] text-[#e1e4e8] px-4 py-3.5 text-[15px] font-medium transition-all duration-200 focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2]/20 focus:bg-[#171822] placeholder:text-[#5a6375] placeholder:font-normal hover:border-[#3d4556]"
            />
          </div>

          {/* Login Button */}
          <button
            id="login-button"
            type="submit"
            disabled={loginMutation.isPending || navigationLoading}
            className="bg-gradient-to-r from-[#4a90e2] to-[#5da3f5] hover:from-[#5da3f5] hover:to-[#6bb0ff] text-white border-none px-4 py-4 text-[15px] font-bold cursor-pointer transition-all duration-200 mt-4 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(74,144,226,0.4)] active:transform-none shadow-[0_4px_12px_rgba(74,144,226,0.25)]"
          >
            {loginMutation.isPending || navigationLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
