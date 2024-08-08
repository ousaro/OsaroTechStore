import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { updateUser } from '../../api/users';
import { updateLocalStorage } from '../../utils/utils';
import {toast} from "react-hot-toast"

const WishlistButton = ({productId}) => {

    const { user, dispatch } = useAuthContext();

    const [isWishlisted, setIsWishlisted] = useState(false);


    useEffect(() => {
        if (user && user.favorites.includes(productId)) {
            setIsWishlisted(true);
        }
    }, [user, productId]);

    const toggleWishlist = () => {
        if (isWishlisted) {
            handleRemoveFromFavorites(productId);
        } else {
            handleAddToFavorites(productId);
        }
        setIsWishlisted(!isWishlisted);
    };

   
    const handleAddToFavorites = async () => {


        if(user.favorites.includes(productId)){
            toast.error("Product already exist in favorite")
            return;
        }

        const update = {favorites : [...user.favorites, productId]}

        const {json, ok} = await updateUser(user, user._id, update)

        if(!ok){
            toast.error(json.error)
        }else{
            updateLocalStorage(json)
            
            dispatch({ type: "UPDATE_USER", payload: json });
            toast.success(`The product is added to your favorite`)
        }

    }


    
    const handleRemoveFromFavorites = async (productId) => {

       

        const update = { favorites: user.favorites.filter((item) => item !== productId)}

        const {json, ok} = await updateUser(user,user._id, update)

        if(!ok){
            toast.error(json.error)
        }else{
            updateLocalStorage(json)

            dispatch({ type: "UPDATE_USER", payload: json });
            toast.success(`The product is removed to your favorite`)
        }
    }


    return (
        <div className="flex justify-center py-2">
            <button
                className={`w-5 h-5 hover:text-primary2 ${isWishlisted ? "text-primary2" : "text-primary1light"} rounded-full flex items-center justify-center transition duration-300 ease-in-out`}
                onClick={toggleWishlist}
            >
                {isWishlisted ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                    >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6"
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.35l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                )}
            </button>
        </div>
    );
};

export default WishlistButton;
