import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import ProductDetails from './pages/ProductDetails';
import UserProfile from './pages/UserProfile';
import Footer from './components/Footer';
import Offer from './pages/Offer';
// নতুন যুক্ত করা হয়েছে
import Cart from './pages/Cart'; 
import { auth } from './firebase';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        // আপনার দেওয়া এডমিন ইমেইল
        if (authUser.email === "eco452@gmail.com") {
          setIsAdmin(true);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="font-sans text-gray-800">
        <Navbar user={user} isAdmin={isAdmin} />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/offers" element={<Offer />} />
          
          {/* এই লাইনটি নতুন যুক্ত করা হয়েছে */}
          <Route path="/cart" element={<Cart />} />

          {/* ইউজার প্রোফাইল এবং অর্ডার হিস্ট্রি */}
          <Route path="/profile" element={user ? <UserProfile user={user} /> : <Navigate to="/login" />} />

          {/* এডমিন প্যানেল প্রোটেকশন */}
          <Route 
            path="/admin/*" 
            element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} 
          />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;