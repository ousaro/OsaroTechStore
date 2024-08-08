import React, { useRef, useEffect } from 'react';
import { useState } from 'react';
import HeroSection from '../../components/Sections/HeroSection';
import ProductsList from '../../components/Sections/ProductsList';
import CategoriesSection from '../../components/Sections/CategoriesSection';
import ReviewsSection from '../../components/Sections/ReviewsSection';
import HotDealSection from '../../components/Sections/HotDealSection';
import { useProductsContext } from '../../hooks/useProductsContext';
import { useCategoriesContext } from '../../hooks/useCategoriesContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import { handleAutomaticScroll } from '../../utils/utils';

const Home = () => {

    // Get products and categories and user from context
    const {products} = useProductsContext()
    const {categories} = useCategoriesContext()  
    const {user} = useAuthContext()
    
    const admin = user.admin;
    
    const [canScrollAutomaticProducts, setCanScrollAutomaticProducts] = useState(true);
    const [canScrollAutomaticReview, setCanScrollAutomaticReview] = useState(true);

    

    // Filter products to include only those marked as new
    const newProducts = products.filter(product => product.isNewProduct);

   // sort products by salesCount
    const productsSortedBySales = products.sort((a, b) => b.salesCount - a.salesCount);
    const productsTopSelling = productsSortedBySales.filter(product => product.salesCount !== 0).slice(0, 10) || [];

    // Get all reviews from all products
    const allReviews = products.flatMap(product => product.reviews);

    // Filter reviews to include only those with a rating above 4
    const filteredReviews = allReviews.filter(review => Number(review.rating) > 4);

    // Limit the number of reviews to 20 or fewer
    const reviews = filteredReviews.slice(0, 20);
       
   
    // Refs for automatic scrolling
    const productContainerRef = useRef(null);
    const reviewContainerRef = useRef(null);


    // Automatic scrolling
    useEffect(() => {
       if(canScrollAutomaticProducts){
            const productInterval = setInterval(() => {
                handleAutomaticScroll(productContainerRef);
            }, 3000); // Change interval time as needed

            return () => clearInterval(productInterval);
       }
    });

    useEffect(() => {
        if(canScrollAutomaticReview){
            const reviewInterval = setInterval(() => {
                handleAutomaticScroll(reviewContainerRef);
            }, 4000); // Change interval time as needed
    
            return () => clearInterval(reviewInterval);
        }
    });

    const handleClick = (event) => {
        if (!event.target.closest('.scroll-button')) {
            setCanScrollAutomaticProducts(true);
            setCanScrollAutomaticReview(true);
        }
    };




    return (
        <div className="text-gray-800 " onClick={handleClick}>
           
            <main>
            <HeroSection />
            <div className="xl:w-10/12 xl:m-auto p-4">

                    {/* Categories Section */}
                    {categories.length>0 ? (
                        <CategoriesSection categories={categories} />)
                        :
                        (
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Shop by Categories</h2>
                            <h2 className="text-primary1light text-2xl font-bold mb-6">no categories</h2>
                        </div>
                    )}

                    {/* new Products Section */}
                    {newProducts.length > 0 ? (
                        <ProductsList admin={admin} sectionId={1} products={newProducts} name={"New Products"} productContainerRef={productContainerRef} setCanScrollAutomaticProducts={setCanScrollAutomaticProducts} />
                    ):(
                        <div>
                            <h2 className="text-3xl font-bold mb-6">New Products </h2>
                            <h2 className="text-primary1light text-2xl font-bold mb-6">No products yet</h2>
                        </div>
                    )}
                </div>

                {/* Hot Deals Section */}
                <HotDealSection endDate={new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000)} /> {/* Example: 2 days from now */}


                <div className="xl:w-10/12 xl:m-auto p-4">

                    {/* Top selling Section */}
                    {productsTopSelling.length > 0 ? (
                        <ProductsList admin={admin} sectionId={2} products={productsTopSelling} name={"Top Selling Products"} productContainerRef={productContainerRef} 
                        setCanScrollAutomaticProducts={setCanScrollAutomaticProducts} />
                    ):(
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Top Selling Products </h2>
                            <h2 className="text-primary1light text-2xl font-bold mb-6">No products yet</h2>
                        </div>
                    )}
                    
                    {/* review Section */}
                    {reviews.length>0 ? (
                        <ReviewsSection reviews={reviews} reviewContainerRef={reviewContainerRef} setCanScrollAutomaticReview ={setCanScrollAutomaticReview} />
                        ):(
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
                            <h2 className="text-primary1light text-2xl font-bold mb-6">No Reviews</h2>
                        </div>
                        )}
                   
                </div>


            </main>
           
        </div>
    );
}

export default Home;
