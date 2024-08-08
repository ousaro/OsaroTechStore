import React, { useState } from 'react';

const PriceInput = ({ setPrice }) => {
    const [value, setValue] = useState("");

    const handleValueChange = (event) => {
        const newValue = event.target.value ? Number(event.target.value) : "";
        setValue(newValue);
        setPrice(newValue);
    };

    return (
        <div className='mt-10 font-roboto'>
            <h1 className="text-primary1 text-2xl border-b-primary2 border-b md:w-full font-bold mb-6">Price</h1>
            <div className="space-y-4">
                <div className="flex justify-start">
                    <input
                        type="text"
                        value={value}
                        onChange={handleValueChange}
                        className="p-1 px-2 ring-1 ring-primary1 rounded-md outline-none focus:ring-primary2 hover:ring-primary2 w-16"
                        placeholder="0"
                    /> 
                    <span className="text-primary1 ml-2 flex justify-center items-center font-bold">-</span>
                    <span className="text-primary1 ml-2 flex justify-center items-center font-bold">USD</span>
                </div>
            </div>
        </div>
    );
};

export default PriceInput;
