import { useAuthContext } from "../../../core/auth/useAuthContext"
import CartIcon from "../../../assets/icons/cartIconPrimary2.svg"
import { updateUser } from "../../../infrastructure/api/users";
import { useState, useEffect } from "react";
import { updateLocalStorage } from "../../../shared/utils/utils";
import { useProductsContext } from "../../../core/app-context/useProductsContext"; 
import {toast} from "react-hot-toast"
import PropTypes from "prop-types";

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

        if (ok) {
            updateLocalStorage(json);
            dispatch({ type: 'UPDATE_USER', payload: json });
            toast.success(`1 item is added to your cart`)
        } else {
            toast.error(json.error)
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

    const handleButtonMouseEnter = (event) => {
        handleHover(event);
        handleHoverAddToCart(event);
    };

    const handleButtonMouseLeave = (event) => {
        handleMouseLeave(event);
        handleMouseLeaveAddToCart(event);
    };

    return ( 
        <button
            type="button"
            className={`${isGrid ? "product-actions-grid" : "product-actions"} cartButton ${disableAddToCart ? "bg-gray-400" : "bg-primary2 cartButtonHover"}`}
            data-product-id={dataProductId}
            onMouseEnter={handleButtonMouseEnter}
            onMouseLeave={handleButtonMouseLeave}
            onClick={handleAddToCart}
            disabled={disableAddToCart}
        >
            <img src={CartIcon} alt="cartIcon" className='cartImg'/> 
            <span className="m-auto">Add to Cart</span>
        </button>
    );
}

AddToCartButton.propTypes = {
    isGrid: PropTypes.bool.isRequired,
    productId: PropTypes.string.isRequired,
    dataProductId: PropTypes.string.isRequired,
    handleHover: PropTypes.func.isRequired,
    handleMouseLeave: PropTypes.func.isRequired,
};
 
export default AddToCartButton;
