import React from 'react';

const SalesSummary = ({totalSales}) => {
    return (
        <div className="bg-primary1 text-white shadow rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-4">Total Sales</h2>
            <p className="text-2xl">${totalSales}</p>
        </div>
    );
};

export default SalesSummary;
