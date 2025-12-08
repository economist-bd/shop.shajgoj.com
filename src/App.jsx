import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import ProductDetails from './pages/ProductDetails';
import UserProfile from './pages/UserProfile';
import Footer from './components/Footer';
import Cart from './pages/Cart';
import Offer from './pages/Offer'; // অফার পেজ
import { auth } from './firebase';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // লোডিং স্টেট

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        // এডমিন চেক
        if (authUser.email === "eco452@gmail.com") {
          setIsAdmin(true);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false); // লোডিং শেষ
    });
    return () => unsubscribe();
  }, []);

  // যতক্ষণ ফায়ারবেস চেক করবে, ততক্ষণ লোডিং দেখাবে
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c21760] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold">Checking Access...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="font-sans text-gray-800 flex flex-col min-h-screen">
        <Navbar user={user} isAdmin={isAdmin} />
        
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/offers" element={<Offer />} />
            <Route path="/profile" element={user ? <UserProfile user={user} /> : <Navigate to="/login" />} />
            
            {/* এডমিন রাউট প্রোটেকশন */}
            <Route 
              path="/admin/*" 
              element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} 
            />
          </Routes>
        </div>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;