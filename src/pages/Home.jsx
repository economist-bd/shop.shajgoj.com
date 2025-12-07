import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ফায়ারবেস থেকে রিয়েল ডাটা আনা
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsArray = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setProducts(productsArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="text-center py-20">লোডিং হচ্ছে...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ব্যানার সেকশন */}
      <div className="relative w-full h-[200px] md:h-[400px] bg-gray-300 flex items-center justify-center">
         <h1 className="text-4xl font-bold text-[#c21760]">SHAJGOJ CLONE</h1>
      </div>

      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
           <h2 className="text-2xl font-bold border-l-4 border-[#c21760] pl-3"> জাস্ট ইন (New Arrivals)</h2>
           <Link to="/" className="text-[#c21760] font-semibold text-sm hover:underline">সকল পণ্য দেখুন</Link>
        </div>
        
        {products.length === 0 ? (
          <p className="text-center text-gray-500">কোনো পণ্য পাওয়া যায়নি। এডমিন প্যানেল থেকে পণ্য যুক্ত করুন।</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-xl transition group relative">
                {/* প্রোডাক্টের ছবিতে ক্লিক করলে ডিটেইলস পেজে যাবে */}
                <Link to={`/product/${product.id}`}>
                  <div className="h-48 bg-gray-100 w-full">
                    <img src={product.image || product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                </Link>
                
                {/* কার্ট বাটন */}
                <button 
                  onClick={() => addToCart(product)}
                  className="absolute top-2 right-2 bg-[#c21760] text-white p-2 rounded-full shadow-lg text-xs z-10"
                >
                  + Add
                </button>

                <div className="p-3">
                  <p className="text-xs text-gray-500 uppercase">{product.category}</p>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-sm truncate hover:text-[#c21760]">{product.name}</h3>
                  </Link>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[#c21760] font-bold">৳ {product.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;