import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Assuming you have user info in your auth state
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const closeDropdowns = () => {
      setIsProfileOpen(false);
      setIsMenuOpen(false);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileRef]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-red-600">Movie</span>
              <span className="text-xl font-bold">Mind</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800">Home</Link>
              <Link to="/recommendations" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800">Recommendations</Link>
              {isAuthenticated && (
                <Link to="/favorites" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800">Favorites</Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center">
            <form onSubmit={handleSearch} className="relative mr-4">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1 rounded-md text-sm bg-gray-800 focus:outline-none focus:ring-1 focus:ring-red-600 w-48"
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-700 hover:bg-gray-600 focus:outline-none">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-800 z-20">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="px-3 py-1 rounded-md text-sm font-medium bg-gray-700 hover:bg-gray-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-3 py-1 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    {isMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link to="/" onClick={closeDropdowns} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Home</Link>
                <Link to="/recommendations" onClick={closeDropdowns} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Recommendations</Link>
                {isAuthenticated && (
                    <Link to="/favorites" onClick={closeDropdowns} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Favorites</Link>
                )}
            </div>

            <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="flex items-center px-5">
                    {isAuthenticated && (
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                               <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                               </svg>
                            </div>
                        </div>
                    )}
                    <div className="ml-3">
                        {isAuthenticated && user && (
                            <>
                                <div className="text-base font-medium leading-none text-white">{user.username}</div>
                                <div className="text-sm font-medium leading-none text-gray-400">{user.email}</div>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-3 px-2 space-y-1">
                    {isAuthenticated ? (
                        <>
                            <Link to="/profile" onClick={closeDropdowns} className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">Your Profile</Link>
                            <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={closeDropdowns} className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">Login</Link>
                            <Link to="/register" onClick={closeDropdowns} className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;