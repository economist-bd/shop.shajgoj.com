import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Filter, ShoppingBag } from 'lucide-react';

const Offer = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodSnapshot = await getDocs(collection(db, "products"));
        const prodList = prodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(prodList);
        setFilteredProducts(prodList);

        const catSnap = await getDoc(doc(db, "siteConfig", "categories"));
        if (catSnap.exists()) {
          setCategories(['All', ...catSnap.data().list]);
        } else {
          setCategories(['All', 'Makeup', 'Skin', 'Hair']);
        }
      } catch (error) {
        console.error("Error:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleFilter = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p => p.category === category);
      setFilteredProducts(filtered);
    }
  };

  if (loading) return <div className="text-center py-20 font-bold text-[#c21760]">লোডিং...</div>;

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="bg-gradient-to-r from-[#c21760] to-[#e91e63] text-white py-12 px-4 text-center shadow-lg">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-3 uppercase">Flash Sale</h1>
        <p className="text-lg opacity-90 mb-6">সীমিত সময়ের জন্য সকল পণ্যে বিশেষ ছাড়!</p>
        <div className="flex justify-center gap-4">
           {['02', '14', '35'].map((time, i) => (
             <div key={i} className="bg-white/20 backdrop-blur-md border border-white/30 text-white w-16 h-16 rounded-xl flex flex-col items-center justify-center font-bold">
               <span className="text-2xl">{time}</span>
               <span className="text-[10px] uppercase">{['Hr', 'Min', 'Sec'][i]}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-24">
            <h3 className="flex items-center gap-2 font-bold text-lg mb-4 border-b pb-2">
              <Filter className="w-5 h-5 text-[#c21760]" /> Filter
            </h3>
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
              {categories.map((cat, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleFilter(cat)}
                  className={`text-left px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    selectedCategory === cat ? 'bg-[#c21760] text-white' : 'bg-gray-100 hover:text-[#c21760]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="w-full md:w-3/4">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{selectedCategory} Deals</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-xl transition group relative flex flex-col">
                <div className="absolute top-2 left-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded z-10">SALE</div>
                <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded z-10">-15%</div>

                <Link to={`/product/${product.id}`} className="h-48 bg-gray-100 block overflow-hidden">
                  <img src={product.images ? product.images[0] : (product.image || product.img)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                </Link>

                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{product.category}</p>
                  <Link to={`/product/${product.id}`}>
                     <h3 className="font-bold text-sm mb-2 hover:text-[#c21760] line-clamp-2">{product.name}</h3>
                  </Link>
                  <div className="mt-auto pt-2 border-t border-dashed">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-[#c21760]">৳ {product.price}</span>
                      <span className="text-xs text-gray-400 line-through">৳ {Math.round(product.price * 1.15)}</span>
                    </div>
                    <button onClick={() => addToCart(product)} className="w-full bg-[#1a1a2e] text-white py-2 rounded-lg font-bold text-xs hover:bg-[#c21760] transition flex items-center justify-center gap-2">
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Offer;