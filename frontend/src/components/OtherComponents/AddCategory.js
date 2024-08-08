import React, { useState } from 'react';
import { deleteCategory, addNewCategory } from '../../api/categories';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useCategoriesContext } from '../../hooks/useCategoriesContext';
import {toast} from "react-hot-toast"

const AddCategory = ({isModalOpen, isModalDeleteOpen, setIsModalOpen, setIsModalDeleteOpen}) => {

    const {categories , dispatch : dispatchCategories} = useCategoriesContext();
    const {user} = useAuthContext()

    const [emptyFieldsCategory,setEmptyFieldsCategory] = useState([])

    const initialCategoryState = {
        name: '',
        description: '',
        image: '',
    }
    
    const [newCategory, setNewCategory] = useState(initialCategoryState);


    const handleCategoryChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewCategory({ ...newCategory, [name]: reader.result });
            };
            reader.readAsDataURL(files[0]);
        } else {
            setNewCategory({ ...newCategory, [name]: value });
        }
    };



    const handleCategorySubmit = async (e) => {
        e.preventDefault()


        const {json, ok, emptyFields: categoryEmptyFields} = await addNewCategory(user, newCategory)
       

        if (!ok) {
            toast.error(json.error)
            setEmptyFieldsCategory(categoryEmptyFields || json.emptyFields || []);
        }

        else {  
            setEmptyFieldsCategory([]);
            setNewCategory(initialCategoryState);
           
            dispatchCategories({ type: "CREATE_CATEGORY", payload: json });
            setIsModalOpen(false); // Close the modal after category is added
            toast.success(`${json.name} category added successfully!`)
        }
    };

    const handleCategoryDelete = async (categoryId) => {

        const {json, ok} = await deleteCategory(user, categoryId);
        
        if(!ok){
            toast.error(json.error)
          
        }
        else{
            dispatchCategories({ type: "DELETE_CATEGORY", payload: json });
            toast.success(`${json.name} category deleted successfully!`)
        }
    };

    

    return (  
        <div>
                {isModalOpen  && (
                     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
                            <form onSubmit={handleCategorySubmit} className="space-y-4">
                                <div className="flex flex-col">
                                    <label htmlFor="newCategoryName" className="mb-2 font-medium">Name</label>
                                    <input
                                        type="text"
                                        id="newCategoryName"
                                        name="name"
                                        value={newCategory.name}
                                        onChange={handleCategoryChange}
                                        className={`w-full p-2 border border-gray-300 rounded mt-1 ${emptyFieldsCategory.includes("name") ? "outline outline-1 outline-red-600": ""}`}     
                                        />
                                        </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="newCategoryDescription" className="mb-2 font-medium">Description</label>
                                                <textarea
                                                    id="newCategoryDescription"
                                                    name="description"
                                                    value={newCategory.description}
                                                    onChange={handleCategoryChange}
                                                    className={`w-full p-2 border border-gray-300 rounded mt-1 resize-none ${emptyFieldsCategory.includes("description") ? "outline outline-1 outline-red-600": ""}`}
                                                
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <label htmlFor="newCategoryImage" className="mb-2 font-medium">Image</label>
                                                <input
                                                    type="file"
                                                    id="newCategoryImage"
                                                    name="image"
                                                    accept="image"
                                                    onChange={handleCategoryChange}
                                                    className="hidden"
                                                />
                                                <label
                                                    htmlFor="newCategoryImage"
                                                    className="cursor-pointer w-48 sm:w-64 bg-primary1 hover:bg-primary2 text-white p-2 rounded mt-1 flex items-center justify-center"
                                                >
                                                    Choose Image
                                                </label>
                                                <span className={`${newCategory.image ? "text-green-500" : "text-red-500"} text-sm mt-2`}>{newCategory.image ? "Good" : "Please upload an image. Recommended size: 500x500 pixels."}</span>
                                            </div>

                                            <div className="flex flex-col">
                                                <button type="submit" className="bg-primary1 w-48 sm:w-64 hover:bg-primary2 text-white p-2 rounded">Submit New Category</button>
                                                <button
                                                    type="button"
                                                    className="text-blue-500 hover:underline text-sm text-end"
                                                    onClick={() => setIsModalOpen(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>

                            </form>
                        </div>
                    </div>
                )}

                {isModalDeleteOpen  && (
                     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-7/12 xl:w-4/12">
                            <h2 className="text-xl font-bold mb-4">Delete Category</h2>
                            {categories.map((category) => (
                                   <div key={category._id}  className="flex justify-between items-center p-2 border-b shadow-lg bg-primary1 text-white rounded-lg">
                                    <span>{category.name}</span>
                                        <button
                                            type="submit"                                        
                                            className="hover:text-primary2 text-white"
                                            onClick={(e) => handleCategoryDelete(category._id)}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                className="w-6 h-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                   </div>
                            ))}
                            <div className='flex flex-col mt-5'>
                                <button
                                    type="button"
                                    className="text-blue-500 hover:underline text-sm text-end"
                                    onClick={() => setIsModalDeleteOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}
 
export default AddCategory;
