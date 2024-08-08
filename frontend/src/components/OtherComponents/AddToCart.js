import { useAuthContext } from '../../hooks/useAuthContext';
import { updateUser } from '../../api/users';
import { updateLocalStorage } from '../../utils/utils';
import {toast} from "react-hot-toast"



const AddToCart = ({cardId,product, setQuantity, quantity, disableAddToCart, productExistInCart}) => {

    const {user, dispatch} = useAuthContext();

    const handleAddToCart = async () => {

        let updatedCart;

        if (productExistInCart) {
          // If the product exists, increase its quantity
            updatedCart = user.cart.map(item =>
                (item._id === cardId) ? { ...item, quantity: item.quantity + quantity } : item
            );
        } else {

          // If the product doesn't exist, add it to the cart with initial quantity
          updatedCart = [...user.cart, { _id: cardId, quantity }]

        }


        const update = {cart: updatedCart}

        const {json, ok} = await updateUser(user, user._id, update)

        if(!ok){
          toast.error(json.error)
        }
        else{
           updateLocalStorage(json)

            dispatch({ type: "UPDATE_USER", payload: json });
            toast.success(`${quantity} ${product.name} added to your cart`)
        }

      
    }


    return ( 
        <div className='flex gap-6'>
                  <div className="flex  gap-2 text-xl text-primary1 border py-1 px-2 pl-4">
                      <button  onClick={() => setQuantity(quantity - 1)} disabled={quantity <= 1}>-</button>
                      <span>{quantity}</span>
                      <button  onClick={() => setQuantity(quantity + 1)}>+</button>
                  </div>

                  <div className="flex gap-2">
                      <button className={`text-white px-4 py-2 rounded  ${disableAddToCart? 'bg-primary1light': 'bg-primary1  hover:bg-primary2'}`} 
                      onClick={handleAddToCart} 
                      disabled={disableAddToCart}>Add to Cart</button>
                  </div>
            </div> 
     );
}
 
export default AddToCart;