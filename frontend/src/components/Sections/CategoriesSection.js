
import { Link } from "react-router-dom";
import {toast} from "react-hot-toast"
import { FaShoppingCart } from 'react-icons/fa';

const CategoriesSection = ({categories}) => {
   
    return (
        <section className="categories mb-8 font-roboto">
            <h2 className="text-3xl font-bold mb-6 flex relative">
                <FaShoppingCart className="text-primary2 mr-2" />
                Shop by Categories
                <span className="w-full absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary2 to-primary3 mt-2"></span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2">
            {categories.map(category => (
                <div
                key={category._id}
                className="category-card "
                >
                    <img
                        src={category.image}
                        alt={category.name}
                        className="max-w-56 max-h-72 object-cover"
                    />
                    <div className="absolute inset-0 opacity-0 flex justify-center hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
                    >
                        <div className="text-white font-bold flex flex-col justify-center">
                            <h3 className="mb-2 text-2xl md:text-xl">{category.name}</h3>
                            <Link
                                to={`/Products?category=${category.name}`}
                                onClick={()=> toast.success(`${category.name} category`)}
                                className="md:text-sm underline hover:text-primary2 flex self-center"
                            >
                                See All!
                            </Link>
                        </div>
                    </div>
                </div>
                ))}
            </div>

        </section>
    );
}

export default CategoriesSection;
