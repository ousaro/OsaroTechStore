
import {useState} from "react"
import StarRating from "../OtherComponents/StarRating"
import WishlistButton from "../Buttons/WishlistButton"
import AddToCartButton from "../Buttons/AddToCartButton"
import OpenEye from "../../img/icons/openEyeIcon.svg"
import { Link } from "react-router-dom"
import Modal from "react-modal"
import { useAuthContext } from "../../hooks/useAuthContext"
import { useProductsContext } from "../../hooks/useProductsContext"
import {deleteProduct} from "../../api/products"
import { updateUser } from "../../api/users"
import {useUsersContext} from "../../hooks/useUsersContext"
import { openModal, closeModal } from "../../utils/utils"
import {toast} from "react-hot-toast"




const ProductsGrid = ({products,category, admin}) => {
  
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const {user} = useAuthContext();
  const {dispatch} = useProductsContext();
  const {users} = useUsersContext()

 
    
    const handleHover = (event) => {
        const productId = event.currentTarget.getAttribute('data-product-id');
        const productActions = document.querySelector(`.product-actions-grid[data-product-id="${productId}"]`);
        const productCard = document.querySelector(`.product-card-grid[data-product-id="${productId}"]`);
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
        const productActions = document.querySelector(`.product-actions-grid[data-product-id="${productId}"]`);
        const productCard = document.querySelector(`.product-card-grid[data-product-id="${productId}"]`);
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

      const handleProductDelete = async (productId) => {

          const {json, ok} = await deleteProduct(user, productId)

          if(!ok){
            toast.error(json.error)
          }else{ 
            dispatch({ type: "DELETE_PRODUCT", payload: json });

             await  handleUsersCartUpdate(productId)
            
             toast.success("Item remouved successfuly")
              
          }

         
    };


    const handleUsersCartUpdate = async (productId) => {
      try {
        // Collect all update promises
        const updatePromises = users.map(async client => {

          const update = {
           cart:[...client.cart.filter((item) => item._id !== productId)]
          }

          const {json, ok} = await updateUser(user, client._id, update)

          
         
          if (!ok) {
            toast.error(json.error)
            
          }
          return json;
        });
    
        // Wait for all updates to complete
        await Promise.all(updatePromises)


      } catch (error) {
         
        toast.error(error.message)
        
      }
    
    };


  
    return ( 
        <section className="featured-products mb-8 font-roboto">
            <h2 className="text-3xl font-bold mb-6">{category}</h2>
            <div className="">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 m-auto gap-2 p-2">
                    {products && products.length > 0 ? products.map((product) => (
                        <div className='product-container-grid '  key={product._id}>

                            <div key={product._id} className="product-card-grid relative "  data-product-id={product._id}  onMouseEnter={handleHover} onMouseLeave={handleMouseLeave}>
                                <div className="overflow-hidden">
                                    <img src={product.image} alt={product.name} className="product-img " data-product-id={product._id} />


                                    {product.isNewProduct && 
                                        <div className="absolute top-0 right-0 m-2 bg-primary2 text-white px-2 py-1 rounded-md">
                                            <p className="text-xs font-bold">New</p>
                                        </div>
                                    }
                                    
                                    <div className="absolute left-2 bottom-1">

                                          {!admin ? (
                                          <WishlistButton productId={product._id}/>
                                        ) :
                                        (
                                            <button
                                                type="button"
                                                onClick={() => handleProductDelete(product._id)}
                                                className="hover:text-primary2 text-primary1light"
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
                                        )}
                                      
                                    </div>
                                  

                                   

                                    <div className="absolute right-2 bottom-2">
                                      <button>
                                        <img src={OpenEye} alt="View Detail" className="w-6 h-6 opacity-25 hover:opacity-50 transition duration-300 ease-in-out" onClick={() => openModal(product.image, setSelectedImage, setModalIsOpen)}/>
                                      </button>
                                        <Modal isOpen={modalIsOpen} onRequestClose={() => closeModal(setSelectedImage, setModalIsOpen)} className="modalContent"  overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40">
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
                            <AddToCartButton isGrid={true} productId={product._id} dataProductId={product._id} handleHover={handleHover} handleMouseLeave={handleMouseLeave}/>
                            }
                             
                        </div>
                        
                    )) :
                    (
                      <div className="notFound ">
                          No products found
                      </div>
                  )}
                </div> 

                
            </div>
        </section>
     );
}
 
export default ProductsGrid;