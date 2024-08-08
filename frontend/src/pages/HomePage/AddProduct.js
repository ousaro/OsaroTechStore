import React, { useState } from 'react';
import { ReactComponent as DescriptionIcon } from "../../img/icons/description.svg";
import { ReactComponent as PriceIcon } from "../../img/icons/price.svg";
import { ReactComponent as ImageIcon } from "../../img/icons/image.svg";
import { ReactComponent as CategoryIcon } from "../../img/icons/category.svg";
import { ReactComponent as InfoIcon } from "../../img/icons/info.svg";
import { useProductsContext } from '../../hooks/useProductsContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useCategoriesContext } from '../../hooks/useCategoriesContext';
import { addNewProduct } from '../../api/products';
import AddCategory from "../../components/OtherComponents/AddCategory"
import {toast} from "react-hot-toast"


const AddProduct = () => {

    const {dispatch} = useProductsContext();
    const {categories} = useCategoriesContext();
    const {user} = useAuthContext()
   
    const existingCategories = categories.map((cat) => cat.name);
   
    const [emptyFields,setEmptyFields] = useState([])
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
   
    const initialProductState = {
        name: '',
        description: '',
        raw_price: '',
        discount: '',
        image: "",
        otherImages: [],
        categoryId: '',
        category: '',
        countInStock: '',
        moreInformations: '',
      };

    const [newProduct, setNewProduct] = useState(initialProductState);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProduct({ ...newProduct, [name]: reader.result });
            };
            reader.readAsDataURL(files[0]);
        } else {
            if (name === "category") {
                const selectedCategory = categories.find(cat => cat.name === value);
                setNewProduct({ ...newProduct, [name]: value, categoryId: selectedCategory ? selectedCategory._id : null });
            } else {
                setNewProduct({ ...newProduct, [name]: value });
            }
        }
    };

    const handleOtherFilesChange = (e) => {
        const { files } = e.target;
        const fileReaders = [];
        const filesArray = [];

        for (let i = 0; i < files.length; i++) {
            const reader = new FileReader();
            fileReaders.push(new Promise((resolve, reject) => {
                reader.onloadend = () => {
                    filesArray.push(reader.result);
                    resolve();
                };
                reader.onerror = reject;
            }));
            reader.readAsDataURL(files[i]);
        }

        Promise.all(fileReaders).then(() => {
            setNewProduct({ ...newProduct, otherImages: filesArray });
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault()
        
       
        const { json, ok, emptyFields } = await addNewProduct(user, newProduct);

        if (!ok) {
            toast.error(json.error)
            setEmptyFields(emptyFields || json.emptyFields || []);
        } else {
            setEmptyFields([]);
            setNewProduct(initialProductState);
            dispatch({ type: "CREATE_PRODUCT", payload: json });
            toast.success(`${json.name} product added successfully!`)
        }

       
    };

    const discountOptions = [
        { value: '0', label: 'No Discount' },
        { value: '5', label: '5% Discount' },
        { value: '10', label: '10% Discount' },
        { value: '15', label: '15% Discount' },
        { value: '20', label: '20% Discount' },
        { value: '25', label: '25% Discount' },
        { value: '30', label: '30% Discount' },
        { value: '35', label: '35% Discount' },
        { value: '40', label: '40% Discount' },
        { value: '45', label: '45% Discount' },
        { value: '50', label: '50% Discount' },
        { value: '55', label: '55% Discount' },
        { value: '60', label: '60% Discount' },
        { value: '65', label: '65% Discount' },
        { value: '70', label: '70% Discount' },
        { value: '75', label: '75% Discount' },
        { value: '80', label: '80% Discount' },
        { value: '85', label: '85% Discount' },
        { value: '90', label: '90% Discount' },
        { value: '95', label: '95% Discount' },
        { value: '100', label: '100% Discount' },
    ];

    return (
        <div className="bg-gray-200 text-primary1 font-sans min-h-screen flex flex-col">
            <main className="xl:m-auto xl:w-10/12 flex-1 p-6">
                <h1 className="text-3xl font-bold mb-4 flex items-center">
                    Add New Product
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">

                      {/* product information */}
                    <div className='p-6 space-y-4 lg:w-10/12 m-auto grid grid-cols-1 md:grid-cols-1 gap-4'>

                        {/* product name */}
                        <div className="flex flex-col">
                            <label htmlFor="name" className="mb-2 font-medium flex items-center">
                                Product Name
                            </label>
                            <input type="text" id="name" name="name" value={newProduct.name} onChange={handleChange} className={`w-full p-2 border border-gray-300 rounded mt-1 ${emptyFields.includes("name") ? "outline outline-1 outline-red-600": ""}`} />
                        </div>

                        {/* product description */}
                        <div className="flex flex-col">
                            <label htmlFor="description" className="mb-2 font-medium flex items-center">
                                <DescriptionIcon className="w-6 h-6 mr-2" />
                                Description
                            </label>
                            <textarea id="description" name="description" value={newProduct.description} onChange={handleChange} className={`w-full p-2 border border-gray-300 rounded mt-1 resize-none ${emptyFields.includes("description") ? "outline outline-1 outline-red-600": ""}`} />
                        </div>

                        {/* product price */}
                        <div className="flex flex-col">
                            <label htmlFor="raw_price" className="mb-2 font-medium flex items-center">
                                <PriceIcon className="w-6 h-6 mr-2" />
                                Price
                            </label>
                            <div>
                                <input type="number" id="raw_price" name="raw_price" value={newProduct.raw_price} onChange={handleChange} className={`w-32 p-2 border border-gray-300 rounded mt-1 ${emptyFields.includes("description") ? "outline outline-1 outline-red-600": ""} `}  />
                                <span className='font-medium'> - $</span>
                            </div>
                        </div>  

                        {/* product discount */}
                        <div className="flex flex-col">
                            <label htmlFor="discount" className="mb-2 font-medium flex items-center">
                                <PriceIcon className="w-6 h-6 mr-2" />
                                Discount
                            </label>
                            <select
                                id="discount"
                                name="discount"
                                value={newProduct.discount}
                                onChange={handleChange}
                                className={`w-full p-2 border border-gray-300 rounded mt-1 ${emptyFields.includes("discount") ? "outline outline-1 outline-red-600": ""} `}
                            >
                                <option value="" disabled>Select a discount</option>
                                {discountOptions.map((option, index) => (
                                    <option key={index} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* product main image */}
                        <div className="flex flex-col">
                            <label htmlFor="image" className="mb-2 font-medium flex items-center">
                                <ImageIcon className="w-6 h-6 mr-2" />
                                Image
                            </label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image"
                                onChange={handleChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="image"
                                className="cursor-pointer w-64 bg-primary1 hover:bg-primary2 text-white p-2 rounded mt-1 flex items-center justify-center"
                            >
                                Choose Image
                            </label>
                            <span className={`${newProduct.image ? "text-green-500" : "text-red-500"} text-sm mt-2`}>
                                {newProduct.image ? "Good" : "Please upload a PNG image. Recommended size: 500x500 pixels."}</span>
                        </div>

                        {/* product other images */}
                        <div className="flex flex-col">
                            <label htmlFor="otherImages" className="mb-2 font-medium flex items-center">
                                <ImageIcon className="w-6 h-6 mr-2" />
                                Other Images (Files)
                            </label>
                            <input
                                type="file"
                                id="otherImages"
                                name="otherImages"
                                accept="image"
                                multiple
                                onChange={handleOtherFilesChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="otherImages"
                                className="cursor-pointer w-64 bg-primary1 hover:bg-primary2 text-white p-2 rounded mt-1 flex items-center justify-center"
                            >
                                Choose Files
                            </label>
                            <span className={`${newProduct.otherImages.length === 2 ? "text-green-500" : "text-red-500"} text-sm mt-2`}>{newProduct.otherImages.length === 2 ? "Good" : "Please upload 2 more PNG image. Recommended size: 500x500 pixels."}</span>
                        </div>

                        {/* product category */}
                        <div className="flex flex-col">
                            <label htmlFor="category" className="mb-2 font-medium flex items-center">
                                <CategoryIcon className="w-6 h-6 mr-2" />
                                Category
                            </label>
                            <div className='flex flex-col gap-4'>
                                <select
                                    id="category"
                                    name="category"
                                    value={newProduct.category}
                                    onChange={handleChange}
                                    className={`w-full p-2 border border-gray-300 rounded mt-1 ${emptyFields.includes("category") ? "outline outline-1 outline-red-600": ""} `}
                                  
                                    
                                >
                                    <option value="" disabled>Select a category</option>
                                    {existingCategories.map((category, index) => (
                                        <option key={index} value={category}>{category}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className="text-blue-500 hover:underline text-sm self-start"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    Add New Category   
                                </button>

                                <button
                                    type="button"
                                    className="text-blue-500 hover:underline text-sm self-start"
                                    onClick={() => setIsModalDeleteOpen(true)}
                                >
                                    Delete Category   
                                </button>
                            </div>
                          
                        </div>

                        {/* product count in stock */}
                        <div className="flex flex-col">
                            <label htmlFor="raw_price" className="mb-2 font-medium flex items-center">
                                <PriceIcon className="w-6 h-6 mr-2" />
                                Count In Stock
                            </label>
                            <div>
                                <input type="number" id="countInStock" name="countInStock" value={newProduct.countInStock} onChange={handleChange} className={`w-32 p-2 border border-gray-300 rounded mt-1 ${emptyFields.includes("countInStock") ? "outline outline-1 outline-red-600": ""} `} />
                                <span className='font-medium'> - Items</span>
                            </div>
                        </div>  

                        {/* product more informations */}
                        <div className="flex flex-col">
                            <label htmlFor="moreInformations" className="mb-2 font-medium flex items-center">
                                <InfoIcon className="w-6 h-6 mr-2" />
                                More Informations
                            </label>
                            <textarea id="moreInformations" name="moreInformations" value={newProduct.moreInformations} onChange={handleChange} className={`w-full p-2 border border-gray-300 rounded mt-1 resize-none ${emptyFields.includes("moreInformations") ? "outline outline-1 outline-red-600": ""} `} />
                        </div>
                    </div>

                    {/* Add product button */}
                     <div className='flex justify-end'>
                        <button type="submit" className="w-full md:w-3/12 flex justify-center px-4 py-2 bg-primary1 text-white font-semibold rounded-md hover:bg-primary2 focus:outline-none">
                            Add Product
                        </button>
                    </div>
                </form>

               <AddCategory isModalOpen={isModalOpen} isModalDeleteOpen={isModalDeleteOpen} setIsModalOpen={setIsModalOpen} setIsModalDeleteOpen={setIsModalDeleteOpen} />

            </main>
        </div>
    );
};

export default AddProduct;
