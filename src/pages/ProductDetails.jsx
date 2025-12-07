import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such product!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-20">লোডিং...</div>;
  if (!product) return <div className="text-center py-20">পণ্যটি পাওয়া যায়নি!</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded shadow-sm">
        <div className="md:w-1/2">
          <img src={product.image || product.img} alt={product.name} className="w-full max-h-[500px] object-contain rounded" />
        </div>
        <div className="md:w-1/2 space-y-4">
          <span className="bg-pink-100 text-[#c21760] px-3 py-1 rounded text-xs font-bold uppercase">{product.category}</span>
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-3xl font-bold text-[#c21760]">৳ {product.price}</p>
          
          <div className="border-t border-b py-4 text-gray-600">
            <h3 className="font-semibold mb-2">বিবরণ:</h3>
            <p>{product.description || "এই পণ্যের বিস্তারিত বিবরণ শীঘ্রই যুক্ত করা হবে।"}</p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => addToCart(product)}
              className="flex-1 bg-[#c21760] text-white py-3 rounded font-bold hover:bg-pink-700 transition"
            >
              কার্টে যোগ করুন
            </button>
            <button className="flex-1 border border-[#c21760] text-[#c21760] py-3 rounded font-bold hover:bg-pink-50 transition">
              অর্ডার করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;