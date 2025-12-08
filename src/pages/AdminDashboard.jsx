import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// নতুন এডিটর ইমপোর্ট
import { Editor, EditorProvider } from 'react-simple-wysiwyg';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('addProduct');
  const [editingProduct, setEditingProduct] = useState(null);

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-800">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 text-2xl font-extrabold text-[#c21760] text-center tracking-tight border-b border-gray-100">
          SHAJGOJ <span className="text-gray-800">ADMIN</span>
        </div>
        <nav className="flex-1 mt-6 px-4 space-y-2">
          <MenuButton label="Add Product" active={activeTab === 'addProduct'} onClick={() => { setActiveTab('addProduct'); setEditingProduct(null); }} />
          <MenuButton label="Manage Products" active={activeTab === 'manageProducts'} onClick={() => setActiveTab('manageProducts')} />
          <MenuButton label="Site Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <MenuButton label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
        </nav>
        <div className="p-4 text-xs text-gray-400 text-center border-t border-gray-100">Shajgoj • Admin v3.1</div>
      </aside>

      <main className="flex-1 p-8 ml-0 md:ml-64 overflow-y-auto min-h-screen bg-white">
        <div className="max-w-6xl mx-auto">
            {activeTab === 'addProduct' && <ProductForm editingProduct={editingProduct} setEditingProduct={setEditingProduct} setActiveTab={setActiveTab} />}
            {activeTab === 'manageProducts' && <ManageProducts setEditingProduct={setEditingProduct} setActiveTab={setActiveTab} />}
            {activeTab === 'settings' && <SiteSettings />}
            {activeTab === 'orders' && <OrderList />}
        </div>
      </main>
    </div>
  );
};

const MenuButton = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`w-full text-left py-3 px-4 rounded-lg transition-all font-medium ${active ? 'bg-[#c21760] text-white shadow-md' : 'text-gray-600 hover:bg-pink-50 hover:text-[#c21760]'}`}>{label}</button>
);

const ProductForm = ({ editingProduct, setEditingProduct, setActiveTab }) => {
  const [formData, setFormData] = useState({ name: '', price: '', category: '', description: '', images: [] });
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const docSnap = await getDoc(doc(db, "siteConfig", "categories"));
        if (docSnap.exists()) setCategories(docSnap.data().list || []);
      } catch (e) { console.error(e); }
    };
    fetchCats();
    if (editingProduct) setFormData(editingProduct);
  }, [editingProduct]);

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
      if (imageFiles.length > 0) {
        const newUrls = await handleImageUpload();
        imageUrls = [...imageUrls, ...newUrls];
      }
      const productData = { ...formData, price: Number(formData.price), images: imageUrls, image: imageUrls[0] || '', updatedAt: new Date() };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        alert('Product Updated!');
        setEditingProduct(null);
      } else {
        await addDoc(collection(db, "products"), { ...productData, createdAt: new Date() });
        alert('Product Added!');
      }
      setFormData({ name: '', price: '', category: '', description: '', images: [] });
      setImageFiles([]);
      if(editingProduct) setActiveTab('manageProducts'); 
    } catch (error) { alert("Error: " + error.message); }
    setLoading(false);
  };

  const removeImage = (index) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  return (
    <div className="bg-white border border-gray-200 p-8 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" placeholder="Name" className="border p-3 rounded" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required />
          <input type="number" placeholder="Price" className="border p-3 rounded" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <select className="border p-3 rounded bg-white" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} required>
            <option value="">Select Category</option>
            {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
          </select>
          <input type="file" multiple onChange={(e) => setImageFiles([...e.target.files])} className="border p-2 rounded" />
        </div>

        {formData.images?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {formData.images.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img} className="h-16 w-16 object-cover border rounded" />
                <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
              </div>
            ))}
          </div>
        )}

        <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
           {/* নতুন এডিটর কম্পোনেন্ট */}
           <EditorProvider>
             <Editor 
               value={formData.description} 
               onChange={(e) => setFormData({...formData, description: e.target.value})} 
               containerProps={{ style: { height: '200px' } }}
             />
           </EditorProvider>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#c21760] text-white py-3 rounded-lg font-bold hover:bg-pink-700">{loading ? "Saving..." : "Save Product"}</button>
      </form>
    </div>
  );
};

const SiteSettings = () => {
  const [bannerUrl, setBannerUrl] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bannerSnap = await getDoc(doc(db, "siteConfig", "banner"));
        if (bannerSnap.exists()) setBannerUrl(bannerSnap.data().url);
        const catSnap = await getDoc(doc(db, "siteConfig", "categories"));
        if (catSnap.exists()) setCategoryList(catSnap.data().list || []);
      } catch(e) { console.error(e); }
    };
    fetchData();
  }, []);

  const saveBanner = async () => { await setDoc(doc(db, "siteConfig", "banner"), { url: bannerUrl }); alert("Banner Saved!"); };
  const addCategory = async () => { if (!categoryInput.trim()) return; const newList = [...categoryList, categoryInput.trim()]; setCategoryList(newList); await setDoc(doc(db, "siteConfig", "categories"), { list: newList }); setCategoryInput(''); };
  const removeCategory = async (cat) => { if(window.confirm(`Delete "${cat}"?`)) { const newList = categoryList.filter(c => c !== cat); setCategoryList(newList); await setDoc(doc(db, "siteConfig", "categories"), { list: newList }); } };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold mb-4">Banner</h3>
        <div className="flex gap-4"><input type="text" className="flex-1 border p-3 rounded" value={bannerUrl} onChange={e=>setBannerUrl(e.target.value)} /><button onClick={saveBanner} className="bg-black text-white px-6 rounded font-bold">Save</button></div>
      </div>
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold mb-4">Categories</h3>
        <div className="flex gap-4 mb-6"><input type="text" className="flex-1 border p-3 rounded" value={categoryInput} onChange={e=>setCategoryInput(e.target.value)} /><button onClick={addCategory} className="bg-[#c21760] text-white px-6 rounded font-bold">Add</button></div>
        <div className="flex flex-wrap gap-2">{categoryList.map((cat, i) => (<span key={i} className="bg-gray-50 border px-4 py-2 rounded-full flex gap-3">{cat} <button onClick={() => removeCategory(cat)} className="text-red-500 font-bold">×</button></span>))}</div>
      </div>
    </div>
  );
};

// ManageProducts এবং OrderList আগের মতোই থাকবে
const ManageProducts = ({ setEditingProduct, setActiveTab }) => {
    const [products, setProducts] = useState([]);
    useEffect(() => { const f = async () => { const q = query(collection(db, "products"), orderBy("createdAt", "desc")); const s = await getDocs(q); setProducts(s.docs.map(d => ({id:d.id, ...d.data()}))); }; f(); }, []);
    const del = async (id) => { if(window.confirm("Delete?")) { await deleteDoc(doc(db, "products", id)); window.location.reload(); } };
    return (
        <div className="bg-white p-6 rounded shadow border">
            <h2 className="font-bold mb-4">Products</h2>
            {products.map(p => (
                <div key={p.id} className="flex justify-between border-b py-2">
                    <span>{p.name}</span>
                    <div className="gap-2 flex"><button onClick={()=>{setEditingProduct(p); setActiveTab('addProduct')}} className="text-blue-600">Edit</button><button onClick={()=>del(p.id)} className="text-red-600">Delete</button></div>
                </div>
            ))}
        </div>
    )
};

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    useEffect(() => { const f = async () => { const q = query(collection(db, "orders"), orderBy("createdAt", "desc")); const s = await getDocs(q); setOrders(s.docs.map(d => ({id:d.id, ...d.data()}))); }; f(); }, []);
    return <div className="bg-white p-6 rounded shadow border"><h2 className="font-bold mb-4">Orders</h2>{orders.map(o=><div key={o.id} className="border-b py-2">{o.orderId} - {o.customer?.name} - {o.status}</div>)}</div>
};

export default AdminDashboard;