import React from 'react';

const Test = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Test Sayfası</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="text-gray-700">Bu bir test sayfasıdır.</p>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
          Test Butonu
        </button>
      </div>
    </div>
  );
};

export default Test;
