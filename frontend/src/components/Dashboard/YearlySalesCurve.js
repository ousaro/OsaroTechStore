import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const YearlySalesCurve = ({ data }) => {

    // Sort data by date in ascending order
    const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));


    return (
        <div className="bg-white shadow rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-4">Sales Over the Year</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sortedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="primary2" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default YearlySalesCurve;
