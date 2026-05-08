import React from 'react';

const OrdersSummary = ({totalOrders}) => {
    return (
        <div className="bg-white shadow rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-4">Total Orders</h2>
            <p className="text-2xl">{totalOrders}</p>
        </div>
    );
};

export default OrdersSummary;
