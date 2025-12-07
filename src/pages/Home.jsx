import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
// ১. কার্ট কন্টেক্সট ইমপোর্ট করা হলো
import { useCart } from '../context/CartContext';

const Home = () => {
  // ২. addToCart ফাংশনটি ব্যবহার করার জন্য কল করা হলো
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);

  // ফায়ারবেস থেকে প্রডাক্ট লোড করা
  useEffect(() => {
    const fetchProducts = async () => {
      // বর্তমানে ডেমো ডেটা রাখা হয়েছে যাতে আপনি এখনই টেস্ট করতে পারেন
      // রিয়েল ডাটাবেস কানেক্ট করতে চাইলে নিচের কমেন্ট আউট করা কোড ব্যবহার করবেন
      
      /* const querySnapshot = await getDocs(collection(db, "products"));
      setProducts(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))); 
      */
      
      // ডামি ডেটা (টেস্টিং এর জন্য)
      setProducts([
        { id: 1, name: "Matte Lipstick Red", price: 450, img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=400&q=80", category: "Makeup" },
        { id: 2, name: "Vitamin C Serum", price: 850, img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80", category: "Skin" },
        { id: 3, name: "Argan Oil Hair Mask", price: 1200, img: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=400&q=80", category: "Hair" },
        { id: 4, name: "Sunscreen SPF 50", price: 650, img: "https://images.unsplash.com/photo-1556228720-1987df2856c7?auto=format&fit=crop&w=400&q=80", category: "Skin" },
        { id: 5, name: "Eye Shadow Palette", price: 1500, img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80", category: "Makeup" },
      ]);
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* হিরো ব্যানার */}
      <div className="relative w-full h-[200px] md:h-[400px] bg-gray-200">
         <img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80" alt="Banner" className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-white text-3xl md:text-5xl font-bold mb-2">সেরা সাজ, সাশ্রয়ী দামে</h1>
              <p className="text-white text-sm md:text-lg">১০০% অথেনটিক কসমেটিকস এখন আপনার হাতের মুঠোয়</p>
            </div>
         </div>
      </div>

      {/* ফিচারড ক্যাটাগরি */}
      <div className="container mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">জনপ্রিয় ক্যাটাগরি</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {['Makeup', 'Skin Care', 'Hair Care', 'Fragrance'].map((cat, i) => (
             <div key={i} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition text-center cursor-pointer border hover:border-[#c21760]">
               <div className="h-20 w-20 bg-pink-100 rounded-full mx-auto mb-2 flex items-center justify-center text-[#c21760] font-bold text-xl">
                 {cat.charAt(0)}
               </div>
               <p className="font-semibold text-gray-700">{cat}</p>
             </div>
           ))}
        </div>
      </div>

      {/* নতুন প্রডাক্ট সেকশন */}
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
           <h2 className="text-2xl font-bold border-l-4 border-[#c21760] pl-3"> জাস্ট ইন (New Arrivals)</h2>
           <button className="text-[#c21760] font-semibold text-sm hover:underline">সকল পণ্য দেখুন</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-xl transition group relative">
              <div className="relative overflow-hidden h-48 bg-gray-100">
                <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                
                {/* ৩. বাটনে onClick ইভেন্ট যুক্ত করা হয়েছে */}
                <button 
                  onClick={() => addToCart(product)}
                  className="absolute bottom-2 right-2 bg-[#c21760] hover:bg-pink-700 text-white p-2 rounded-full shadow-lg text-xs transition transform active:scale-95"
                  title="Add to Cart"
                >
                  Add to Cart
                </button>
              </div>
              
              <div className="p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</p>
                <h3 className="font-semibold text-sm truncate text-gray-800" title={product.name}>{product.name}</h3>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-[#c21760] font-bold text-lg">৳ {product.price}</span>
                  <span className="text-gray-400 text-xs line-through mb-1">৳ {product.price + 150}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;