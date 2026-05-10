
import StarRating from "../OtherComponents/StarRating"
import WishlistButton from "../Buttons/WishlistButton"
import AddToCartButton from "../Buttons/AddToCartButton"
import NavigationButton from "../Buttons/NavigationButton"
import OpenEye from "../../../assets/icons/openEyeIcon.svg"
import { Link } from "react-router-dom"
import { useState } from "react"
import Modal from "react-modal"
import { openModal, closeModal } from "../../../shared/utils/utils"
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
        <section className="featured-products mb-12 font-roboto">
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-extrabold text-primary1 md:text-3xl">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-primary4 text-primary2">
                  <FaShoppingCart />
                </span>
                {name}
            </h2>
            <div className="">
                <div ref={productContainerRef} data-name="productContainerRef" className="flex gap-5 overflow-x-auto hide-scrollbar p-2 pb-4">
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

                                    <div className="absolute right-3 top-3">
                                      <button className="grid h-9 w-9 place-items-center rounded-md bg-white shadow-sm ring-1 ring-slate-200 transition hover:ring-primary4">
                                        <img src={OpenEye} alt="View Detail" className="w-5 h-5 opacity-60 hover:opacity-100 transition duration-300 ease-in-out" onClick={() => openModal(product.image, setSelectedImage, setModalIsOpen)}/>
                                      </button>
                                      <Modal isOpen={modalIsOpen} onRequestClose={() => closeModal(setSelectedImage, setModalIsOpen)} className="modalContent "  overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40">
                                            <div className="  w-full">
                                            {selectedImage && <img src={selectedImage} alt="Selected" className="h-64 md:h-96 m-auto" />}
                                              <button onClick={() => closeModal(setSelectedImage, setModalIsOpen)} className="flex m-auto text-white bg-primary1 hover:bg-primary2 py-1 px-4 rounded-md mt-2 ">Close</button>
                                            </div>
                                        </Modal>
                                    </div>

                                    <h1 className="mt-3 text-center text-sm font-semibold uppercase tracking-wide text-slate-400">{product.category}</h1>

                                    <div className="px-4 pb-14 pt-1">
                                        <Link to={`/CardDetail/${product._id}`}><h3 className="mb-2 min-h-14 text-center text-lg font-bold leading-snug hover:text-primary2">{product.name}</h3></Link>

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
