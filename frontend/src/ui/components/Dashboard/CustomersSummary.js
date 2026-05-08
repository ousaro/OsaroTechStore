import React from 'react';

const CustomersSummary = ({ totalCustomers }) => {
    return (
        <div className="bg-white text-primary1 shadow rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-4">Total Customers</h2>
            <p className="text-2xl">{totalCustomers}</p>
        </div>
    );
};

export default CustomersSummary;
