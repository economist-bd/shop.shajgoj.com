import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = ({ user, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart();

  // সাজগোজের মতো ক্যাটাগরি লিস্ট
  const categories = [
    { name: "Makeup", sub: ["Face", "Eyes", "Lips", "Nails"] },
    { name: "Skin", sub: ["Moisturizer", "Serum", "Sunscreen", "Face Wash"] },
    { name: "Hair", sub: ["Shampoo", "Oil", "Conditioner", "Color"] },
    { name: "Personal Care", sub: ["Bath & Body", "Dental", "Hygiene"] },
    { name: "Mom & Baby", sub: ["Baby Food", "Diapers", "Skin Care"] },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      {/* টপ বার */}
      <div className="bg-[#c21760] text-white text-xs py-1 text-center">
        সারা বাংলাদেশে ক্যাশ অন ডেলিভারি | হটলাইন: 01715247588
      </div>

      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* লোগো এবং মোবাইল মেনু বাটন */}
          <div className="flex items-center gap-4">
            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="text-2xl font-bold text-[#c21760]">SHAJGOJ</Link>
          </div>

          {/* সার্চ বার */}
          <div className="hidden lg:flex flex-1 mx-8 relative">
            <input 
              type="text" 
              placeholder="পণ্য খুঁজুন (উদাঃ লিপস্টিক, সিরাম...)" 
              className="w-full border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:border-[#c21760]"
            />
            <button className="absolute right-3 top-2 text-gray-500">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* আইকনস */}
          <div className="flex items-center gap-6">
            {isAdmin && <Link to="/admin" className="text-red-600 font-bold">Admin Panel</Link>}
            
            <Link to="/profile" className="flex flex-col items-center text-gray-600 hover:text-[#c21760]">
              <User className="w-6 h-6" />
              <span className="text-xs hidden md:block">{user ? "প্রোফাইল" : "লগিন"}</span>
            </Link>
            <Link to="/cart" className="relative cursor-pointer text-gray-600 hover:text-[#c21760]">
  <ShoppingCart className="w-6 h-6" />
  <span className="absolute -top-2 -right-2 bg-[#c21760] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
    {cart.length}
  </span>
</Link>
            
            <div className="relative cursor-pointer text-gray-600 hover:text-[#c21760]">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-[#c21760] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* ডেস্কটপ ক্যাটাগরি মেনু */}
      <div className="hidden lg:block border-t">
        <div className="container mx-auto px-4">
          <ul className="flex justify-between py-3 text-sm font-medium text-gray-700">
            {categories.map((cat, idx) => (
              <li key={idx} className="group relative cursor-pointer hover:text-[#c21760]">
                {cat.name}
                {/* ড্রপডাউন */}
                <div className="absolute hidden group-hover:block top-full left-0 w-48 bg-white shadow-lg border rounded-b-lg p-2 z-50">
                  {cat.sub.map((sub, sIdx) => (
                    <Link key={sIdx} to={`/category/${sub}`} className="block py-1 hover:bg-gray-100 px-2 rounded">
                      {sub}
                    </Link>
                  ))}
                </div>
              </li>
            ))}
            <li className="text-[#c21760]">Offers</li>
          </ul>
        </div>
      </div>

      {/* মোবাইল মেনু ড্রয়ার */}
      {isOpen && (
        <div className="lg:hidden absolute top-0 left-0 w-3/4 h-screen bg-white shadow-2xl z-50 p-4 overflow-y-auto">
          <div className="flex justify-between mb-6">
            <span className="font-bold text-lg">Menu</span>
            <X onClick={() => setIsOpen(false)} className="w-6 h-6 cursor-pointer" />
          </div>
          {categories.map((cat, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="font-bold text-gray-800 mb-2">{cat.name}</h3>
              <div className="pl-4 flex flex-col gap-2 text-gray-600 text-sm">
                 {cat.sub.map((sub, sIdx) => (
                    <Link key={sIdx} to={`/category/${sub}`} onClick={()=>setIsOpen(false)}>{sub}</Link>
                 ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;