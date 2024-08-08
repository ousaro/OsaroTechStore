import { useAuthContext } from "../../hooks/useAuthContext"
import CartIcon from "../../img/icons/cartIconPrimary2.svg"
import { updateUser } from "../../api/users";
import { useState, useEffect } from "react";
import { updateLocalStorage } from "../../utils/utils";
import { useProductsContext } from "../../hooks/useProductsContext"; 
import {toast} from "react-hot-toast"

const AddToCartButton = ({isGrid, productId, dataProductId, handleHover, handleMouseLeave}) => {

    const {user, dispatch} = useAuthContext();
    const {products} = useProductsContext();
    
    const [stockCount, setStockCount] = useState(0);
    const [disableAddToCart, setDisableAddToCart] = useState(false);
    const [existInCart, setExistInCart] = useState(false);
   
    
    const handleHoverAddToCart = (event) => {
        event.currentTarget.querySelector('.cartImg').classList.add('showImg');
       
    }

    const handleMouseLeaveAddToCart = (event) => {
        event.currentTarget.querySelector('.cartImg').classList.remove('showImg');
    }

    // Add product to cart
    const handleAddToCart = async () => {

        let updatedCart;

        if (existInCart) {
            // If product exists, increase its quantity
            updatedCart = user.cart.map(item => 
                (item._id === productId) ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            // If product doesn't exist, add it to the cart with quantity 1
            updatedCart = [...user.cart, { _id: productId, quantity: 1 }];
           
        }

        const update = { cart: updatedCart };

        const { json, ok } = await updateUser(user, user._id, update);

        if (!ok) {
            toast.error(json.error)
        } else {
            updateLocalStorage(json);
            dispatch({ type: 'UPDATE_USER', payload: json });
            toast.success(`1 item is added to your cart`)
        }
    };

    // Check if product exist in cart
    useEffect(()=>{

        const product = products.find(product => product._id === productId);
        setStockCount(product.countInStock);

        const existingProduct = user.cart.find(item => item._id === productId);

        let quantityToBuy = 0;
       

        if(existingProduct){
            setExistInCart(true)
            quantityToBuy = existingProduct.quantity + 1;
           
        }else{
            setExistInCart(false)
            quantityToBuy = 1
        }

        if(quantityToBuy <= stockCount){
            setDisableAddToCart(false)
        }else{
            setDisableAddToCart(true)
        }


    },[products,productId, user,stockCount])


    return ( 
        <div className={`${!isGrid ? "product-actions " : "product-actions-grid"}`} data-product-id={dataProductId} onMouseEnter={handleHover} onMouseLeave={handleMouseLeave}>
            <button 
                className={`cartButton ${disableAddToCart ? "bg-gray-400" : " bg-primary2 cartButtonHover"}`} 
                onMouseEnter={handleHoverAddToCart} 
                onMouseLeave={handleMouseLeaveAddToCart}
                onClick={handleAddToCart}
                disabled={disableAddToCart}
            >
                <img src={CartIcon} alt="cartIcon" className='cartImg'/> 
                <p className="m-auto">Add to Cart</p>
            </button>
        </div>
    );
}
 
export default AddToCartButton;
