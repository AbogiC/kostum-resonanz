import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Crown, User, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#02040a]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3" data-testid="nav-logo">
            <Crown className="w-8 h-8 text-[#D4AF37]" />
            <span className="font-serif text-2xl font-medium text-[#D4AF37]">Theatrical Rentals</span>
          </Link>

          <div className="flex items-center space-x-8">
            <Link 
              to="/costumes" 
              className="text-white/70 hover:text-white transition-colors flex items-center space-x-2"
              data-testid="nav-costumes"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Costumes</span>
            </Link>

            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-white/70 hover:text-white transition-colors flex items-center space-x-2"
                  data-testid="nav-dashboard"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>

                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-white/70 hover:text-white transition-colors flex items-center space-x-2"
                    data-testid="nav-admin"
                  >
                    <User className="w-5 h-5" />
                    <span>Admin</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="text-white/70 hover:text-white transition-colors flex items-center space-x-2"
                  data-testid="nav-logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-white/70 hover:text-white transition-colors"
                  data-testid="nav-login"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-[#D4AF37] text-black hover:bg-[#B5952F] rounded-sm font-medium px-6 py-2 transition-all"
                  data-testid="nav-register"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;