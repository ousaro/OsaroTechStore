import React, { useState } from 'react';
import ShippingAddress from '../../../ui/components/PlaceOrderComponents/ShippingAddress';
import { useEffect } from 'react';
import { useAuthContext } from '../../../core/auth/useAuthContext';
import {useProductsContext} from "../../../core/app-context/useProductsContext"
import { addNewOrder } from '../../../infrastructure/api/orders';
import { updateProduct } from '../../../infrastructure/api/products';
import { updateUser } from '../../../infrastructure/api/users';
import { addNewPayment } from '../../../infrastructure/api/payment';
import { updateLocalStorage } from '../../../shared/utils/utils';
import {toast} from "react-hot-toast"
import LoadingOverlay from '../../../ui/components/OtherComponents/LoadingOverlay';


const ShippingAddressForm = () => {

    const {user, dispatch} = useAuthContext()
    const {products } = useProductsContext()
    const [cartProducts, setCartProducts] = useState([]);

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

   // Place the order
    const placeOrder = async () => {
          
      setSubmitting(true)
        const orderData = {
            orderLines: cartProducts.map((product) => ({
              productId: product._id,
              name: product.name,
              price: product.price,
              quantity: product.quantity,
            })),
            deliveryAddress: {
              street: shippingAddress.addressLine,
              city: shippingAddress.city,
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country,
            },
            currency: "USD",
          };

        const {json, ok} = await addNewOrder(user, orderData)

        if (!ok) {

          toast.error(json.error)

          
        } else {

          await handleSalesUpdate(cartProducts);

          const paymentItems = cartProducts.map((product) => ({
            name: product.name,
            price: product.price,
            quantity: product.quantity,
          }));

          const { url, ok: paymentOk, json: paymentJson } = await addNewPayment(user, {
            orderId: json._id,
            items: paymentItems,
            currency: "USD",
          });

          if (!paymentOk || !url) {
            toast.error(paymentJson?.error || "Payment could not be started.");
            return;
          }

          await handleClearCart();
          window.location.href = url;
            
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
