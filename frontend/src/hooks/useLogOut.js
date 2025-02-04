import { useAuthContext } from "./useAuthContext";

export const useLogOut = () => {

    const {dispatch} = useAuthContext();

    const logOut = async () => {
    
        // clear the json  in the localStorage
        localStorage.removeItem('user')
        dispatch({type: 'LOGOUT'})
    
    }


    return {logOut}

}

