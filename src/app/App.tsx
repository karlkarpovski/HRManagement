import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, ArrowRight } from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password, rememberMe });
  };

  return (
    <div className="size-full flex">
      {/* Left Side - System Information */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden"
      >
        <img
          src="https://images.unsplash.com/photo-1758518727477-3885839edee7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBvZmZpY2UlMjB0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG1vZGVybiUyMHdvcmtwbGFjZXxlbnwxfHx8fDE3NzU4OTc3MDd8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Professional team collaboration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-900/80" />

        <div className="relative z-10 flex flex-col justify-center px-16 py-24 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-5xl mb-6">
              HR Management System
            </h1>
            <p className="text-xl text-slate-300 mb-12 max-w-md">
              Streamline your workforce management with our comprehensive human resource platform
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2" />
                <div>
                  <h3 className="text-lg mb-1">Employee Management</h3>
                  <p className="text-slate-400">Centralized employee records and performance tracking</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2" />
                <div>
                  <h3 className="text-lg mb-1">Payroll & Benefits</h3>
                  <p className="text-slate-400">Automated payroll processing and benefits administration</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2" />
                <div>
                  <h3 className="text-lg mb-1">Time & Attendance</h3>
                  <p className="text-slate-400">Real-time tracking and leave management</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <h2 className="text-3xl mb-2">Welcome back</h2>
            <p className="text-slate-600">Sign in to access your HR dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-slate-700">
                Email address
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@company.com"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-slate-300 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 group"
            >
              Sign in
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Contact your administrator
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}