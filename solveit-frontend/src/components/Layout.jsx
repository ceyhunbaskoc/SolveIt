import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#0F1010] text-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#161717] m-4 rounded-[2rem] p-6 flex flex-col justify-between shadow-2xl">
        {/* Logo/Başlık */}
        <div>
          <Link to="/" className="block mb-8">
            <img 
              src="/logo.png" 
              alt="SolveIt Logo" 
              className="h-30 w-auto object-contain shadow-[0_0_20px_rgba(195,247,70,0.15)]" 
            />
          </Link>
          
          {/* Menü Linkleri */}
          {isAuthenticated && (
            <nav className="space-y-2">
              <Link
                to="/"
                className={`flex items-center gap-3 rounded-xl p-3 mb-2 transition-all ${
                  isActive('/')
                    ? 'bg-[#C3F746] text-black font-bold shadow-[0_0_15px_rgba(195,247,70,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-[#2A2B2B]'
                }`}
              >
                Ana Sayfa
              </Link>
              <Link
                to="/report"
                className={`flex items-center gap-3 rounded-xl p-3 mb-2 transition-all ${
                  isActive('/report')
                    ? 'bg-[#C3F746] text-black font-bold shadow-[0_0_15px_rgba(195,247,70,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-[#2A2B2B]'
                }`}
              >
                Yeni Bildirim
              </Link>
              <Link
                to="/my-issues"
                className={`flex items-center gap-3 rounded-xl p-3 mb-2 transition-all ${
                  isActive('/my-issues')
                    ? 'bg-[#C3F746] text-black font-bold shadow-[0_0_15px_rgba(195,247,70,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-[#2A2B2B]'
                }`}
              >
                Bildirimlerim
              </Link>
              <Link
                to="/leaderboard"
                className={`flex items-center gap-3 rounded-xl p-3 mb-2 transition-all ${
                  isActive('/leaderboard')
                    ? 'bg-[#C3F746] text-black font-bold shadow-[0_0_15px_rgba(195,247,70,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-[#2A2B2B]'
                }`}
              >
                🏆 Liderler
              </Link>
              <Link
                to="/map"
                className={`flex items-center gap-3 rounded-xl p-3 mb-2 transition-all ${
                  isActive('/map')
                    ? 'bg-[#C3F746] text-black font-bold shadow-[0_0_15px_rgba(195,247,70,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-[#2A2B2B]'
                }`}
              >
                🗺️ Harita
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 rounded-xl p-3 mb-2 transition-all ${
                    isActive('/admin')
                      ? 'bg-[#C3F746] text-black font-bold shadow-[0_0_15px_rgba(195,247,70,0.3)]'
                      : 'text-gray-400 hover:text-white hover:bg-[#2A2B2B]'
                  }`}
                >
                  Yönetici Paneli
                </Link>
              )}
              <Link
                to="/profile"
                className={`flex items-center gap-3 rounded-xl p-3 mb-2 transition-all ${
                  isActive('/profile')
                    ? 'bg-[#C3F746] text-black font-bold shadow-[0_0_15px_rgba(195,247,70,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-[#2A2B2B]'
                }`}
              >
                Profil
              </Link>
            </nav>
          )}
        </div>

        {/* Kullanıcı Bilgisi ve Çıkış */}
        {isAuthenticated ? (
          <div className="bg-[#0F1010] p-4 rounded-xl mt-auto">
            <div className="text-sm text-gray-300 mb-3">
              Hoş geldin, <span className="text-white font-medium">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="w-full text-[#F7721A] hover:text-red-500 font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
            >
              Çıkış Yap
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              to="/login"
              className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center text-sm"
            >
              Giriş Yap
            </Link>
            <Link
              to="/register"
              className="block w-full bg-[#C3F746] hover:bg-green-500 text-black font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-center text-sm"
            >
              Kayıt Ol
            </Link>
          </div>
        )}
      </div>

      {/* Ana İçerik Alanı */}
      <div className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
