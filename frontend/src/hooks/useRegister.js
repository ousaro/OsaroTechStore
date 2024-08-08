import { useState } from "react";
import { useAuthContext } from "./useAuthContext";



export const useRegister = () =>{

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [next, setNext] = useState(false)
    const {dispatch} = useAuthContext();

    const register = async (firstName,lastName,email,password, confirmPassword, picture) => {

        try{
            setIsLoading(true);
            setError(null);
            setIsLoading(false);

            const response = await fetch('/api/users/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({firstName,lastName,email,password, confirmPassword, picture})
            });

            
            const user = await response.json();
            
            if(!response.ok){
                setIsLoading(false);
                setError(user.error)
                setNext(false)

                throw new Error(user.error); // Throw an error to be caught in toast.promise
            }

            if(response.ok){

                // store the json output in the localStorage
                localStorage.setItem('user', JSON.stringify(user))
                // update the authcontext
                dispatch({type: 'LOGIN', payload: user})

                setIsLoading(false);
                setNext(true)
            }
        }catch (error) {
            throw error; // Propagate the error to be caught in toast.promise
        }

        
    }
        

    return {
        isLoading,
        error,
        register,
        next}

}