import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth);
    navigate('/');
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <img src={user.photoURL} alt="User" className="w-16 h-16 rounded-full" />
          <div>
            <h2 className="text-xl font-bold">{user.displayName}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold mb-2">My Orders</h3>
          <p className="text-gray-500 text-sm">কোনো অর্ডার পাওয়া যায়নি।</p>
        </div>

        <button 
          onClick={handleLogout}
          className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          লগ আউট
        </button>
      </div>
    </div>
  );
};

export default UserProfile;