import { useState } from "react";
import { useAuthContext } from "./useAuthContext";


export const useLogIn = () =>{

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [next, setNext] = useState(false)
    const {dispatch} = useAuthContext();
      

    const logIn = async (email, password) => {

        try {
            setIsLoading(true);
            setError(null);
    
            const response = await fetch("/api/users/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });
    
            const user = await response.json();
    
            if (!response.ok) {
                setIsLoading(false);
                setError(user.error);
                setNext(false);
                throw new Error(user.error); // Throw an error to be caught in toast.promise
            }
    
            // Store the json output in the localStorage
            localStorage.setItem('user', JSON.stringify(user));
            // Update the auth context
            dispatch({ type: 'LOGIN', payload: user });
    
            setIsLoading(false);
            setNext(true);
    
            return user; // Resolve the promise with user data

        } catch (error) {
            throw error; // Propagate the error to be caught in toast.promise
        }


    }







    return {
        logIn,
        isLoading,
        error,
        next}

}


