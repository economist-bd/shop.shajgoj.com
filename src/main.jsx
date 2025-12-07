import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// আমরা যে Cart Context তৈরি করেছি সেটা ইমপোর্ট করছি
import { CartProvider } from './context/CartContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* পুরো অ্যাপটিকে CartProvider দিয়ে মুড়িয়ে দেওয়া হলো */}
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>,
)