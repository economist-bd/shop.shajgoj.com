import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, orderBy, query } from 'firebase/firestore';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('addProduct');

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* সাইডবার */}
      <aside className="w-64 bg-gray-900 text-white min-h-screen hidden md:block">
        <div className="p-6 text-2xl font-bold text-[#c21760]">Admin Panel</div>
        <nav className="flex flex-col">
          <button onClick={() => setActiveTab('addProduct')} className={`p-4 text-left hover:bg-gray-800 ${activeTab==='addProduct'?'bg-[#c21760]':''}`}>Add Product</button>
          <button onClick={() => setActiveTab('manageProducts')} className={`p-4 text-left hover:bg-gray-800 ${activeTab==='manageProducts'?'bg-[#c21760]':''}`}>Manage Products</button>
          <button onClick={() => setActiveTab('orders')} className={`p-4 text-left hover:bg-gray-800 ${activeTab==='orders'?'bg-[#c21760]':''}`}>Orders</button>
        </nav>
      </aside>

      {/* মেইন কন্টেন্ট */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'addProduct' && <AddProductForm />}
        {activeTab === 'manageProducts' && <ManageProducts />}
        {activeTab === 'orders' && <OrderList />}
      </main>
    </div>
  );
};

// ১. পণ্য যুক্ত করা
const AddProductForm = () => {
  const [formData, setFormData] = useState({ name: '', price: '', category: '', description: '', image: '' });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "products"), {
        ...formData,
        price: Number(formData.price),
        createdAt: new Date()
      });
      alert('Product Added Successfully!');
      setFormData({ name: '', price: '', category: '', description: '', image: '' });
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">নতুন পণ্য যুক্ত করুন</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Product Name" className="w-full border p-2 rounded" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required />
        <div className="grid grid-cols-2 gap-4">
           <input type="number" placeholder="Price" className="w-full border p-2 rounded" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} required />
           <select className="w-full border p-2 rounded" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}>
             <option value="">Category</option>
             <option>Makeup</option>
             <option>Skin</option>
             <option>Hair</option>
           </select>
        </div>
        <textarea placeholder="Description" className="w-full border p-2 rounded" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}></textarea>
        <input type="text" placeholder="Image URL (e.g. https://...)" className="w-full border p-2 rounded" value={formData.image} onChange={e=>setFormData({...formData, image: e.target.value})} />
        <button type="submit" className="w-full bg-[#c21760] text-white py-2 rounded font-bold">Upload Product</button>
      </form>
    </div>
  );
};

// ২. পণ্য ম্যানেজ (ডিলিট) করা
const ManageProducts = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure?")) {
      await deleteDoc(doc(db, "products", id));
      fetchProducts(); // রিফ্রেশ লিস্ট
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">সকল পণ্য ({products.length})</h2>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b">
                <td className="p-3"><img src={product.image} className="w-10 h-10 object-cover rounded"/></td>
                <td className="p-3">{product.name}</td>
                <td className="p-3">৳ {product.price}</td>
                <td className="p-3">
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 font-bold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ৩. অর্ডার লিস্ট এবং স্ট্যাটাস চেঞ্জ
const OrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    alert("Status Updated!");
    window.location.reload();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">অর্ডার লিস্ট ({orders.length})</h2>
      <div className="grid gap-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-4 rounded shadow border-l-4 border-[#c21760]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{order.orderId}</h3>
                <p className="text-sm text-gray-600">Customer: {order.customer?.name} ({order.customer?.phone})</p>
                <p className="text-sm text-gray-600">Address: {order.customer?.address}</p>
                <div className="mt-2 text-sm font-semibold">Total: ৳ {order.total}</div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs text-white ${order.status==='Pending'?'bg-yellow-500':'bg-green-500'}`}>
                  {order.status}
                </span>
                <div className="mt-2">
                  <select 
                    className="border p-1 text-xs rounded"
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    defaultValue={order.status}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;