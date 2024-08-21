import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import {useProductsContext} from "../../hooks/useProductsContext"
import {loadStripe} from "@stripe/stripe-js"
import { updateUser } from '../../api/users';
import { addNewPayment } from '../../api/payment';
import {toast} from "react-hot-toast"
import { updateLocalStorage } from '../../utils/utils';
import LoadingOverlay from '../../components/OtherComponents/LoadingOverlay';


const Cart = () => {

    const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
    loadStripe(stripePublicKey)

    const { user, dispatch } = useAuthContext();
    const {products } = useProductsContext()
    const [cartProducts, setCartProducts] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const [submitting, setSubmitting] = useState(false);

    // Set the cart products with their quantities
    useEffect(() => {
        // Function to set the cart products with their quantities
        const updateCartProducts = () => {
            const cartProductIds = user.cart.map(item => item._id); // Get the product IDs from the cart
    
            const updatedCartProducts = products
            .filter(product => cartProductIds.includes(product._id)) // Filter products that are in the cart
            .map(product => ({
                ...product,
                quantity: user.cart.find(item => item._id === product._id).quantity // Add the quantity from the cart to each product
            }));
    
            setCartProducts(updatedCartProducts);
        };
  
     
        if (user && user.cart) {
            updateCartProducts();
          
        }

              
    }, [user,products]);


    // Calculate the total price of the cart products
    useEffect(() => {
       const calculateTotalPrice = () => {
            const total = cartProducts.reduce((acc, item) => acc + item.price * item.quantity, 0);
            setTotalPrice(total);
        };

        if (user && user.cart) {
            calculateTotalPrice();
        }
        
    }, [cartProducts,user]);


    // Remove an item from the cart
    const handleRemoveItem = async (productId) => {

        const update = {cart: user.cart.filter((item) => item._id !== productId)}
        
        const {json, ok} = await updateUser(user, user._id, update )

        if(!ok){
            toast.error(json.error)
        }
        else{
            updateLocalStorage(json)

            dispatch({ type: "UPDATE_USER", payload: json });

            // get the product name 
            const product = products.find((product) => product._id === productId)
            toast.success(`${product.name} has been removed from your cart.`)
        }


    }


    const handleCheckout = async () => {

        setSubmitting(true)
        const items = {items: cartProducts}

        const {url, ok} = await addNewPayment(user, items)

        if(!ok){
            toast.error("An error occurred. Please try again.")
        }else{
            // Redirect to the Stripe Checkout URL
            window.location.href = url;
    
        }

        setSubmitting(false)
        
    }
    
    return (
        <div className="text-gray-800 font-roboto">
         
            <main className="xl:w-10/12 xl:m-auto p-4 flex flex-col gap-5">
                <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
                {cartProducts.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    cartProducts.map((item) => (
                        <div key={item._id} className="flex justify-between items-center border-b-4 border-b py-4">
                            <div className="flex items-center gap-5">
                                <img src={item.image} alt={item.name} className="w-24 object-cover mr-4" />
                                <div>
                                    <div>
                                        <Link to={`/CardDetail/${item._id}`}><h2 className="text-xl font-bold">{item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}</h2></Link>
                                        <p className="text-gray-600">${item.price.toFixed(2)} USD</p>
                                    </div>
                                    <div>
                                        <p className="text-l font-bold font-bold">Quantity: {item.quantity}</p>
                                        <p className="text-l font-bold mb-2 font-bold">Total: <span className='text-green-700'>${(item.price * item.quantity).toFixed(2)} USD</span></p>
                                    </div>
                                </div>
                            </div>
                            <button
                                className="bg-primary2 text-white px-4 py-2 rounded"
                                onClick={() => handleRemoveItem(item._id)}
                            >
                                Remove
                            </button>
                        </div>
                    ))
                )}
                
                {cartProducts.length > 0 && (
                    <div className="mt-4 flex flex-col items-end">
                        <div className="text-xl font-bold mb-2">Total: <span className='text-green-700'>${totalPrice.toFixed(2)} USD</span> </div>
                        <button className="bg-primary1 hover:bg-primary2 text-white px-4 py-2 rounded" onClick={handleCheckout}>Checkout</button>
                    </div>
                )}

                <LoadingOverlay show={submitting} message={"Please wait..."}/>
                
            </main>
            
        </div>
    );
};

export default Cart;

