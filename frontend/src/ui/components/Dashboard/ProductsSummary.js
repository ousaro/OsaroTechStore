import React from 'react';

const ProductsSummary = ({totalProducts}) => {
    return (
        <div className="bg-white shadow rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-4">Total Products</h2>
            <p className="text-2xl">{totalProducts}</p>
        </div>
    );
};

export default ProductsSummary;
