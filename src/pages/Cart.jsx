import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // চেকআউট ফর্ম স্টেট
  const [details, setDetails] = useState({ 
    name: '', 
    phone: '', 
    address: '', 
    paymentMethod: 'cod',
    transactionId: '' 
  });

  const deliveryCharge = 60;
  const grandTotal = totalPrice + deliveryCharge;

  const handleOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (cart.length === 0) {
      alert("Cart is empty!");
      setLoading(false);
      return;
    }

    // ইউনিক অর্ডার আইডি তৈরি
    const orderId = `ORD-${Date.now()}`;
    const orderDate = new Date().toLocaleString();

    try {
      // ১. ডাটাবেসে অর্ডার সেভ করার জন্য ডেটা রেডি করা
      const orderData = {
        items: cart,
        total: grandTotal,
        customer: details,
        status: 'Pending',
        userId: auth.currentUser ? auth.currentUser.uid : 'guest',
        createdAt: new Date(),
        orderId: orderId
      };

      // ফায়ারবেসে সেভ করা
      await addDoc(collection(db, "orders"), orderData);

      // ২. EmailJS এর মাধ্যমে মেইল পাঠানো
      // পণ্যের নামের লিস্ট তৈরি করা (ইমেইলে দেখানোর জন্য)
      const productList = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');

      const emailParams = {
        order_id: orderId,
        customer_name: details.name,
        customer_phone: details.phone,
        customer_address: details.address,
        total_amount: grandTotal,
        payment_method: details.paymentMethod,
        product_list: productList,
        order_date: orderDate
      };

      // আপনার দেওয়া ক্রেডেনশিয়াল
      await emailjs.send(
        "service_ar5c7ui",      // Service ID
        "template_ztu67ah",     // Template ID
        emailParams,
        "5Dxqskf0buqd2qZ66"     // Public Key
      );

      // সফল হলে কার্ট খালি করা এবং রিডাইরেক্ট
      clearCart();
      alert("অর্ডার সফল হয়েছে! আপনার ইমেইলে বিস্তারিত পাঠানো হয়েছে।");
      navigate('/'); 

    } catch (error) {
      console.error("Error placing order: ", error);
      // ইমেইল ফেইল হলেও অর্ডার যেন ডাটাবেসে থাকে, তাই এখানে শুধু অ্যালার্ট দেওয়া হলো
      alert("অর্ডার প্লেস হয়েছে, কিন্তু ইমেইল পাঠাতে সমস্যা হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।");
      navigate('/');
    }
    setLoading(false);
  };

  if (cart.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-2xl font-bold text-gray-400 mb-4">আপনার কার্ট খালি!</h2>
      <button onClick={() => navigate('/')} className="bg-[#c21760] text-white px-6 py-2 rounded">কেনাকাটা করুন</button>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:py-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Shopping Cart & Checkout</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* বাম পাশ: কার্ট আইটেম লিস্ট */}
        <div className="w-full md:w-2/3 bg-white p-6 shadow-lg rounded-xl">
          <h2 className="text-xl font-bold mb-6 border-b pb-2">Selected Items ({cart.length})</h2>
          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div className="flex gap-4 items-center">
                  <img src={item.image || item.img} alt={item.name} className="w-20 h-20 object-cover rounded-md border" />
                  <div>
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="text-[#c21760] font-semibold">৳ {item.price}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3 bg-white border rounded px-2 py-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-600 hover:text-[#c21760] font-bold text-lg">-</button>
                    <span className="font-medium w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-600 hover:text-[#c21760] font-bold text-lg">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ডান পাশ: চেকআউট ফর্ম */}
        <div className="w-full md:w-1/3">
          <div className="bg-white p-6 shadow-lg rounded-xl sticky top-24 border border-gray-100">
            <h3 className="text-xl font-bold mb-6 text-[#c21760]">Billing Details</h3>
            
            {/* কস্ট সামারি */}
            <div className="space-y-2 mb-6 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold">৳ {totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-bold">৳ {deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2 mt-2">
                <span>Total Payable</span>
                <span>৳ {grandTotal}</span>
              </div>
            </div>

            {/* ইউজার ইনপুট ফর্ম */}
            <form onSubmit={handleOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                <input 
                  type="text" required 
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-[#c21760]"
                  value={details.name}
                  onChange={(e) => setDetails({...details, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Mobile Number</label>
                <input 
                  type="tel" required 
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-[#c21760]"
                  value={details.phone}
                  onChange={(e) => setDetails({...details, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Shipping Address</label>
                <textarea 
                  required rows="3"
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-[#c21760]"
                  value={details.address}
                  onChange={(e) => setDetails({...details, address: e.target.value})}
                ></textarea>
              </div>
              
              <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-500 mb-2">Payment Method</label>
                  <div className="flex gap-4">
                      <label className={`flex-1 border rounded p-2 flex items-center justify-center gap-2 cursor-pointer ${details.paymentMethod === 'cod' ? 'border-[#c21760] bg-pink-50' : ''}`}>
                          <input type="radio" name="pay" value="cod" checked={details.paymentMethod === 'cod'} onChange={(e) => setDetails({...details, paymentMethod: e.target.value})} className="hidden" /> 
                          <span className="text-sm font-bold">Cash on Delivery</span>
                      </label>
                      <label className={`flex-1 border rounded p-2 flex items-center justify-center gap-2 cursor-pointer ${details.paymentMethod === 'bkash' ? 'border-pink-600 bg-pink-50' : ''}`}>
                          <input type="radio" name="pay" value="bkash" checked={details.paymentMethod === 'bkash'} onChange={(e) => setDetails({...details, paymentMethod: e.target.value})} className="hidden" /> 
                          <span className="text-sm font-bold text-pink-600">bKash</span>
                      </label>
                  </div>

                  {/* বিকাশ পেমেন্ট ফিল্ড */}
                  {details.paymentMethod === 'bkash' && (
                      <div className="bg-gray-100 p-3 mt-3 rounded text-sm animate-fade-in">
                          <p className="mb-2">বিকাশ সেন্ড মানি করুন: <strong className="text-[#c21760]">01715247588</strong></p>
                          <input 
                            type="text" 
                            placeholder="Enter Transaction ID" 
                            className="w-full border p-2 rounded"
                            required
                            value={details.transactionId}
                            onChange={(e) => setDetails({...details, transactionId: e.target.value})}
                          />
                      </div>
                  )}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#c21760] text-white py-3 rounded-lg font-bold hover:bg-pink-700 transition duration-300 shadow-md mt-4"
              >
                {loading ? "Processing Order..." : "Confirm Order"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;