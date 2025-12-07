import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // এডিটরের স্টাইল

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('addProduct');
  const [editingProduct, setEditingProduct] = useState(null);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* বাম পাশের সাইডবার */}
      <aside className="w-64 bg-[#1a1a2e] text-white hidden md:flex flex-col shadow-2xl fixed h-full overflow-y-auto">
        <div className="p-6 text-2xl font-bold text-[#c21760] text-center tracking-wider border-b border-gray-700">
          SHAJGOJ PRO
        </div>
        <nav className="flex-1 mt-6 px-2 space-y-2">
          <MenuButton 
            label="Add Product" 
            active={activeTab === 'addProduct'} 
            onClick={() => { setActiveTab('addProduct'); setEditingProduct(null); }} 
          />
          <MenuButton 
            label="Manage Products" 
            active={activeTab === 'manageProducts'} 
            onClick={() => setActiveTab('manageProducts')} 
          />
          <MenuButton 
            label="Site Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
          <MenuButton 
            label="Orders" 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')} 
          />
        </nav>
        <div className="p-4 text-xs text-gray-500 text-center border-t border-gray-700">
          v2.5.0 (Enterprise)
        </div>
      </aside>

      {/* মেইন কন্টেন্ট এরিয়া */}
      <main className="flex-1 p-8 ml-0 md:ml-64 overflow-y-auto min-h-screen">
        {activeTab === 'addProduct' && (
          <ProductForm 
            editingProduct={editingProduct} 
            setEditingProduct={setEditingProduct} 
            setActiveTab={setActiveTab} 
          />
        )}
        {activeTab === 'manageProducts' && (
          <ManageProducts 
            setEditingProduct={setEditingProduct} 
            setActiveTab={setActiveTab} 
          />
        )}
        {activeTab === 'settings' && <SiteSettings />}
        {activeTab === 'orders' && <OrderList />}
      </main>
    </div>
  );
};

// সাইডবার বাটন কম্পোনেন্ট
const MenuButton = ({ label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-300 font-medium ${
      active ? 'bg-[#c21760] shadow-lg translate-x-1 text-white' : 'hover:bg-gray-800 text-gray-300'
    }`}
  >
    {label}
  </button>
);

// ==========================================
// ১. প্রোডাক্ট ফর্ম (অ্যাড এবং এডিট)
// ==========================================
const ProductForm = ({ editingProduct, setEditingProduct, setActiveTab }) => {
  const [formData, setFormData] = useState({ name: '', price: '', category: '', description: '', images: [] });
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // ক্যাটাগরি লোড করা এবং এডিট মোড সেটআপ
  useEffect(() => {
    const fetchCats = async () => {
      const docSnap = await getDoc(doc(db, "siteConfig", "categories"));
      if (docSnap.exists()) {
        setCategories(docSnap.data().list || []);
      }
    };
    fetchCats();

    if (editingProduct) {
      setFormData(editingProduct);
    }
  }, [editingProduct]);

  // ছবি আপলোড লজিক
  const handleImageUpload = async () => {
    const urls = [];
    for (const file of imageFiles) {
      const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrls = formData.images || [];
      
      // নতুন ছবি থাকলে আপলোড হবে
      if (imageFiles.length > 0) {
        const newUrls = await handleImageUpload();
        imageUrls = [...imageUrls, ...newUrls];
      }

      // ফর্মের সব তথ্য একত্র করা
      const productData = { 
        ...formData, 
        price: Number(formData.price), 
        images: imageUrls,
        // সিঙ্গেল ইমেজ ফিল্ড রাখা হচ্ছে কম্পাটিবিলিটির জন্য
        image: imageUrls.length > 0 ? imageUrls[0] : '', 
        updatedAt: new Date() 
      };

      if (editingProduct) {
        // আপডেট মোড
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        alert('Product Updated Successfully!');
        setEditingProduct(null);
      } else {
        // অ্যাড মোড
        await addDoc(collection(db, "products"), { ...productData, createdAt: new Date() });
        alert('New Product Added Successfully!');
      }

      // রিসেট
      setFormData({ name: '', price: '', category: '', description: '', images: [] });
      setImageFiles([]);
      
      // এডিট শেষে ম্যানেজ ট্যাবে ফেরত নেওয়া
      if(editingProduct) setActiveTab('manageProducts'); 

    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    }
    setLoading(false);
  };

  // পুরনো ছবি রিমুভ করা (ফর্মের ভিতর থেকে)
  const removeImage = (indexToRemove) => {
    const newImages = formData.images.filter((_, index) => index !== indexToRemove);
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-5xl mx-auto border border-gray-200">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">
        {editingProduct ? 'Edit Product' : 'Add New Product'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-gray-600 mb-2">Product Name</label>
            <input 
              type="text" 
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#c21760] outline-none" 
              value={formData.name} 
              onChange={e=>setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-600 mb-2">Price (Taka)</label>
            <input 
              type="number" 
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#c21760] outline-none" 
              value={formData.price} 
              onChange={e=>setFormData({...formData, price: e.target.value})} 
              required 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-gray-600 mb-2">Category</label>
            <select 
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-[#c21760] outline-none bg-white" 
              value={formData.category} 
              onChange={e=>setFormData({...formData, category: e.target.value})} 
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-600 mb-2">Upload Images (Multiple)</label>
            <input 
              type="file" 
              multiple 
              onChange={(e) => setImageFiles([...e.target.files])} 
              className="w-full border p-2 rounded-lg bg-gray-50" 
            />
          </div>
        </div>

        {/* ইমেজ গ্যালারি প্রিভিউ (রিমুভ অপশন সহ) */}
        {formData.images && formData.images.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-bold mb-2">Current Images:</p>
            <div className="flex gap-4 flex-wrap">
              {formData.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} className="h-24 w-24 object-cover border rounded-lg shadow-sm" alt="Product" />
                  <button 
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* রিচ টেক্সট এডিটর */}
        <div>
           <label className="block font-semibold text-gray-600 mb-2">Detailed Description</label>
           <ReactQuill 
              theme="snow" 
              value={formData.description} 
              onChange={(val) => setFormData({...formData, description: val})} 
              className="h-40 mb-12 bg-white" 
           />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-[#c21760] hover:bg-pink-700 text-white py-4 rounded-lg font-bold text-lg shadow-md transition-all"
        >
          {loading ? "Processing..." : (editingProduct ? "Update Product" : "Save Product")}
        </button>
      </form>
    </div>
  );
};

// ==========================================
// ২. সাইট সেটিংস (ব্যানার ও ক্যাটাগরি)
// ==========================================
const SiteSettings = () => {
  const [bannerUrl, setBannerUrl] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // ব্যানার আনা
      const bannerSnap = await getDoc(doc(db, "siteConfig", "banner"));
      if (bannerSnap.exists()) setBannerUrl(bannerSnap.data().url);

      // ক্যাটাগরি আনা
      const catSnap = await getDoc(doc(db, "siteConfig", "categories"));
      if (catSnap.exists()) setCategoryList(catSnap.data().list || []);
    };
    fetchData();
  }, []);

  const saveBanner = async () => {
    await setDoc(doc(db, "siteConfig", "banner"), { url: bannerUrl });
    alert("Banner Settings Updated!");
  };

  const addCategory = async () => {
    if (!categoryInput.trim()) return;
    const newList = [...categoryList, categoryInput.trim()];
    setCategoryList(newList);
    await setDoc(doc(db, "siteConfig", "categories"), { list: newList });
    setCategoryInput('');
  };

  const removeCategory = async (cat) => {
    if(window.confirm(`Delete category "${cat}"?`)) {
      const newList = categoryList.filter(c => c !== cat);
      setCategoryList(newList);
      await setDoc(doc(db, "siteConfig", "categories"), { list: newList });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* ব্যানার সেটিংস */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Home Page Banner</h3>
        <div className="flex gap-4">
          <input 
            type="text" 
            className="flex-1 border p-3 rounded-lg" 
            placeholder="Paste Banner Image URL here..." 
            value={bannerUrl} 
            onChange={e=>setBannerUrl(e.target.value)} 
          />
          <button onClick={saveBanner} className="bg-[#c21760] text-white px-6 py-2 rounded-lg font-bold hover:bg-pink-700">Save</button>
        </div>
        {bannerUrl && (
          <div className="mt-4 p-2 border rounded bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">Preview:</p>
            <img src={bannerUrl} alt="Banner Preview" className="w-full h-48 object-cover rounded" />
          </div>
        )}
      </div>

      {/* ক্যাটাগরি সেটিংস */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Product Categories (Menu)</h3>
        <div className="flex gap-4 mb-6">
          <input 
            type="text" 
            className="flex-1 border p-3 rounded-lg" 
            placeholder="New Category Name (e.g. Organic, Men's Care)" 
            value={categoryInput} 
            onChange={e=>setCategoryInput(e.target.value)} 
          />
          <button onClick={addCategory} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold">Add</button>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {categoryList.map((cat, i) => (
            <span key={i} className="bg-gray-100 border px-4 py-2 rounded-full flex items-center gap-3 shadow-sm hover:bg-gray-200 transition">
              <span className="font-medium text-gray-700">{cat}</span>
              <button onClick={() => removeCategory(cat)} className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">×</button>
            </span>
          ))}
          {categoryList.length === 0 && <p className="text-gray-400 italic">No categories added yet.</p>}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ৩. ম্যানেজ প্রোডাক্টস (লিস্ট, এডিট, ডিলিট)
// ==========================================
const ManageProducts = ({ setEditingProduct, setActiveTab }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to PERMANENTLY delete this product?")) {
      await deleteDoc(doc(db, "products", id));
      fetchProducts(); // লিস্ট রিফ্রেশ
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setActiveTab('addProduct'); // ফর্ম ট্যাবে নিয়ে যাওয়া
  };

  if (loading) return <div className="text-center py-10">Loading products...</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-700">Inventory ({products.length})</h2>
        <button onClick={fetchProducts} className="text-sm text-[#c21760] hover:underline">Refresh List</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
            <tr>
              <th className="p-4 rounded-tl-lg">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4 rounded-tr-lg text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition">
                <td className="p-4 flex items-center gap-4">
                  <img 
                    src={product.images ? product.images[0] : (product.image || 'https://via.placeholder.com/50')} 
                    className="w-12 h-12 object-cover rounded-lg border" 
                    alt="" 
                  />
                  <span className="font-medium text-gray-800">{product.name}</span>
                </td>
                <td className="p-4 text-sm text-gray-500">{product.category}</td>
                <td className="p-4 font-bold text-[#c21760]">৳ {product.price}</td>
                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={() => handleEdit(product)} 
                    className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded hover:bg-blue-50 border border-transparent hover:border-blue-200"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)} 
                    className="text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded hover:bg-red-50 border border-transparent hover:border-red-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// ৪. অর্ডার লিস্ট (স্ট্যাটাস আপডেট সহ)
// ==========================================
const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      // লোকাল স্টেট আপডেট করা যাতে রিফ্রেশ না লাগে
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      alert("Order status updated to " + newStatus);
    } catch (error) {
      alert("Error updating status");
    }
  };

  if (loading) return <div className="text-center py-10">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-700">Customer Orders ({orders.length})</h2>
        <button onClick={fetchOrders} className="text-sm text-[#c21760] hover:underline">Refresh</button>
      </div>

      {orders.length === 0 && <p className="text-center text-gray-400 py-10">No orders found.</p>}

      {orders.map(order => (
        <div key={order.id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#c21760] flex flex-col md:flex-row justify-between gap-6 transition hover:shadow-lg">
          {/* অর্ডারের তথ্য */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-bold text-lg text-gray-800">{order.orderId || 'ID_MISSING'}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'Date N/A'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mt-3">
              <div>
                <p className="font-semibold text-gray-800">Customer Info:</p>
                <p>{order.customer?.name}</p>
                <p>{order.customer?.phone}</p>
                <p className="truncate w-full md:w-64" title={order.customer?.address}>{order.customer?.address}</p>
              </div>
              <div>
                 <p className="font-semibold text-gray-800">Order Summary:</p>
                 <p>Total: <span className="font-bold text-[#c21760] text-lg">৳ {order.total}</span></p>
                 <p>Pay: <span className="uppercase font-bold text-gray-500">{order.customer?.paymentMethod}</span></p>
                 {/* পণ্যের লিস্ট ছোট করে দেখানো */}
                 <div className="mt-1 text-xs text-gray-400">
                    {order.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                 </div>
              </div>
            </div>
          </div>
          
          {/* অ্যাকশন (স্ট্যাটাস চেঞ্জ) */}
          <div className="flex flex-col items-end gap-3 min-w-[150px]">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider ${
              order.status === 'Pending' ? 'bg-yellow-500' : 
              order.status === 'Processing' ? 'bg-blue-500' : 
              order.status === 'Delivered' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {order.status}
            </span>
            
            <div className="flex flex-col gap-1 w-full">
              <label className="text-xs text-gray-400 font-semibold">Change Status:</label>
              <select 
                className="border border-gray-300 p-2 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-[#c21760] outline-none cursor-pointer"
                onChange={(e) => updateStatus(order.id, e.target.value)}
                value={order.status}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;