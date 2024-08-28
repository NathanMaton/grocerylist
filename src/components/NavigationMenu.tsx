import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const NavigationMenu: React.FC = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-gray-100 p-4 mb-6">
      <ul className="flex flex-wrap justify-between items-center">
        <li><Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link></li>
        <li><Link to="/my-lists" className="text-blue-600 hover:text-blue-800">My Lists</Link></li>
        <li><Link to="/shared-lists" className="text-blue-600 hover:text-blue-800">Shared Lists</Link></li>
        <li><Link to="/profile" className="text-blue-600 hover:text-blue-800">Profile</Link></li>
        <li><button onClick={handleSignOut} className="text-red-600 hover:text-red-800">Sign Out</button></li>
      </ul>
    </nav>
  );
};

export default NavigationMenu;