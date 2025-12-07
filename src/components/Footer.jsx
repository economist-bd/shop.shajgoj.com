import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white text-xl font-bold mb-4">SHAJGOJ</h3>
          <p className="text-sm">বাংলাদেশের সবচেয়ে বড় বিউটি শপ। ১০০% অথেনটিক কসমেটিকস।</p>
        </div>
        
        <div>
          <h3 className="text-white font-bold mb-4">যোগাযোগ</h3>
          <ul className="text-sm space-y-2">
            <li>Owner: andrewlaraujo70@gmail.com</li>
            <li>Admin: eco452@gmail.com</li>
            <li>Mobile: 01715247588</li>
          </ul>
        </div>

        <div>
           <h3 className="text-white font-bold mb-4">আমাদের অ্যাপ ডাউনলোড করুন</h3>
           <div className="flex gap-2">
             <button className="bg-gray-700 px-4 py-2 rounded">Google Play</button>
             <button className="bg-gray-700 px-4 py-2 rounded">App Store</button>
           </div>
        </div>
      </div>
      <div className="text-center mt-8 pt-8 border-t border-gray-700 text-xs">
        &copy; 2025 Shajgoj Clone. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;