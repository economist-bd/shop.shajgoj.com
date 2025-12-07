import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Navbar = ({ user, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart();
  const [categories, setCategories] = useState([]);

  // ১. ডাটাবেস থেকে ক্যাটাগরি লোড করা (যাতে এডমিন প্যানেলের সাথে সিঙ্ক থাকে)
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const docSnap = await getDoc(doc(db, "siteConfig", "categories"));
        if (docSnap.exists()) {
          setCategories(docSnap.data().list || []);
        } else {
          // ডিফল্ট ক্যাটাগরি (যদি ডাটাবেসে না থাকে)
          setCategories(["Makeup", "Skin", "Hair", "Personal Care", "Mom & Baby"]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCats();
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 font-sans">
      {/* টপ বার (হটলাইন) */}
      <div className="bg-[#c21760] text-white text-xs py-2 text-center font-medium tracking-wide">
        সারা বাংলাদেশে ক্যাশ অন ডেলিভারি | হটলাইন: 01715247588
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4">
          {/* লোগো এবং মোবাইল মেনু বাটন */}
          <div className="flex items-center gap-4">
            <button onClick={() => setIsOpen(true)} className="lg:hidden text-gray-600 hover:text-[#c21760]">
              <Menu className="w-7 h-7" />
            </button>
            <Link to="/" className="text-3xl font-extrabold text-[#c21760] tracking-tighter">SHAJGOJ</Link>
          </div>

          {/* সার্চ বার (শুধুমাত্র ডেস্কটপে) */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="পণ্য খুঁজুন (উদাঃ লিপস্টিক, সিরাম...)"
              className="w-full border border-gray-300 rounded-full py-2.5 px-5 focus:outline-none focus:border-[#c21760] focus:ring-1 focus:ring-[#c21760] transition-all"
            />
            <button className="absolute right-4 top-2.5 text-gray-500 hover:text-[#c21760]">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* ডান পাশের আইকনস */}
          <div className="flex items-center gap-6">
             {/* এডমিন লিংক (শুধু এডমিন দেখবে) */}
            {isAdmin && (
              <Link to="/admin" className="hidden md:block bg-gray-800 text-white text-xs px-3 py-1 rounded hover:bg-black transition border border-gray-700">
                Admin Panel
              </Link>
            )}

            {/* প্রোফাইল আইকন */}
            <Link to="/profile" className="flex flex-col items-center text-gray-600 hover:text-[#c21760] transition group">
              <User className="w-6 h-6 group-hover:scale-110 transition" />
              <span className="text-xs font-medium hidden md:block mt-1">{user ? "প্রোফাইল" : "লগিন"}</span>
            </Link>

            {/* কার্ট আইকন ও কাউন্টার */}
            <Link to="/cart" className="relative flex flex-col items-center text-gray-600 hover:text-[#c21760] transition group">
              <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition" />
              <span className="text-xs font-medium hidden md:block mt-1">কার্ট</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c21760] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-bounce">
                  {cart.length}
                </span>
              )}
            </Link>
          </div>
        </div>
        
        {/* মোবাইল সার্চ বার (শুধুমাত্র মোবাইলে) */}
        <div className="mt-3 lg:hidden relative">
            <input
              type="text"
              placeholder="পণ্য খুঁজুন..."
              className="w-full border border-gray-200 bg-gray-50 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-[#c21760]"
            />
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* ডেস্কটপ ক্যাটাগরি মেনু (ডাটাবেস থেকে আসা) */}
      <div className="hidden lg:block border-t border-gray-100 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <ul className="flex justify-center gap-8 py-3 text-sm font-bold text-gray-600 uppercase tracking-wide">
            {categories.map((cat, idx) => (
              <li key={idx} className="hover:text-[#c21760] cursor-pointer transition relative group py-1">
                <Link to={`/`}>{cat}</Link> {/* আপাতত হোমে যাবে, ফিল্টার পরে যুক্ত করা যাবে */}
                {/* হোভার এফেক্ট লাইন */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#c21760] transition-all duration-300 group-hover:w-full"></span>
              </li>
            ))}
            <li className="text-[#c21760] font-bold cursor-pointer hover:underline relative group">
  <Link to="/offers" className="flex items-center gap-1">
    Offers
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] px-1 rounded animate-pulse">HOT</span>
  </Link>
</li>
          </ul>
        </div>
      </div>

      {/* মোবাইল মেনু ড্রয়ার (Sidebar) */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        {/* ব্যাকগ্রাউন্ড কালো ওভারলে */}
        <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
        
        {/* সাইডবার কন্টেন্ট */}
        <div className={`absolute top-0 left-0 w-4/5 max-w-xs h-full bg-white shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center p-5 border-b bg-[#c21760]">
            <span className="font-bold text-lg text-white">MENU</span>
            <button onClick={() => setIsOpen(false)} className="p-1 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 text-white">
               <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-5 overflow-y-auto h-full pb-20">
            {/* এডমিন লিংক মোবাইলের জন্য */}
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="block bg-gray-800 text-white text-center py-3 rounded-lg mb-6 font-bold shadow hover:bg-black">
                Go to Admin Panel
              </Link>
            )}

            <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Categories</h3>
            <div className="flex flex-col gap-1">
               {categories.map((cat, idx) => (
                 <Link 
                    key={idx} 
                    to={`/`}
                    onClick={() => setIsOpen(false)}
                    className="text-gray-700 hover:text-[#c21760] hover:bg-pink-50 py-3 px-3 rounded-lg transition font-medium border-b border-gray-50 last:border-0 flex justify-between items-center"
                 >
                   {cat}
                   <span className="text-gray-300">›</span>
                 </Link>
               ))}
            </div>

            <div className="mt-8 border-t pt-6 space-y-4">
              <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-gray-700 font-medium hover:text-[#c21760]">
                <User className="w-5 h-5" /> My Account
              </Link>
              <Link to="/cart" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-gray-700 font-medium hover:text-[#c21760]">
                <ShoppingCart className="w-5 h-5" /> Shopping Bag <span className="text-[#c21760] font-bold">({cart.length})</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;