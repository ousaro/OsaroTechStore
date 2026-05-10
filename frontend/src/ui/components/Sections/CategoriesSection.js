
import { Link } from "react-router-dom";
import {toast} from "react-hot-toast"
import { FaShoppingCart } from 'react-icons/fa';

const CategoriesSection = ({categories}) => {
   
    return (
        <section className="categories mb-12 font-roboto">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-extrabold text-primary1 md:text-3xl">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-primary4 text-primary2">
                    <FaShoppingCart />
                </span>
                Shop by Categories
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
                    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-primary1/85 via-primary1/20 to-transparent p-4 opacity-100 transition-opacity duration-300"
                    >
                        <div className="flex flex-col justify-center text-white font-bold">
                            <h3 className="mb-2 text-2xl md:text-xl">{category.name}</h3>
                            <Link
                                to={`/Products?category=${category.name}`}
                                onClick={()=> toast.success(`${category.name} category`)}
                                className="flex self-center rounded-md bg-white px-3 py-2 text-sm text-primary1 shadow-sm hover:text-primary2"
                            >
                                See all
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
