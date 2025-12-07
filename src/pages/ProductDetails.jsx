import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(true);

  // ১. প্রোডাক্ট ডাটা লোড
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const docSnap = await getDoc(doc(db, "products", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProduct({ id: docSnap.id, ...data });
        // প্রথম ছবি বা পুরানো সিঙ্গেল ইমেজ সেট করা
        setMainImage(data.images ? data.images[0] : (data.image || data.img));
        
        // ২. রিলেটেড প্রোডাক্ট লোড
        fetchRelated(data.category, docSnap.id);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const fetchRelated = async (category, currentId) => {
    const q = query(collection(db, "products"), where("category", "==", category), limit(5));
    const snapshot = await getDocs(q);
    const related = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => item.id !== currentId); // বর্তমান পণ্য বাদ দেওয়া
    setRelatedProducts(related);
  };

  if (loading || !product) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded shadow-sm">
        
        {/* বাম পাশ: ইমেজ গ্যালারি */}
        <div className="md:w-1/2">
          <div className="border rounded overflow-hidden mb-4 relative group">
            {/* জুম ইফেক্ট (সহজ CSS দিয়ে) */}
            <img src={mainImage} alt={product.name} className="w-full h-[400px] object-contain transition-transform duration-500 transform group-hover:scale-125 cursor-zoom-in" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {/* থাম্বনেইল */}
            {product.images && product.images.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                onClick={() => setMainImage(img)}
                className={`w-20 h-20 object-cover border rounded cursor-pointer hover:opacity-75 ${mainImage === img ? 'border-[#c21760] border-2' : ''}`} 
              />
            ))}
          </div>
        </div>

        {/* ডান পাশ: ইনফো */}
        <div className="md:w-1/2 space-y-4">
          <span className="bg-pink-100 text-[#c21760] px-3 py-1 rounded text-xs font-bold uppercase">{product.category}</span>
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-3xl font-bold text-[#c21760]">৳ {product.price}</p>
          
          <div className="text-gray-600 prose prose-pink" dangerouslySetInnerHTML={{ __html: product.description }} />

          <div className="flex gap-4 pt-6">
            <button onClick={() => addToCart(product)} className="flex-1 bg-[#c21760] text-white py-3 rounded font-bold hover:bg-pink-700 transition">ADD TO CART</button>
            <button className="flex-1 border border-[#c21760] text-[#c21760] py-3 rounded font-bold hover:bg-pink-50 transition">BUY NOW</button>
          </div>
        </div>
      </div>

      {/* রিলেটেড প্রোডাক্ট সেকশন */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 border-l-4 border-[#c21760] pl-3">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {relatedProducts.map((item) => (
            <Link to={`/product/${item.id}`} key={item.id} className="bg-white border rounded hover:shadow-lg p-3 block">
               <img src={item.images ? item.images[0] : (item.image || item.img)} className="h-40 w-full object-cover mb-2" />
               <h4 className="font-bold text-sm truncate">{item.name}</h4>
               <p className="text-[#c21760] font-bold">৳ {item.price}</p>
            </Link>
          ))}
          {relatedProducts.length === 0 && <p className="text-gray-500">No related products found.</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;