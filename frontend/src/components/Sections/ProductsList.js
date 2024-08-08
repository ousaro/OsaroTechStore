
import StarRating from "../OtherComponents/StarRating"
import WishlistButton from "../Buttons/WishlistButton"
import AddToCartButton from "../Buttons/AddToCartButton"
import NavigationButton from "../Buttons/NavigationButton"
import OpenEye from "../../img/icons/openEyeIcon.svg"
import { Link } from "react-router-dom"
import { useState } from "react"
import Modal from "react-modal"
import { openModal, closeModal } from "../../utils/utils"
import { FaShoppingCart } from 'react-icons/fa';

const ProductsList = ({admin,sectionId,products,name,productContainerRef, setCanScrollAutomaticProducts}) => {

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

      const handleHover = (event) => {

        const productId = event.currentTarget.getAttribute('data-product-id');
        const productActions = document.querySelector(`.product-actions[data-product-id="${productId}"]`);
        const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
        const productImg = document.querySelector(`.product-img[data-product-id="${productId}"]`);
        
        if (productActions) {
          productActions.classList.add('visible');
        } else {
          console.warn(`Element with class .product-actions and data-product-id="${productId}" not found.`);
        }
      
        if (productCard) {
          productCard.classList.add('hoverCard');
          productImg.classList.add('product-img-hover');
        } else {
          console.warn(`Element with class .product-card not found within the current target.`);
        }
      }
      
      const handleMouseLeave = (event) => {
        const productId = event.currentTarget.getAttribute('data-product-id');
        const productActions = document.querySelector(`.product-actions[data-product-id="${productId}"]`);
        const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
        const productImg = document.querySelector(`.product-img[data-product-id="${productId}"]`);

      
        if (productActions) {
          productActions.classList.remove('visible');

        } else {
          console.warn(`Element with class .product-actions and data-product-id="${productId}" not found.`);
        }
      
        if (productCard) {
          productCard.classList.remove('hoverCard');
          productImg.classList.remove('product-img-hover');
          
        } else {
          console.warn(`Element with class .product-card not found within the current target.`);
        }
      }
      

  
    return ( 
        <section className="featured-products mb-8 font-roboto">
          <h2 className="text-3xl font-bold mb-6 flex relative">
                <FaShoppingCart className="text-primary2 mr-2" />
                {name}
                <span className="w-full absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary2 to-primary3 mt-2"></span>
            </h2>
            <div className="">
                <div ref={productContainerRef} data-name="productContainerRef" className="flex gap-5 overflow-x-auto hide-scrollbar p-2">
                    {products.map((product) => (
                        <div className='products_container' key={product._id} >

                            

                            <div key={product._id} className=" product-card relative" data-product-id={`${sectionId}-${product._id}`}  onMouseEnter={handleHover} onMouseLeave={handleMouseLeave}>
                                <div className="overflow-hidden">
                                    <img src={product.image} alt={product.name} className="product-img" data-product-id={`${sectionId}-${product._id}`}/>

                                    {product.isNewProduct && 
                                        <div className="absolute top-0 right-0 m-2 bg-primary2 text-white px-2 py-1 rounded-md">
                                            <p className="text-xs font-bold">New</p>
                                        </div>
                                    }

                                   {!admin && 
                                      <div className="absolute left-2 bottom-1">
                                        <WishlistButton productId={product._id}/>
                                      </div>
                                    }

                                    <div className="absolute right-2 bottom-2">
                                      <button>
                                        <img src={OpenEye} alt="View Detail" className="w-6 h-6 opacity-25 hover:opacity-50 transition duration-300 ease-in-out" onClick={() => openModal(product.image, setSelectedImage, setModalIsOpen)}/>
                                      </button>
                                      <Modal isOpen={modalIsOpen} onRequestClose={() => closeModal(setSelectedImage, setModalIsOpen)} className="modalContent "  overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40">
                                            <div className="  w-full">
                                            {selectedImage && <img src={selectedImage} alt="Selected" className="h-64 md:h-96 m-auto" />}
                                              <button onClick={() => closeModal(setSelectedImage, setModalIsOpen)} className="flex m-auto text-white bg-primary1 hover:bg-primary2 py-1 px-4 rounded-md mt-2 ">Close</button>
                                            </div>
                                        </Modal>
                                    </div>

                                    <h1 className="text-lg font-semibold mb-1 text-primary1light text-center">{product.category}</h1>

                                    <div className="p-1">
                                        <Link to={`/CardDetail/${product._id}`}><h3 className="text-xl font-semibold mb-0.5 text-center">{product.name}</h3></Link>

                                        <div className="flex gap-2 justify-center mb-2">
                                            <p className="text-lg font-semibold text-primary2">${product.price.toFixed(2)}</p>
                                            <p className="text-sm font-semibold text-primary1light mt-1.5 line-through">${product.raw_price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex justify-center mb-2">
                                            <StarRating rating={product.rating} />
                                        </div>


                                    </div>

                                </div>
                               
                            </div>

                           {!admin && 
                            <AddToCartButton isGrid={false} productId={product._id} dataProductId={`${sectionId}-${product._id}`} handleHover={handleHover} handleMouseLeave={handleMouseLeave}/>
                          }
                             
                        </div>
                        
                    ))}
                </div>

                <NavigationButton setCanScrollAutomatic={setCanScrollAutomaticProducts} containerRef={productContainerRef}/>
                
            </div>
        </section>
     );
}
 
export default ProductsList;