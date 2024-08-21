import React, { useState } from 'react';
import ShippingAddress from '../../components/PlaceOrderComponents/ShippingAddress';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import {useProductsContext} from "../../hooks/useProductsContext"
import { addNewOrder } from '../../api/orders';
import { updateProduct } from '../../api/products';
import { updateUser } from '../../api/users';
import { getSessionById } from '../../api/sessions';
import { updateLocalStorage } from '../../utils/utils';
import {toast} from "react-hot-toast"
import LoadingOverlay from '../../components/OtherComponents/LoadingOverlay';


const ShippingAddressForm = () => {

    const {user, dispatch} = useAuthContext()
    const {products } = useProductsContext()
    const [cartProducts, setCartProducts] = useState([]);

    const location = useLocation();
    const [sessionDetails, setSessionDetails] = useState(null);

    const [shippingAddress, setShippingAddress] = useState({
        addressLine: "",
        city: "",
        postalCode: "",
        country: ""
    });

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


    // Fetch the session details
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const sessionId = query.get('session_id');

        const fetchSessionDetails = async (sessionId) => {

          const {data, ok} = await getSessionById(user, sessionId)

          if(!ok) {
            toast.error(data.error)
          }
          else{
            setSessionDetails(data);
          }
          
        };
  
    
        if (sessionId) {
          fetchSessionDetails(sessionId);
        }
      }, [location,user]);


   // Place the order
    const placeOrder = async () => {
          
      setSubmitting(true)
        // Define the order data
        const orderData = {
            ownerId: user._id,
            products: cartProducts,
            totalPrice: Number(sessionDetails.amount_total) / 100, // Stripe amount is in cents
            status: "Pending", // Can be 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled
            address: shippingAddress,
            paymentMethod: sessionDetails.payment_method_types[0], // Assuming only one payment method is used
            paymentStatus: sessionDetails.payment_status,
            transactionId: sessionDetails.payment_intent,
            paymentDetails: sessionDetails,
          };

        const {json, ok} = await addNewOrder(user, orderData)

        if (!ok) {

          toast.error(json.error)

          
        } else {

          // Update sales count for each product
          await handleSalesUpdate(cartProducts);
          
          
          // Clear the cart after placing the order
          await handleClearCart();
          // Redirect to the cart page
          window.location.href = '/Cart';

          toast.success("Your order has been placed successfully");
            
        }

        setSubmitting(false)

       
    };


    const handleSalesUpdate = async (cartProducts) => {
      try {
        // Collect all update promises
        const updatePromises = cartProducts.map(async product => {

          const update = {
            salesCount: product.salesCount + product.quantity,
            lastSold: new Date(),
            countInStock: product.countInStock - product.quantity,
          }

          const {json, ok} = await updateProduct(user, product._id, update)
         
          if (!ok) {
            toast.error(json.error)
          }

          return json;
        });
    
        // Wait for all updates to complete
        await Promise.all(updatePromises);
    
       

      } catch (error) {
         
        toast.error(error.message)
       
      }
    };




    const handleClearCart = async () => {

      const update = {cart: []}

      const {json, ok}  = await updateUser(user, user._id, update)

      if(!ok){
        toast.error(json.error)
      }else{
          updateLocalStorage(json)

          dispatch({ type: "UPDATE_USER", payload: json });
      }

  }


    if (!sessionDetails) {
        return (
            <div className="flex justify-center items-center min-h-screen">
              <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          );;
      }

    

    return (
        <div className="text-gray-800 font-roboto">
            
            <main className="xl:w-10/12 xl:m-auto p-4 flex flex-col gap-5">
               
                
                <ShippingAddress
                    shippingAddress={shippingAddress}
                    setShippingAddress={setShippingAddress}
                />

                <div className="flex gap-2">
                    <button onClick={placeOrder} className="bg-primary1 hover:bg-primary2 text-white px-4 py-2 rounded">
                    Place Order
                    </button>
                </div>

                <LoadingOverlay show={submitting} message={"Submitting order... "}/>
               
            </main>
            
        </div>
    );
};

export default ShippingAddressForm;
