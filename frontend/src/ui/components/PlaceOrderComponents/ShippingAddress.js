import React from 'react';

const ShippingAddress = ({ shippingAddress, setShippingAddress }) => {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            <div className="mb-4">
                <label className="block mb-2">Address:</label>
                <input
                    type="text"
                    value={shippingAddress.addressLine}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine: e.target.value })}
                    className="p-2 border rounded w-full"
                    placeholder="Enter your address"
                />
            </div>
            <div className="mb-4">
                <label className="block mb-2">City:</label>
                <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="p-2 border rounded w-full"
                    placeholder='Enter your city'
                />
            </div>
            <div className="mb-4">
                <label className="block mb-2">Postal Code:</label>
                <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="p-2 border rounded w-full"
                    placeholder='20330'
                />
            </div>
            <div className="mb-4">
                <label className="block mb-2">Country:</label>
                <input
                    type="text"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="p-2 border rounded w-full"
                    placeholder='Enter your County'
                />
            </div>

        </div>
    );
};

export default ShippingAddress;
