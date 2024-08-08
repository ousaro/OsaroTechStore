// CardDetail.js
import React, { useState } from 'react';
import {  useParams } from 'react-router-dom';
import StarRating from '../../components/OtherComponents/StarRating';
import ProductsList from '../../components/Sections/ProductsList';
import ReviewsSection from '../../components/Sections/ReviewsSection';
import { useEffect, useRef } from 'react';
import Modal from "react-modal";
import { useAuthContext } from '../../hooks/useAuthContext';
import {toast} from "react-hot-toast"
import { getProductById } from '../../api/products';
import AddReview from '../../components/OtherComponents/AddReview';
import AddToCart from '../../components/OtherComponents/AddToCart';
import {handleAutomaticScroll, openModal, closeModal } from '../../utils/utils';

const CardDetail = () => {

    const {user} = useAuthContext();
    const { cardId } = useParams();
    
    const admin = user.admin;


    const productContainerRef = useRef(null);
    const reviewContainerRef = useRef(null);

    const [canScrollAutomaticProducts, setCanScrollAutomaticProducts] = useState(true);
    const [canScrollAutomaticReview, setCanScrollAutomaticReview] = useState(true);

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);


    const initialProductState = {
      reviews : [],
      relatedProducts : [],
    };

    const [product, setProduct] = useState(initialProductState);
    const [relatedProducts, setRelatedProducts] = useState([])
  

    const [stockCount, setStockCount] = useState(0)
    const [quantity, setQuantity] = useState(1);
    
    const [loading, setLoading] = useState(true);
    const [disableAddToCart, setDisableAddToCart] = useState(false)
    const [productExistInCart, setProductExistInCart] = useState(false);


    // Automatic scroll
    useEffect(() => {
      if(canScrollAutomaticProducts){
        const Interval = setInterval(() => {
            handleAutomaticScroll(productContainerRef);
        }, 4000); // Change interval time as needed

        return () => clearInterval(Interval);
      }
    });

    useEffect(() => {
      if(canScrollAutomaticReview){
        const Interval = setInterval(() => {
            handleAutomaticScroll(reviewContainerRef);
        }, 4000); // Change interval time as needed

        return () => clearInterval(Interval);
      }
    });

    const handleClick = (event) => {
        if (!event.target.closest('.scroll-button')) {
            setCanScrollAutomaticProducts(true);
            setCanScrollAutomaticReview(true);
        }
    };

    
  
    // Fetch product by id
    useEffect(() => {

      const fetchProducts = async () => {

        const {json, ok, isloading} = await getProductById(user, cardId)

        setLoading(isloading)

        if(!ok){
          toast.error(json.error)
        }
        else{

          setProduct(json.product || {});
          setRelatedProducts(json.relatedProducts);  
        }

      };
  
      if (user) {
        fetchProducts();
      }
    }, [user, cardId]);


    // Check if product exist in cart
    useEffect(()=>{
      // Find the product stoke count
      let quantityToBuy = 0
       
       const existingProductIndex = user.cart.findIndex(item => item._id === cardId);

       if(existingProductIndex === -1){
          quantityToBuy= quantity
          setProductExistInCart(false)
       }else{
          setProductExistInCart(true)
          user.cart.map(item =>
            (item._id === cardId) ? quantityToBuy = item.quantity + quantity : quantityToBuy
          );
       }

      setStockCount( product?.countInStock)

      if(quantityToBuy <= stockCount) {
       
        setDisableAddToCart(false)
      }else{
       
        setDisableAddToCart(true)
      }
    }, [quantity, product, stockCount, cardId, user])


  
  if (loading) { 
      return (
        <div className="text-gray-800 font-roboto">
       
            <main className="xl:w-10/12 xl:m-auto p-4 flex flex-col gap-5">
              <h1 className="text-2xl font-bold mb-4">Card Detail</h1>
              <p>Loading...</p>
            </main>
        
      </div>
      ); 
  }

  if (!product) {
    return (
      <div className="text-gray-800 font-roboto">
       
        <main className="xl:w-10/12 xl:m-auto p-4 flex flex-col gap-5">
          <h1 className="text-2xl font-bold mb-4">Card Detail</h1>
          <p>Product not found</p>
        </main>
        
      </div>
    );
  }

  
  return (
    <div className="text-gray-800 font-roboto" onClick={handleClick}>
     
      <main className="xl:w-10/12 xl:m-auto p-4 flex flex-col gap-5">
        <h1 className="text-3xl font-bold mb-6 text-start">Card Detail</h1>

        {/* products details */}
        <div className="flex flex-col md:flex-row gap-5 lg:gap-24 xl:gap-5">
          <div className="flex flex-col sm:flex-row gap-3">

            <img src={product.image} alt={product.name} className="w-96 cursor-pointer rounded-lg shadow-lg" onClick={() => openModal(product.image,setSelectedImage, setModalIsOpen)}/>

            <div className="flex sm:flex-col mt-5 sm:mt-0 gap-2 sm:min-w-20">
              {product.otherImages.map((img, index) => (

                <img key={index} src={img} alt={`${product.name} ${index + 1}`} className="w-16 h-16 rounded-lg shadow-lg" onClick={() => openModal(img, setSelectedImage, setModalIsOpen)}/>
              ))}

              <Modal isOpen={modalIsOpen} onRequestClose={()=> closeModal(setSelectedImage, setModalIsOpen)} className="modalContent "  overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40">
              <div className="  w-full">
                {selectedImage && <img src={selectedImage} alt="Selected" className="h-64 md:h-96 m-auto" />}
                <button onClick={()=> closeModal(setSelectedImage, setModalIsOpen)} className="flex m-auto text-white bg-primary1 hover:bg-primary2 py-1 px-4 rounded-md mt-2 ">Close</button>
              </div>
              </Modal>
            </div>
          </div>

          <div className="flex flex-col gap-4">

            <h2 className="text-3xl font-bold">{product.name}</h2>

            <StarRating rating={product.rating} />

            <p>{product.description}</p>

            <div className='flex gap-2'>
                <p className="text-lg font-bold text-primary2">${product.price.toFixed(2)}</p>
                <p className="text-gray-500 line-through flex items-end">${product.raw_price.toFixed(2)}</p>
            </div>
           

            <p>Category: {product.category}</p>

            {product.isnewProduct && <p className="text-primary2 font-bold">New Product</p>}

           {!admin && 
            <AddToCart cardId={cardId} product={product} setQuantity={setQuantity} quantity={quantity} disableAddToCart={disableAddToCart} productExistInCart={productExistInCart}/>
           }


          </div>
        </div>

          {/* product more info */}
        <div className="mt-4">

          <h2 className="text-3xl font-bold mb-6 text-start">More Information</h2>
          <p>{product.moreInformations}</p>

        </div>

        {/* reviews */}
        <div className="mt-4">
            {product.reviews.length>0 ? (
              <ReviewsSection reviews={product.reviews} reviewContainerRef={reviewContainerRef} setCanScrollAutomaticReview ={setCanScrollAutomaticReview} />
            ):(
              <div>
                <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
                <h2 className="text-primary1light text-2xl font-bold mb-6">No Reviews</h2>
              </div>
            )}
            {!admin &&  
              <AddReview  product={product} setProduct={setProduct} cardId={cardId}/>
            }
        </div>

        {/* relatedProducts */}
        <div className="mt-4 z-0">
          {relatedProducts.length > 0 ? (
            <ProductsList admin={admin} products={relatedProducts} name="Related Products" productContainerRef={productContainerRef} setCanScrollAutomaticProducts={setCanScrollAutomaticProducts} />
          ):
          (
            <div>
              <h2 className="text-3xl font-bold mb-6">Related Products</h2>
              <h2 className="text-primary1light text-2xl font-bold mb-6">No Products</h2>
            </div>
          )}
        </div>

      </main>
     
    </div>
  );
};

export default CardDetail;
