import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-2 flex items-center">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Out of Broccoli Logo" className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold text-gray-800">Out of Broccoli</span>
          </Link>
          <nav className="ml-auto">
            {/* Add your navigation menu items here */}
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-gray-100">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600">
          © 2024 Out of Broccoli. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;