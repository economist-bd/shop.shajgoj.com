import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('addProduct');
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* সাইডবার */}
      <aside className="w-64 bg-gray-800 text-white p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="flex flex-col gap-4">
          <button onClick={() => setActiveTab('stats')} className={`text-left p-2 rounded ${activeTab==='stats' ? 'bg-[#c21760]' : ''}`}>Dashboard</button>
          <button onClick={() => setActiveTab('addProduct')} className={`text-left p-2 rounded ${activeTab==='addProduct' ? 'bg-[#c21760]' : ''}`}>Add Product</button>
          <button onClick={() => setActiveTab('orders')} className={`text-left p-2 rounded ${activeTab==='orders' ? 'bg-[#c21760]' : ''}`}>Orders</button>
          <button onClick={() => setActiveTab('users')} className={`text-left p-2 rounded ${activeTab==='users' ? 'bg-[#c21760]' : ''}`}>Users</button>
        </nav>
      </aside>

      {/* মেইন কন্টেন্ট */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-700 capitalize">{activeTab}</h1>

        {activeTab === 'addProduct' && <AddProductForm />}
        {activeTab === 'orders' && <OrderList />}
        {activeTab === 'stats' && <DashboardStats />}
      </main>
    </div>
  );
};

// সাব-কম্পোনেন্ট: পণ্য যুক্ত করা
const AddProductForm = () => {
  const [formData, setFormData] = useState({
    name: '', price: '', category: '', description: '', image: ''
  });

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
      console.error(error);
      alert('Error adding product');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-lg">
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Product Name</label>
        <input type="text" className="w-full border p-2 rounded" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
           <label className="block text-sm font-bold mb-2">Price</label>
           <input type="number" className="w-full border p-2 rounded" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} required />
        </div>
        <div>
           <label className="block text-sm font-bold mb-2">Category</label>
           <select className="w-full border p-2 rounded" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}>
             <option>Select</option>
             <option>Makeup</option>
             <option>Skin</option>
             <option>Hair</option>
           </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Image URL</label>
        <input type="text" className="w-full border p-2 rounded" placeholder="https://..." value={formData.image} onChange={e=>setFormData({...formData, image: e.target.value})} />
      </div>
      <button type="submit" className="bg-[#c21760] text-white py-2 px-4 rounded hover:bg-pink-700 w-full">Add Product</button>
    </form>
  );
};

// সাব-কম্পোনেন্ট: অর্ডার লিস্ট (ডামি)
const OrderList = () => (
    <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-200">
                    <th className="p-4 border">Order ID</th>
                    <th className="p-4 border">Customer</th>
                    <th className="p-4 border">Amount</th>
                    <th className="p-4 border">Status</th>
                    <th className="p-4 border">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="p-4 border">#ORD-001</td>
                    <td className="p-4 border">Monjurul Haque</td>
                    <td className="p-4 border">৳ 1,250</td>
                    <td className="p-4 border"><span className="bg-yellow-200 text-yellow-800 py-1 px-3 rounded text-xs">Pending</span></td>
                    <td className="p-4 border"><button className="text-blue-600">View</button></td>
                </tr>
            </tbody>
        </table>
    </div>
);

// সাব-কম্পোনেন্ট: স্ট্যাটস
const DashboardStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-500 text-white p-6 rounded shadow">
            <h3 className="text-xl">Total Sales</h3>
            <p className="text-3xl font-bold">৳ ৫০,০০০</p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded shadow">
            <h3 className="text-xl">Total Orders</h3>
            <p className="text-3xl font-bold">১২০ টি</p>
        </div>
        <div className="bg-purple-500 text-white p-6 rounded shadow">
            <h3 className="text-xl">Active Products</h3>
            <p className="text-3xl font-bold">৪৫০ টি</p>
        </div>
    </div>
);

export default AdminDashboard;