/**
 * Top navigation bar with SyncBoard branding and auth controls.
 */
import { useAuth } from '../../hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Don't show solid border if we are on dashboard (hero section has its own border)
  const isDashboard = location.pathname === '/dashboard';

  return (
    <nav className={`bg-white sticky top-0 z-50 ${isDashboard ? '' : 'border-b border-gray-200/60'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="h-8 w-8 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
            <span className="text-white font-bold text-sm tracking-tighter">S</span>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">SyncBoard</span>
        </Link>

        {isAuthenticated && user && (
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2.5 hover:bg-gray-50 px-2 py-1.5 rounded-full transition-colors focus:outline-none"
            >
              <div className="h-8 w-8 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200/60 text-gray-700 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user.name.split(' ')[0]}
              </span>
              <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsMenuOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200/60 z-50 py-1 origin-top-right animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-gray-100 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
