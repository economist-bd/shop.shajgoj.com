import React from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  // বর্তমানে ডামি ডাটা, পরে ফায়ারবেস থেকে আনা হবে
  const product = {
    id: id,
    name: "Sample Product",
    price: 550,
    description: "This is a detailed description of the product.",
    img: "https://via.placeholder.com/400"
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <img src={product.img} alt={product.name} className="w-full rounded shadow" />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-xl text-[#c21760] font-bold mb-4">৳ {product.price}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <button 
            onClick={() => addToCart(product)}
            className="bg-[#c21760] text-white px-8 py-3 rounded font-bold hover:bg-pink-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;