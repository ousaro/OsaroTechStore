import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductsGrid from '../../components/Sections/ProductsGrid';
import FilterComponent from "../../components/OtherComponents/FilterComponent";
import PriceSlider from '../../components/OtherComponents/PriceSlider';
import { useProductsContext } from '../../hooks/useProductsContext';
import { useCategoriesContext } from '../../hooks/useCategoriesContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import { categorizeProducts } from '../../utils/utils';



const Products = () => {

    const {products, loading} = useProductsContext()
    const {categories} = useCategoriesContext()

    const {user} = useAuthContext()
    
    const admin = user.admin;


    const location = useLocation();
    const navigate = useNavigate();  

    const queryParams = useMemo(() => {
        return new URLSearchParams(location.search);
    }, [location.search]);
    

    const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || 'All Products');
    const [price, setPrice] = useState(queryParams.get('price') || 0);
    const [query, setQuery] = useState(queryParams.get('query') || '');

    // Update URL without reloading
    useEffect(() => {
        const params = new URLSearchParams();
        if (selectedCategory !== 'All Products') params.append('category', selectedCategory);
        if (price > 0) params.append('price', price);
        if (query) params.append('query', query);
        navigate({ search: params.toString() }, { replace: true });
    }, [selectedCategory, price,query, navigate]);


    // Update state from URL
    useEffect(() => {
        setSelectedCategory(queryParams.get('category') || 'All Products');
        setPrice(queryParams.get('price') || 0);
        setQuery(queryParams.get('query') || '');
    }, [queryParams]);


   // Categorize products
    const productList = useMemo(() => categorizeProducts(user,products), [products, user]);

    // Create a list of category names
    const categoryNames = ["All Products", ...categories.map(category => category.name)];

    // Filter products
    const filteredProducts = useMemo(() => {
        if (!productList[selectedCategory]) return [];

        return productList[selectedCategory].filter(product => {
            const matchesPrice = product.price <= price || price === 0;
            const matchesQuery = !query || product.name.toLowerCase().includes(query.toLowerCase());
            return matchesPrice && matchesQuery;
          });

        
    }, [productList, selectedCategory, price, query]);



    if (loading) {
        return (
            <div className="text-gray-800 font-roboto">
                <main className="xl:w-10/12 xl:m-auto p-4 flex flex-col gap-5">
                    <p>Loading...</p>
                </main>
            </div>
        );
    }


    return (
        <div className="text-gray-800 font-roboto">
            <main className="xl:w-10/12 xl:m-auto p-4 flex flex-col md:flex-row gap-5 justify-between">
                <ProductsGrid admin={admin} category={selectedCategory} products={filteredProducts}/>
                <div className='flex-shrink md:mt-5 mb-3 border-l-4 pl-10'>

                <FilterComponent
                    sectionTitle="Categories"
                    listItems={categoryNames}
                    selectedItemList={selectedCategory}
                    onSelect={setSelectedCategory}
                />

                <PriceSlider setPrice={setPrice} />

                {!admin && (
                    <>
                        <FilterComponent
                            sectionTitle="Favorites"
                            listItems={["Favorite"]}
                            selectedItemList={selectedCategory}
                            onSelect={setSelectedCategory}
                        />
                        <FilterComponent
                            sectionTitle="New Products"
                            listItems={["New Products"]}
                            selectedItemList={selectedCategory}
                            onSelect={setSelectedCategory}
                        />
                        <FilterComponent
                            sectionTitle="Hot Deals"
                            listItems={["Hot Deals"]}
                            selectedItemList={selectedCategory}
                            onSelect={setSelectedCategory}
                        />
                    </>
                )}
                </div>
            </main>
        </div>
    );
}

export default Products;
