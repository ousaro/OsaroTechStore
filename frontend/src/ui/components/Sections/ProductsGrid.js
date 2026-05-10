
import {useState} from "react"
import StarRating from "../OtherComponents/StarRating"
import WishlistButton from "../Buttons/WishlistButton"
import AddToCartButton from "../Buttons/AddToCartButton"
import OpenEye from "../../../assets/icons/openEyeIcon.svg"
import { Link } from "react-router-dom"
import Modal from "react-modal"
import { useAuthContext } from "../../../core/auth/useAuthContext"
import { useProductsContext } from "../../../core/app-context/useProductsContext"
import {deleteProduct} from "../../../infrastructure/api/products"
import { updateUser } from "../../../infrastructure/api/users"
import {useUsersContext} from "../../../core/app-context/useUsersContext"
import { openModal, closeModal } from "../../../shared/utils/utils"
import {toast} from "react-hot-toast"
import LoadingOverlay from "../OtherComponents/LoadingOverlay"




const ProductsGrid = ({products,category, admin}) => {
  
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

        setIsDeleting(true)
          const {json, ok} = await deleteProduct(user, productId)

          if(!ok){
            toast.error(json.error)
          }else{ 
            dispatch({ type: "DELETE_PRODUCT", payload: json });

             await  handleUsersCartUpdate(productId)
            
             toast.success("Item remouved successfuly")
              
          }
          setIsDeleting(false)

         
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
        <section className="featured-products mb-8 flex-1 font-roboto">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary2">Browse collection</p>
                <h2 className="text-3xl font-extrabold text-primary1">{category}</h2>
              </div>
              <p className="text-sm font-medium text-slate-500">{products?.length || 0} products found</p>
            </div>
            <div className="">
                <div className="grid grid-cols-1 gap-5 p-1 sm:grid-cols-2 xl:grid-cols-3">
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
                                  

                                   

                                    <div className="absolute right-3 top-3">
                                      <button className="grid h-9 w-9 place-items-center rounded-md bg-white shadow-sm ring-1 ring-slate-200 transition hover:ring-primary4">
                                        <img src={OpenEye} alt="View Detail" className="w-5 h-5 opacity-60 hover:opacity-100 transition duration-300 ease-in-out" onClick={() => openModal(product.image, setSelectedImage, setModalIsOpen)}/>
                                      </button>
                                        <Modal isOpen={modalIsOpen} onRequestClose={() => closeModal(setSelectedImage, setModalIsOpen)} className="modalContent"  overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40">
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

                  <LoadingOverlay show={isDeleting}  message={"Deleting product..."}/>
                
            </div>
        </section>
     );
}
 
export default ProductsGrid;
