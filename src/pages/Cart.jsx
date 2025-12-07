import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // চেকআউট ফর্ম স্টেট
  const [details, setDetails] = useState({ name: '', phone: '', address: '', paymentMethod: 'cod' });

  const handleOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (cart.length === 0) {
      alert("Cart is empty!");
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        items: cart,
        total: totalPrice,
        customer: details,
        status: 'Pending',
        userId: auth.currentUser ? auth.currentUser.uid : 'guest',
        createdAt: new Date(),
        orderId: `ORD-${Date.now()}` // ইউনিক অর্ডার আইডি
      };

      await addDoc(collection(db, "orders"), orderData);
      
      clearCart();
      alert("অর্ডার সফল হয়েছে! শীঘ্রই আমরা যোগাযোগ করব।");
      navigate('/'); // হোমপেজে রিডাইরেক্ট
    } catch (error) {
      console.error("Error placing order: ", error);
      alert("অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
    setLoading(false);
  };

  if (cart.length === 0) return <div className="text-center py-20 text-xl">আপনার কার্ট খালি!</div>;

  return (
    <div className="container mx-auto p-4 md:flex gap-6">
      {/* বাম পাশ: কার্ট আইটেম */}
      <div className="w-full md:w-2/3 bg-white p-4 shadow rounded">
        <h2 className="text-2xl font-bold mb-4">শপিং ব্যাগ ({cart.length})</h2>
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between items-center border-b py-4">
            <div className="flex gap-4">
              <img src={item.img || item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-500">৳ {item.price}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.id, -1)} className="px-2 bg-gray-200">-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, 1)} className="px-2 bg-gray-200">+</button>
              <button onClick={() => removeFromCart(item.id)} className="text-red-500 ml-4">মুছুন</button>
            </div>
          </div>
        ))}
      </div>

      {/* ডান পাশ: চেকআউট ফর্ম */}
      <div className="w-full md:w-1/3 mt-6 md:mt-0">
        <div className="bg-white p-6 shadow rounded sticky top-20">
          <h3 className="text-xl font-bold mb-4">অর্ডার সামারি</h3>
          <div className="flex justify-between mb-2">
            <span>সাবটোটাল</span>
            <span>৳ {totalPrice}</span>
          </div>
          <div className="flex justify-between mb-4 font-bold text-lg border-t pt-2">
            <span>সর্বমোট</span>
            <span>৳ {totalPrice + 60} (ডেলিভারি চার্জ সহ)</span>
          </div>

          <form onSubmit={handleOrder} className="space-y-3">
            <input 
              type="text" placeholder="আপনার নাম" required 
              className="w-full border p-2 rounded"
              onChange={(e) => setDetails({...details, name: e.target.value})}
            />
            <input 
              type="text" placeholder="মোবাইল নাম্বার" required 
              className="w-full border p-2 rounded"
              onChange={(e) => setDetails({...details, phone: e.target.value})}
            />
            <textarea 
              placeholder="পূর্ণ ঠিকানা" required 
              className="w-full border p-2 rounded"
              onChange={(e) => setDetails({...details, address: e.target.value})}
            ></textarea>
            
            <div className="mt-2">
                <label className="font-bold block mb-2">পেমেন্ট মেথড:</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                        <input type="radio" name="pay" value="cod" defaultChecked onChange={(e) => setDetails({...details, paymentMethod: e.target.value})} /> ক্যাশ অন ডেলিভারি
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="radio" name="pay" value="bkash" onChange={(e) => setDetails({...details, paymentMethod: e.target.value})} /> বিকাশ
                    </label>
                </div>
                {details.paymentMethod === 'bkash' && (
                    <div className="bg-pink-100 p-2 text-xs mt-2 rounded">
                        বিকাশ সেন্ড মানি করুন: <strong>01715247588</strong> নাম্বারে এবং নিচে ট্রানজেকশন আইডি দিন (অপশনাল)।
                    </div>
                )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#c21760] text-white py-3 rounded mt-4 font-bold hover:bg-pink-700 transition"
            >
              {loading ? "অর্ডার প্লেস হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cart;