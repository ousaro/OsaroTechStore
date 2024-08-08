const RecentOrders = ({resentOrdersData}) => {
    return ( 
        <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Recent Orders</h2>
            <div className="bg-white shadow rounded-lg p-5">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b-2 border-primary1 text-left">Order ID</th>
                            <th className="py-2 px-4 border-b-2 border-primary1 text-left">Customer</th>
                            <th className="py-2 px-4 border-b-2 border-primary1 text-left">Total</th>
                            <th className="py-2 px-4 border-b-2 border-primary1 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resentOrdersData.map((order, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border-b border-gray-200">{order._id}</td>
                                <td className="py-2 px-4 border-b border-gray-200">{order.ownerId}</td>
                                <td className="py-2 px-4 border-b border-gray-200">${order.totalPrice}</td>
                                <td className="py-2 px-4 border-b border-gray-200">{order.status}</td>
                            </tr>
                        ))}                        
                    </tbody>
                </table>
            </div>
        </div>
     );
}
 
export default RecentOrders;